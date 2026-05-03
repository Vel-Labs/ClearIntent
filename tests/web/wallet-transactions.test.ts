import { afterEach, describe, expect, it, vi } from "vitest";
import { sendWalletTransactions } from "../../apps/web/src/lib/wallet/transactions";
import type { Eip1193Provider } from "../../apps/web/src/lib/wallet";

type RecordedRequest = { method: string; params?: unknown };

function providerFor(responses: Record<string, unknown>): Eip1193Provider & { requests: RecordedRequest[] } {
  const requests: RecordedRequest[] = [];
  return {
    requests,
    async request(args) {
      requests.push({ method: args.method, params: args.params });
      const response = responses[args.method];
      if (response instanceof Error) {
        throw response;
      }
      return response;
    }
  };
}

function installWallet(provider: Eip1193Provider): void {
  vi.stubGlobal("window", { ethereum: provider, setTimeout });
}

describe("wallet transaction guardrails", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("blocks ENS wallet submission when the parent wallet has a pending nonce", async () => {
    const provider = providerFor({
      wallet_switchEthereumChain: null,
      eth_requestAccounts: ["0x0000000000000000000000000000000000000abc"],
      eth_getTransactionCount: "0x6"
    });
    provider.request = async (args) => {
      provider.requests.push({ method: args.method, params: args.params });
      if (args.method === "wallet_switchEthereumChain") return null;
      if (args.method === "eth_requestAccounts") return ["0x0000000000000000000000000000000000000abc"];
      if (args.method === "eth_getTransactionCount" && Array.isArray(args.params) && args.params[1] === "latest") return "0x5";
      if (args.method === "eth_getTransactionCount" && Array.isArray(args.params) && args.params[1] === "pending") return "0x6";
      return null;
    };
    installWallet(provider);

    await expect(
      sendWalletTransactions([{ label: "Create subname", to: "0xregistry", value: "0x0", data: "0x1234" }], 1)
    ).rejects.toThrow(/already has a pending transaction/);
    expect(provider.requests.map((request) => request.method)).not.toContain("eth_sendTransaction");
  });

  it("fails closed before wallet approval when gas estimation fails", async () => {
    const provider = providerFor({
      wallet_switchEthereumChain: null,
      eth_requestAccounts: ["0x0000000000000000000000000000000000000abc"],
      eth_getTransactionCount: "0x5",
      eth_estimateGas: new Error("execution reverted"),
      eth_feeHistory: { baseFeePerGas: ["0x3b9aca00", "0x3b9aca00"] },
      eth_maxPriorityFeePerGas: "0x77359400"
    });
    installWallet(provider);

    await expect(
      sendWalletTransactions([{ label: "Create subname", to: "0xregistry", value: "0x0", data: "0x1234" }], 1)
    ).rejects.toThrow(/Wallet gas estimation failed/);
    expect(provider.requests.map((request) => request.method)).not.toContain("eth_sendTransaction");
  });

  it("submits with explicit low-cost gas fields after nonce and gas preflight pass", async () => {
    const provider = providerFor({
      wallet_switchEthereumChain: null,
      eth_requestAccounts: ["0x0000000000000000000000000000000000000abc"],
      eth_getTransactionCount: "0x5",
      eth_estimateGas: "0x5208",
      eth_feeHistory: { baseFeePerGas: ["0x3b9aca00", "0x3b9aca00"] },
      eth_maxPriorityFeePerGas: "0x77359400",
      eth_sendTransaction: "0x" + "a".repeat(64),
      eth_getTransactionReceipt: { status: "0x1" }
    });
    installWallet(provider);

    const hashes = await sendWalletTransactions([{ label: "Create subname", to: "0xregistry", value: "0x0", data: "0x1234" }], 1);
    const send = provider.requests.find((request) => request.method === "eth_sendTransaction");
    const params = Array.isArray(send?.params) ? (send.params[0] as Record<string, string>) : undefined;

    expect(hashes).toEqual(["0x" + "a".repeat(64)]);
    expect(params).toMatchObject({
      gas: "0x6270",
      type: "0x2",
      maxPriorityFeePerGas: "0x1dcd6500"
    });
  });
});
