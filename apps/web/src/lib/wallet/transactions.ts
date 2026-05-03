import type { Eip1193Provider } from "./eip1193";

export type PreparedWalletTransaction = {
  label: string;
  to: string;
  value: string;
  data: string;
};

const walletReceiptTimeoutMs = 150_000;
const walletReceiptPollMs = 3_000;
const lowCostPriorityFeeWei = 500_000_000n;
const lowCostFeeMultiplierNumerator = 12n;
const lowCostFeeMultiplierDenominator = 10n;

export async function sendWalletTransactions(transactions: PreparedWalletTransaction[], chainId: number): Promise<string[]> {
  const provider = typeof window === "undefined" ? undefined : window.ethereum;
  if (provider === undefined) {
    throw new Error("No EIP-1193 wallet provider is available.");
  }

  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: `0x${chainId.toString(16)}` }]
  });
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const from = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : undefined;
  if (from === undefined) {
    throw new Error("Wallet did not return a parent account.");
  }

  await assertNoPendingWalletTransaction(provider, from);

  const hashes: string[] = [];
  for (const transaction of transactions) {
    const txParams = await buildLowCostWalletTransaction(provider, {
      from,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      label: transaction.label
    });
    const hash = await provider.request({
      method: "eth_sendTransaction",
      params: [txParams]
    });
    if (typeof hash !== "string" || !hash.startsWith("0x")) {
      throw new Error(`${transaction.label} did not return a transaction hash.`);
    }
    await waitForSuccessfulWalletReceipt(provider, hash, transaction.label);
    hashes.push(hash);
  }
  return hashes;
}

export async function sendNativeTransfer(input: { chainId: number; to: string; valueWei: bigint }): Promise<string> {
  const provider = typeof window === "undefined" ? undefined : window.ethereum;
  if (provider === undefined) {
    throw new Error("No EIP-1193 wallet provider is available.");
  }

  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: `0x${input.chainId.toString(16)}` }]
  });
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const from = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : undefined;
  if (from === undefined) {
    throw new Error("Wallet did not return a parent account.");
  }

  await assertNoPendingWalletTransaction(provider, from);

  const hash = await provider.request({
    method: "eth_sendTransaction",
    params: [
      await buildLowCostWalletTransaction(provider, {
        from,
        to: input.to,
        value: `0x${input.valueWei.toString(16)}`,
        data: "0x",
        label: "Funding transaction"
      })
    ]
  });
  if (typeof hash !== "string" || !hash.startsWith("0x")) {
    throw new Error("Funding transaction did not return a transaction hash.");
  }
  return hash;
}

async function assertNoPendingWalletTransaction(provider: Eip1193Provider, address: string): Promise<void> {
  try {
    const [latest, pending] = await Promise.all([
      provider.request({ method: "eth_getTransactionCount", params: [address, "latest"] }),
      provider.request({ method: "eth_getTransactionCount", params: [address, "pending"] })
    ]);
    if (typeof latest !== "string" || typeof pending !== "string" || !latest.startsWith("0x") || !pending.startsWith("0x")) {
      return;
    }
    if (BigInt(pending) > BigInt(latest)) {
      throw new Error(
        "The parent wallet already has a pending transaction on this network. Wait for it to confirm or cancel it in the wallet activity panel, then reopen this step."
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("already has a pending transaction")) {
      throw error;
    }
  }
}

async function waitForSuccessfulWalletReceipt(provider: Eip1193Provider, hash: string, label: string): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < walletReceiptTimeoutMs) {
    const receipt = await provider.request({
      method: "eth_getTransactionReceipt",
      params: [hash]
    });

    if (receipt !== null && typeof receipt === "object") {
      const status = "status" in receipt ? (receipt as { status?: unknown }).status : undefined;
      if (status === "0x1" || status === "0x01") {
        return;
      }
      if (status === "0x0" || status === "0x00") {
        throw new Error(`${label} reverted onchain. Transaction: ${hash}`);
      }
    }

    await sleep(walletReceiptPollMs);
  }

  throw new Error(`${label} is still pending after ${Math.round(walletReceiptTimeoutMs / 1000)} seconds. Transaction: ${hash}. Wait for it to confirm, then retry this step.`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function buildLowCostWalletTransaction(
  provider: Eip1193Provider,
  request: { from: string; to: string; value: string; data: string; label: string }
): Promise<Record<string, string>> {
  const transaction: Record<string, string> = {
    from: request.from,
    to: request.to,
    value: request.value,
    data: request.data
  };

  const [gas, fees] = await Promise.all([estimateGasLimit(provider, transaction), estimateLowCostFees(provider)]);
  transaction.gas = gas;
  if (fees !== undefined) {
    transaction.type = "0x2";
    transaction.maxPriorityFeePerGas = fees.maxPriorityFeePerGas;
    transaction.maxFeePerGas = fees.maxFeePerGas;
  }

  return transaction;
}

async function estimateGasLimit(provider: Eip1193Provider, transaction: Record<string, string>): Promise<string> {
  try {
    const value = await provider.request({
      method: "eth_estimateGas",
      params: [transaction]
    });
    if (typeof value !== "string" || !value.startsWith("0x")) {
      throw new Error("wallet returned no gas estimate");
    }
    const estimated = BigInt(value);
    return `0x${((estimated * lowCostFeeMultiplierNumerator) / lowCostFeeMultiplierDenominator).toString(16)}`;
  } catch (error) {
    const detail = walletErrorMessage(error);
    throw new Error(
      `Wallet gas estimation failed before opening the approval prompt. This usually means the ENS parent is not controlled by the connected wallet, the transaction would revert, or a pending nonce is blocking estimation. Details: ${detail}`
    );
  }
}

async function estimateLowCostFees(provider: Eip1193Provider): Promise<{ maxFeePerGas: string; maxPriorityFeePerGas: string } | undefined> {
  try {
    const feeHistory = await provider.request({
      method: "eth_feeHistory",
      params: ["0x1", "latest", []]
    });
    const baseFees = typeof feeHistory === "object" && feeHistory !== null ? (feeHistory as { baseFeePerGas?: unknown }).baseFeePerGas : undefined;
    const latestBaseFeeHex = Array.isArray(baseFees) && typeof baseFees.at(-1) === "string" ? baseFees.at(-1) : undefined;
    if (latestBaseFeeHex === undefined || !latestBaseFeeHex.startsWith("0x")) {
      return undefined;
    }

    const baseFee = BigInt(latestBaseFeeHex);
    const priorityFee = await readBoundedPriorityFee(provider);
    const maxFee = (baseFee * lowCostFeeMultiplierNumerator) / lowCostFeeMultiplierDenominator + priorityFee;
    return {
      maxFeePerGas: `0x${maxFee.toString(16)}`,
      maxPriorityFeePerGas: `0x${priorityFee.toString(16)}`
    };
  } catch {
    return undefined;
  }
}

async function readBoundedPriorityFee(provider: Eip1193Provider): Promise<bigint> {
  try {
    const value = await provider.request({ method: "eth_maxPriorityFeePerGas" });
    if (typeof value === "string" && value.startsWith("0x")) {
      const suggested = BigInt(value);
      return suggested > lowCostPriorityFeeWei ? lowCostPriorityFeeWei : suggested;
    }
  } catch {
    // Fall through to the fixed low-cost priority fee.
  }
  return lowCostPriorityFeeWei;
}

function walletErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  if (typeof error === "string" && error.length > 0) {
    return error;
  }
  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    for (const key of ["message", "shortMessage", "reason"]) {
      const value = record[key];
      if (typeof value === "string" && value.length > 0) {
        return value;
      }
    }
    for (const key of ["data", "error"]) {
      const nested = record[key];
      if (typeof nested === "object" && nested !== null) {
        const nestedMessage = walletErrorMessage(nested);
        if (nestedMessage !== "Unknown wallet provider error.") {
          return nestedMessage;
        }
      }
    }
    try {
      return JSON.stringify(record);
    } catch {
      return "Unknown wallet provider error.";
    }
  }
  return "Unknown wallet provider error.";
}
