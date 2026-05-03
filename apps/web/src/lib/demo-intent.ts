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
  mode: "simulation-only";
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
  evaluation: {
    status: "pass" | "fail";
    shouldExecute: boolean;
    reason: string;
    severity: "info" | "warning" | "critical";
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
  eventPayload: DemoClearIntentEventPayload;
  humanSummary: string;
};

export type DemoClearIntentEventPayload = {
  source: "keeperhub";
  project: "clearintent";
  schemaVersion: "clearintent.keeperhub-event.v1";
  eventType: "clearintent.demo.execution.allowed" | "clearintent.demo.execution.blocked";
  status: "executed" | "failed";
  error: string;
  severity: "info" | "warning" | "critical";
  shouldExecute: boolean;
  parentWallet?: string;
  agentAccount?: string;
  agentEnsName?: string;
  intentHash: string;
  verificationIntentHash: string;
  policyHash?: string;
  verificationPolicyHash?: string;
  auditLatest?: string;
  actionType: "demo.native-transfer";
  target: string;
  chainId: string;
  valueLimit: string;
  executor: "clearintent-demo-simulator";
  signer?: string;
  transactionHash: "none";
};

export function buildDemoIntent(input: BuildDemoIntentInput): DemoIntentPreview {
  const renderCount = Math.max(0, input.renderCount);
  const chainId = input.wallet?.chainId ?? 11155111;
  const amount = demoAmount(input.setup, input.destination, renderCount);
  const generatedAt = demoTimestamp(renderCount);
  const from = input.setup?.agentAccount ?? "agent-account-not-linked";
  const to = input.destination.trim() || "destination-address-required";
  const evaluation = demoEvaluation(input.setup, amount.wei, renderCount);
  const intentHash = demoHash(`${from}:${to}:${amount.wei}:${renderCount}:${evaluation.status}`);
  const policyHash = validHash(input.setup?.policyHash) ?? `0x${"0".repeat(64)}`;
  const eventPayload: DemoClearIntentEventPayload = {
    source: "keeperhub",
    project: "clearintent",
    schemaVersion: "clearintent.keeperhub-event.v1",
    eventType: evaluation.shouldExecute ? "clearintent.demo.execution.allowed" : "clearintent.demo.execution.blocked",
    status: evaluation.shouldExecute ? "executed" : "failed",
    error: evaluation.shouldExecute ? "none" : evaluation.reason,
    severity: evaluation.severity,
    shouldExecute: evaluation.shouldExecute,
    parentWallet: input.wallet?.account ?? input.setup?.parentWallet,
    agentAccount: input.setup?.agentAccount,
    agentEnsName: input.setup?.agentEnsName,
    intentHash,
    verificationIntentHash: intentHash,
    policyHash,
    verificationPolicyHash: evaluation.shouldExecute ? policyHash : demoHash(`mismatch:${policyHash}:${renderCount}`),
    auditLatest: input.setup?.auditLatest,
    actionType: "demo.native-transfer",
    target: to,
    chainId: String(chainId),
    valueLimit: amount.eth,
    executor: "clearintent-demo-simulator",
    signer: input.wallet?.account ?? input.setup?.parentWallet,
    transactionHash: "none"
  };

  return {
    schemaVersion: "clearintent.demo-intent.v1",
    renderCount,
    actionType: "demo-native-transfer",
    mode: "simulation-only",
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
    evaluation,
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
    eventPayload,
    humanSummary: `${evaluation.shouldExecute ? "Pass" : "Fail"} simulation: ${evaluation.reason}. Demo would send ${amount.eth} ETH from ${shortValue(from)} to ${shortValue(to)} on ${chainId === 11155111 ? "Sepolia" : `chain ${chainId}`}. No transaction is submitted.`
  };
}

function demoEvaluation(
  setup: AgentSetupDiscoveryRecord | undefined,
  valueWei: bigint,
  renderCount: number
): DemoIntentPreview["evaluation"] {
  if (setup?.policyHash === undefined) {
    return {
      status: "fail",
      shouldExecute: false,
      reason: "Policy hash is missing, so ClearIntent blocks execution.",
      severity: "critical"
    };
  }

  if (renderCount > 0 && renderCount % 4 === 0) {
    return {
      status: "fail",
      shouldExecute: false,
      reason: "Policy hash verification mismatch in demo event.",
      severity: "critical"
    };
  }

  if (renderCount > 0 && renderCount % 2 === 0) {
    return {
      status: "fail",
      shouldExecute: false,
      reason: `Demo amount ${formatEth(valueWei)} ETH exceeds the simulated policy limit for this run.`,
      severity: "warning"
    };
  }

  return {
    status: "pass",
    shouldExecute: true,
    reason: "Demo amount, destination, policy hash, and human-review requirement are within simulated policy.",
    severity: "info"
  };
}

function formatEth(valueWei: bigint): string {
  const microEth = valueWei / 1_000_000_000_000n;
  return `0.${microEth.toString().padStart(6, "0")}`;
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

function demoHash(value: string): string {
  const first = pseudoRandom(value).toString(16).padStart(8, "0");
  const second = pseudoRandom(`${value}:clearintent`).toString(16).padStart(8, "0");
  return `0x${`${first}${second}`.repeat(4)}`;
}

function validHash(value: string | undefined): string | undefined {
  return value !== undefined && /^0x[a-fA-F0-9]{64}$/.test(value) ? value : undefined;
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
