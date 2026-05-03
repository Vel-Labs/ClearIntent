import type { AgentSetupDiscoveryRecord } from "./setup-discovery";
import type { WalletAccountState } from "./wallet";

type BuildDemoIntentInput = {
  wallet?: WalletAccountState;
  setup?: AgentSetupDiscoveryRecord;
  destination: string;
  renderCount: number;
};

export type DemoIntentPreview = {
  schemaVersion: "clearintent.demo-intent.v1";
  renderCount: number;
  actionType: "demo-native-transfer";
  mode: "render-only";
  network: {
    chainId: number;
    label: string;
    asset: string;
  };
  transfer: {
    from: string;
    to: string;
    amount: string;
    valueWei: string;
  };
  authority: {
    parentWallet?: string;
    agentEnsName?: string;
    policyHash?: string;
    requiresHumanReview: true;
    frontendAuthority: false;
  };
  controls: {
    nonce: string;
    deadline: string;
    generatedAt: string;
    transactionSubmitted: false;
  };
  humanSummary: string;
};

export function buildDemoIntent(input: BuildDemoIntentInput): DemoIntentPreview {
  const renderCount = Math.max(0, input.renderCount);
  const chainId = input.wallet?.chainId ?? 11155111;
  const amount = demoAmount(input.setup, input.destination, renderCount);
  const generatedAt = demoTimestamp(renderCount);
  const from = input.setup?.agentAccount ?? "agent-account-not-linked";
  const to = input.destination.trim() || "destination-address-required";

  return {
    schemaVersion: "clearintent.demo-intent.v1",
    renderCount,
    actionType: "demo-native-transfer",
    mode: "render-only",
    network: {
      chainId,
      label: chainId === 11155111 ? "Sepolia" : `Chain ${chainId}`,
      asset: "ETH"
    },
    transfer: {
      from,
      to,
      amount: amount.eth,
      valueWei: amount.wei.toString()
    },
    authority: {
      parentWallet: input.wallet?.account ?? input.setup?.parentWallet,
      agentEnsName: input.setup?.agentEnsName,
      policyHash: input.setup?.policyHash,
      requiresHumanReview: true,
      frontendAuthority: false
    },
    controls: {
      nonce: `demo-${renderCount.toString().padStart(4, "0")}`,
      deadline: demoDeadline(generatedAt),
      generatedAt,
      transactionSubmitted: false
    },
    humanSummary: `Render-only ClearIntent preview: send ${amount.eth} ETH from ${shortValue(from)} to ${shortValue(to)} on ${chainId === 11155111 ? "Sepolia" : `chain ${chainId}`}.`
  };
}

function demoAmount(setup: AgentSetupDiscoveryRecord | undefined, destination: string, renderCount: number): { eth: string; wei: bigint } {
  const basis = pseudoRandom(`${setup?.discoveryKey ?? "missing"}:${destination}:${renderCount}`);
  const microEth = 100n + BigInt(basis % 4900);
  const wei = microEth * 1_000_000_000_000n;
  return {
    eth: `0.${microEth.toString().padStart(6, "0")}`,
    wei
  };
}

function pseudoRandom(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function demoTimestamp(renderCount: number): string {
  const base = Date.UTC(2026, 4, 3, 0, 0, 0);
  return new Date(base + renderCount * 60_000).toISOString();
}

function demoDeadline(generatedAt: string): string {
  return new Date(Date.parse(generatedAt) + 15 * 60_000).toISOString();
}

function shortValue(value: string): string {
  return value.length > 16 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
}
