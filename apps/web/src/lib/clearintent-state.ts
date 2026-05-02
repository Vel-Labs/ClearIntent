import type { AuthorityEvidenceEntry, AuthorityEvidenceSet, EvidenceKind, EvidenceState } from "./evidence-model";
import { evidenceEntries } from "./evidence-model";

export type ClearIntentAuthorityState =
  | "unconnected"
  | "connected-unconfigured"
  | "partially-configured"
  | "configured"
  | "degraded"
  | "demo";

export type AuthorityStateSummary = {
  state: ClearIntentAuthorityState;
  connected: boolean;
  configuredKinds: EvidenceKind[];
  missingKinds: EvidenceKind[];
  degradedKinds: EvidenceKind[];
  demoKinds: EvidenceKind[];
  blockingKinds: EvidenceKind[];
  summary: string;
};

const configurationKinds: readonly EvidenceKind[] = ["ens", "zerog", "keeperhub", "signer", "payload", "alchemy"];

export function deriveAuthorityState(evidence: AuthorityEvidenceSet): AuthorityStateSummary {
  const entries = evidenceEntries(evidence);
  const walletConnected = isUsable(evidence.wallet.state);
  const configuredKinds = entries.filter((entry) => entry.state === "present").map((entry) => entry.kind);
  const missingKinds = entries.filter((entry) => entry.state === "missing").map((entry) => entry.kind);
  const degradedKinds = entries.filter((entry) => entry.state === "degraded").map((entry) => entry.kind);
  const demoKinds = entries.filter((entry) => entry.state === "demo").map((entry) => entry.kind);
  const blockingKinds = entries.filter((entry) => entry.blocking).map((entry) => entry.kind);
  const configuredCount = configurationKinds.filter((kind) => evidence[kind].state === "present").length;

  const state = chooseState({
    walletConnected,
    configuredCount,
    degradedKinds,
    demoKinds,
    entries
  });

  return {
    state,
    connected: walletConnected,
    configuredKinds,
    missingKinds,
    degradedKinds,
    demoKinds,
    blockingKinds,
    summary: stateSummary(state)
  };
}

function chooseState(input: {
  walletConnected: boolean;
  configuredCount: number;
  degradedKinds: EvidenceKind[];
  demoKinds: EvidenceKind[];
  entries: AuthorityEvidenceEntry[];
}): ClearIntentAuthorityState {
  if (input.demoKinds.length === input.entries.length) {
    return "demo";
  }
  if (!input.walletConnected) {
    return "unconnected";
  }
  if (input.degradedKinds.length > 0) {
    return "degraded";
  }
  if (input.configuredCount === 0) {
    return "connected-unconfigured";
  }
  if (input.configuredCount === configurationKinds.length) {
    return "configured";
  }
  return "partially-configured";
}

function isUsable(state: EvidenceState): boolean {
  return state === "present" || state === "degraded" || state === "demo";
}

function stateSummary(state: ClearIntentAuthorityState): string {
  switch (state) {
    case "unconnected":
      return "No parent wallet session is connected.";
    case "connected-unconfigured":
      return "Parent wallet is connected, but ClearIntent authority evidence is not configured.";
    case "partially-configured":
      return "Some ClearIntent evidence is configured, but required authority surfaces are still missing.";
    case "configured":
      return "Required dashboard evidence is configured for display; canonical authority remains in signed artifacts and provider receipts.";
    case "degraded":
      return "At least one configured evidence source is degraded and must not be treated as complete authority proof.";
    case "demo":
      return "Demo fixture evidence is loaded for walkthrough only.";
  }
}
