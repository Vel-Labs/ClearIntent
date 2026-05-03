import type { Address, Chain } from "viem";
import type { Eip1193Provider } from "../wallet";
import { getAlchemyReadiness } from "./readiness";

export type AgentAccountEvidence = {
  evidenceKind: "account-kit-address-derived" | "account-kit-deployment-submitted";
  accountType: "MultiOwnerModularAccount";
  parentAddress: Address;
  accountAddress: Address;
  chainId: number;
  chainName: string;
  salt: string;
  deployed: boolean;
  gasSponsored: false;
  sessionKeyEnabled: false;
  deployment?: {
    userOperationHash: string;
    transactionHash?: string;
  };
  notes: string[];
};

export type AgentAccountResult =
  | { ok: true; evidence: AgentAccountEvidence; issues: string[] }
  | { ok: false; issues: string[] };

export type AgentAccountInput = {
  provider: Eip1193Provider | undefined;
  agentEnsName: string;
  env?: Record<string, string | undefined>;
};

export function buildAgentAccountSalt(agentEnsName: string, parentAddress: string): bigint {
  const normalizedMaterial = `${agentEnsName.toLowerCase()}:${parentAddress.toLowerCase()}`;
  return BigInt(asciiHash(normalizedMaterial));
}

export async function deriveParentOwnedAgentAccount(input: AgentAccountInput): Promise<AgentAccountResult> {
  const context = await createAccountKitContext(input);
  if (!context.ok) {
    return context;
  }

  const { alchemyTransport, parentAddress, resolvedChain, salt, signer, smartContracts, viem } = context;
  const account = await smartContracts.createMultiOwnerModularAccount({
    chain: resolvedChain.chain,
    transport: alchemyTransport,
    signer,
    salt
  });
  const walletChainId = await readWalletChainId(input.provider!);
  const notes = [
    "Account Kit predicted a MultiOwnerModularAccount address from the connected parent wallet.",
    "This does not deploy the account, sponsor gas, create a session key, or prove wallet-rendered consent."
  ];
  const issues =
    walletChainId !== undefined && walletChainId !== resolvedChain.chain.id
      ? [`Connected wallet is on chain ${walletChainId}; Account Kit target chain is ${resolvedChain.chain.id}.`]
      : [];

  return {
    ok: true,
    evidence: {
      evidenceKind: "account-kit-address-derived",
      accountType: "MultiOwnerModularAccount",
      parentAddress,
      accountAddress: viem.getAddress(account.address),
      chainId: resolvedChain.chain.id,
      chainName: resolvedChain.chain.name,
      salt: salt.toString(),
      deployed: false,
      gasSponsored: false,
      sessionKeyEnabled: false,
      notes
    },
    issues
  };
}

export async function deployParentOwnedAgentAccount(input: AgentAccountInput): Promise<AgentAccountResult> {
  const context = await createAccountKitContext(input);
  if (!context.ok) {
    return context;
  }

  const { alchemyTransport, parentAddress, resolvedChain, salt, signer, smartContracts, viem } = context;
  const switchIssue = await requestWalletChain(input.provider!, resolvedChain.chain.id);
  if (switchIssue !== undefined) {
    return { ok: false, issues: [switchIssue] };
  }

  const accountClient = await smartContracts.createMultiOwnerModularAccountClient({
    chain: resolvedChain.chain,
    transport: alchemyTransport,
    signer,
    salt
  });
  const accountAddress = viem.getAddress(accountClient.account.address);

  try {
    const submitted = await accountClient.sendUserOperation({
      uo: {
        target: "0x0000000000000000000000000000000000000000",
        data: "0x",
        value: 0n
      }
    });
    const transactionHash = await accountClient
      .waitForUserOperationTransaction({
        hash: submitted.hash,
        retries: {
          maxRetries: 18,
          intervalMs: 2_000,
          multiplier: 1.2
        }
      })
      .catch(() => undefined);

    return {
      ok: true,
      evidence: {
        evidenceKind: "account-kit-deployment-submitted",
        accountType: "MultiOwnerModularAccount",
        parentAddress,
        accountAddress,
        chainId: resolvedChain.chain.id,
        chainName: resolvedChain.chain.name,
        salt: salt.toString(),
        deployed: true,
        gasSponsored: false,
        sessionKeyEnabled: false,
        deployment: {
          userOperationHash: submitted.hash,
          transactionHash
        },
        notes: [
          "Account Kit submitted a deployment UserOperation from the connected parent wallet.",
          transactionHash === undefined
            ? "The UserOperation hash was accepted, but the transaction receipt was not observed before the local timeout."
            : "The deployment transaction hash was observed through the bundler receipt path.",
          "Gas sponsorship is disabled; the smart account or wallet path must cover deployment gas."
        ]
      },
      issues: transactionHash === undefined ? ["Deployment submitted, but transaction receipt is still pending."] : []
    };
  } catch (error) {
    const deploymentIssue = normalizeDeploymentError(error, accountAddress, resolvedChain.chain.name);
    return {
      ok: false,
      issues: [deploymentIssue.message, `Predicted smart account: ${accountAddress}`, deploymentIssue.nextStep]
    };
  }
}

async function createAccountKitContext(input: AgentAccountInput): Promise<
  | {
      ok: true;
      resolvedChain: { chain: Chain };
      // Account Kit returns a branded transport type that is hard to name across dynamic imports.
      alchemyTransport: any;
      smartContracts: typeof import("@account-kit/smart-contracts");
      viem: typeof import("viem");
      signer: InstanceType<typeof import("@aa-sdk/core").WalletClientSigner>;
      parentAddress: Address;
      salt: bigint;
    }
  | { ok: false; issues: string[] }
> {
  if (!input.provider) {
    return { ok: false, issues: ["No EIP-1193 parent-wallet provider is available."] };
  }

  const readiness = getAlchemyReadiness(input.env);
  if (!readiness.accountKitReady || !readiness.config.apiKey) {
    return { ok: false, issues: [`Account Kit is not configured: ${readiness.missing.join(", ") || "unknown"}.`] };
  }
  const apiKey = readiness.config.apiKey;

  const [{ WalletClientSigner }, { alchemy }, smartContracts, viem] = await Promise.all([
    import("@aa-sdk/core"),
    import("@account-kit/infra"),
    import("@account-kit/smart-contracts"),
    import("viem")
  ]);
  const chains = await import("@account-kit/infra");
  const resolvedChain = resolveRuntimeAlchemyChain(readiness.config.chain, chains as Record<string, unknown>);
  if (!resolvedChain.chain) {
    return { ok: false, issues: [resolvedChain.issue ?? "Unsupported Account Kit chain."] };
  }
  const chain = resolvedChain.chain;

  const walletClient = viem.createWalletClient({
    chain: resolvedChain.chain,
    transport: viem.custom(input.provider)
  });
  const signer = new WalletClientSigner(walletClient, "wallet");
  const parentAddress = viem.getAddress(await signer.getAddress());
  const salt = buildAgentAccountSalt(input.agentEnsName, parentAddress);

  return {
    ok: true,
    resolvedChain: { chain },
    alchemyTransport: alchemy({ apiKey }),
    smartContracts,
    viem,
    signer,
    parentAddress,
    salt
  };
}

async function readWalletChainId(provider: Eip1193Provider): Promise<number | undefined> {
  try {
    const chainId = await provider.request({ method: "eth_chainId" });
    return typeof chainId === "string" && chainId.startsWith("0x") ? Number.parseInt(chainId, 16) : undefined;
  } catch {
    return undefined;
  }
}

async function requestWalletChain(provider: Eip1193Provider, chainId: number): Promise<string | undefined> {
  const currentChainId = await readWalletChainId(provider);
  if (currentChainId === chainId) {
    return undefined;
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }]
    });
    return undefined;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `Wallet must switch to Account Kit chain ${chainId} before deployment: ${message}`;
  }
}

function normalizeDeploymentError(
  error: unknown,
  accountAddress: string,
  chainName: string
): { message: string; nextStep: string } {
  const message = error instanceof Error ? error.message : String(error);
  const requiredWei = message.match(/must be at least ([0-9]+) to pay/i)?.[1];
  if (/sender balance and deposit together is 0|fund|gas|balance|paymaster|prefund|AA21|AA31|AA33|AA51/i.test(message)) {
    return {
      message: requiredWei
        ? `The predicted smart account has no ${chainName} gas funds. It needs at least ${formatEthFromWei(requiredWei)} ETH to deploy.`
        : `The predicted smart account has no ${chainName} gas funds for deployment.`,
      nextStep: `Send Sepolia ETH to ${accountAddress}, then retry deployment.`
    };
  }
  return {
    message: `Account Kit could not submit the deployment UserOperation. ${shortenProviderMessage(message)}`,
    nextStep: "Retry after confirming the wallet is on the Account Kit target chain and the predicted smart account is funded."
  };
}

function resolveRuntimeAlchemyChain(
  chainName: string | undefined,
  chains: Record<string, unknown>
): { chain?: Chain; issue?: string } {
  const normalized = chainName?.trim();
  if (!normalized) {
    return { issue: "NEXT_PUBLIC_ALCHEMY_CHAIN is missing." };
  }

  const key = chainAlias(normalized);
  const chain = chains[key];
  if (isChain(chain)) {
    return { chain };
  }
  return { issue: unsupportedChainIssue(normalized) };
}

function isChain(value: unknown): value is Chain {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "rpcUrls" in value &&
    typeof (value as { id?: unknown }).id === "number"
  );
}

function chainAlias(chainName: string): string {
  const normalized = chainName.toLowerCase();
  if (normalized === "ethereum") return "mainnet";
  if (normalized === "base-sepolia") return "baseSepolia";
  return normalized;
}

function unsupportedChainIssue(chainName: string): string {
  return `Unsupported Account Kit chain "${chainName}". Configure one of: sepolia, mainnet, base, base-sepolia, polygon, arbitrum, optimism.`;
}

function asciiHash(value: string): string {
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= BigInt(value.charCodeAt(index));
    hash = BigInt.asUintN(256, hash * 0x100000001b3n);
  }
  return hash.toString();
}

function formatEthFromWei(value: string): string {
  try {
    const wei = BigInt(value);
    const whole = wei / 1_000_000_000_000_000_000n;
    const fraction = (wei % 1_000_000_000_000_000_000n).toString().padStart(18, "0").slice(0, 8).replace(/0+$/, "");
    return fraction.length > 0 ? `${whole}.${fraction}` : whole.toString();
  } catch {
    return value;
  }
}

function shortenProviderMessage(message: string): string {
  const precheck = message.match(/precheck failed: ([^"]+)/i)?.[1];
  if (precheck !== undefined) {
    return precheck;
  }
  return message.length > 180 ? `${message.slice(0, 180)}...` : message;
}
