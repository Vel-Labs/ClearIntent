import type { AgentIntent, CoreStateSnapshot } from "../../../../packages/core/src";
import type { EnsIdentityClaimLevel, EnsLiveReadStatus, ResolvedEnsIdentity } from "../../../../packages/ens-identity/src";
import type { KeeperHubClaimLevel, KeeperHubLiveStatus } from "../../../../packages/keeperhub-adapter/src";
import type { ArtifactRef, ClaimLevel as ZerogClaimLevel, MemoryStatus, ProviderMode } from "../../../../packages/zerog-memory/src";
import type {
  ClearIntentTypedData,
  DisplayStatus,
  InjectedWalletStatus,
  SignerAuditRefs,
  SignerClaimLevel,
  WalletCapabilityLevel,
  WalletClass
} from "../../../../packages/signer-adapter/src";

export type EvidenceKind = "wallet" | "ens" | "zerog" | "keeperhub" | "signer" | "payload" | "alchemy";
export type EvidenceState = "present" | "missing" | "degraded" | "demo";
export type EvidenceSource = "wallet-provider" | "adapter" | "core" | "operator-config" | "demo-fixture" | "missing";

export type EvidenceBase<K extends EvidenceKind, D> = {
  kind: K;
  state: EvidenceState;
  label: string;
  summary: string;
  source: EvidenceSource;
  frontendAuthority: false;
  blocking: boolean;
  degradedReasons: string[];
  data?: D;
};

export type WalletEvidenceData = {
  address: string;
  chainId?: number;
  connector?: "eip1193" | "metamask" | "walletconnect" | "unknown";
};

export type EnsEvidenceData = {
  claimLevel: EnsIdentityClaimLevel;
  identity?: ResolvedEnsIdentity;
  liveStatus?: EnsLiveReadStatus;
};

export type ZerogEvidenceData = {
  providerMode: ProviderMode;
  claimLevel: ZerogClaimLevel;
  status?: MemoryStatus;
  refs: ArtifactRef[];
};

export type KeeperHubEvidenceData = {
  claimLevel: KeeperHubClaimLevel;
  workflowId?: string;
  runId?: string;
  transactionHash?: string;
  liveStatus?: KeeperHubLiveStatus;
  authorityApprovalProvidedByKeeperHub: false;
};

export type SignerEvidenceData = {
  walletClass: WalletClass;
  capabilityLevel: WalletCapabilityLevel;
  claimLevel: SignerClaimLevel | InjectedWalletStatus["claimLevel"];
  displayStatus: DisplayStatus;
  walletRenderedPreviewProven: boolean;
};

export type PayloadEvidenceData = {
  intent: AgentIntent;
  typedData?: ClearIntentTypedData;
  auditRefs?: SignerAuditRefs;
  coreSnapshot?: CoreStateSnapshot;
};

export type AlchemyEvidenceData = {
  configured: boolean;
  accountKitReady: boolean;
  apiKeyPresent: boolean;
  smartAccountAddress?: string;
  sessionKeyPolicyProven: boolean;
};

export type WalletEvidence = EvidenceBase<"wallet", WalletEvidenceData>;
export type EnsEvidence = EvidenceBase<"ens", EnsEvidenceData>;
export type ZerogEvidence = EvidenceBase<"zerog", ZerogEvidenceData>;
export type KeeperHubEvidence = EvidenceBase<"keeperhub", KeeperHubEvidenceData>;
export type SignerEvidence = EvidenceBase<"signer", SignerEvidenceData>;
export type PayloadEvidence = EvidenceBase<"payload", PayloadEvidenceData>;
export type AlchemyEvidence = EvidenceBase<"alchemy", AlchemyEvidenceData>;

export type AuthorityEvidenceEntry =
  | WalletEvidence
  | EnsEvidence
  | ZerogEvidence
  | KeeperHubEvidence
  | SignerEvidence
  | PayloadEvidence
  | AlchemyEvidence;

export type AuthorityEvidenceSet = {
  wallet: WalletEvidence;
  ens: EnsEvidence;
  zerog: ZerogEvidence;
  keeperhub: KeeperHubEvidence;
  signer: SignerEvidence;
  payload: PayloadEvidence;
  alchemy: AlchemyEvidence;
};

export const evidenceKinds = ["wallet", "ens", "zerog", "keeperhub", "signer", "payload", "alchemy"] as const;

export function evidenceEntries(evidence: AuthorityEvidenceSet): AuthorityEvidenceEntry[] {
  return evidenceKinds.map((kind) => evidence[kind]);
}

export function missingEvidence<K extends EvidenceKind>(kind: K, label: string, summary: string): EvidenceBase<K, never> {
  return {
    kind,
    state: "missing",
    label,
    summary,
    source: "missing",
    frontendAuthority: false,
    blocking: true,
    degradedReasons: []
  };
}

export function presentEvidence<K extends EvidenceKind, D>(
  kind: K,
  label: string,
  summary: string,
  source: EvidenceSource,
  data: D,
  degradedReasons: string[] = []
): EvidenceBase<K, D> {
  return {
    kind,
    state: degradedReasons.length === 0 ? "present" : "degraded",
    label,
    summary,
    source,
    frontendAuthority: false,
    blocking: false,
    degradedReasons,
    data
  };
}

export function demoEvidence<K extends EvidenceKind, D>(
  kind: K,
  label: string,
  summary: string,
  data: D
): EvidenceBase<K, D> {
  return {
    kind,
    state: "demo",
    label,
    summary,
    source: "demo-fixture",
    frontendAuthority: false,
    blocking: false,
    degradedReasons: ["demo fixture only; not provider-verified authority truth"],
    data
  };
}
