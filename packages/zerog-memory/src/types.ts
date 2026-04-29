import type {
  AgentIntent,
  AgentPolicy,
  ExecutionReceipt,
  HumanReviewCheckpoint,
  RiskReport,
  SignatureEvidence
} from "../../core/src";

export type ProviderMode = "local" | "live";

export type ClaimLevel =
  | "local-fixture"
  | "local-adapter"
  | "0g-write-only"
  | "0g-write-read"
  | "0g-write-read-verified";

export type ArtifactFamily =
  | "policy"
  | "intent"
  | "risk-report"
  | "human-review-checkpoint"
  | "signature-evidence"
  | "execution-receipt"
  | "audit-bundle";

export type ArtifactPayloadByFamily = {
  policy: AgentPolicy;
  intent: AgentIntent;
  "risk-report": RiskReport;
  "human-review-checkpoint": HumanReviewCheckpoint;
  "signature-evidence": SignatureEvidence;
  "execution-receipt": ExecutionReceipt;
  "audit-bundle": AuditBundleManifest;
};

export type ArtifactPayload<F extends ArtifactFamily = ArtifactFamily> = ArtifactPayloadByFamily[F];

export type ArtifactRef<F extends ArtifactFamily = ArtifactFamily> = {
  family: F;
  uri: string;
  hash: string;
  providerMode: ProviderMode;
  claimLevel: ClaimLevel;
};

export type ArtifactEnvelope<F extends ArtifactFamily = ArtifactFamily> = {
  family: F;
  payload: ArtifactPayload<F>;
  ref: ArtifactRef<F>;
  metadata: {
    schemaVersion: "clearintent.zerog-memory.artifact-envelope.v1";
    artifactId: string;
    createdAt: string;
    contentHash: string;
    providerMode: ProviderMode;
    claimLevel: ClaimLevel;
  };
};

export type AuditBundleManifest = {
  schemaVersion: "clearintent.zerog-memory.audit-bundle.v1";
  bundleId: string;
  intentHash: string;
  policyHash: string;
  createdAt: string;
  artifacts: {
    policy: ArtifactRef<"policy">;
    intent: ArtifactRef<"intent">;
    riskReport: ArtifactRef<"risk-report">;
    humanReviewCheckpoint: ArtifactRef<"human-review-checkpoint">;
    signatureEvidence?: ArtifactRef<"signature-evidence">;
    executionReceipt?: ArtifactRef<"execution-receipt">;
  };
  finalStatus: "audited" | "degraded" | "blocked";
  degradedReasons: string[];
};

export type StorageIssue = {
  code:
    | "missing_artifact"
    | "missing_readback"
    | "mismatched_hash"
    | "missing_proof"
    | "incomplete_audit_write"
    | "provider_mode_unsupported"
    | "missing_credentials"
    | "missing_tokens"
    | "sdk_unavailable"
    | "live_writes_disabled"
    | "live_write_unverified"
    | "live_upload_failed"
    | "live_readback_failed";
  message: string;
  artifact?: {
    family?: ArtifactFamily;
    uri?: string;
    hash?: string;
  };
};

export type StorageResult<T> =
  | {
      ok: true;
      state: "stored" | "read" | "verified";
      value: T;
      issues: [];
    }
  | {
      ok: false;
      state: "blocked" | "degraded";
      issues: StorageIssue[];
      value?: T;
    };

export type MemoryStatus = {
  providerMode: ProviderMode;
  claimLevel: ClaimLevel;
  writable: boolean;
  readable: boolean;
  proofVerified: boolean;
  degradedReasons: string[];
};

export type MemoryDoctorCheck = {
  name: "write" | "read" | "hash" | "audit_bundle" | "proof";
  state: "pass" | "blocked" | "degraded" | "local-only";
  message: string;
  issueCode?: string;
};

export type MemoryDoctorReport = {
  providerMode: ProviderMode;
  claimLevel: ClaimLevel;
  liveProvider: false;
  checks: MemoryDoctorCheck[];
  issues: StorageIssue[];
};

export type MemoryCheckStatus = "pass" | "fail" | "degraded" | "local-only";

export type CenterMemoryStatus = {
  ok: boolean;
  providerMode: ProviderMode;
  claimLevel: ClaimLevel;
  liveProvider: boolean;
  localOnly: boolean;
  summary: string;
  checks: {
    id: "config" | "sdk" | "wallet" | "funds" | "write" | "read" | "hash" | "audit-bundle" | "proof";
    label: string;
    status: MemoryCheckStatus;
    detail: string;
  }[];
  degradedReasons: string[];
};

export type WriteArtifactInput<F extends ArtifactFamily = ArtifactFamily> = {
  family: F;
  artifactId: string;
  payload: ArtifactPayload<F>;
  createdAt?: string;
  verifyReadback?: boolean;
};

export type ReadArtifactOptions = {
  requireProof?: boolean;
};

export interface MemoryAdapter {
  readonly providerMode: ProviderMode;
  readonly claimLevel: ClaimLevel;
  status(): MemoryStatus;
  writeArtifact<F extends ArtifactFamily>(input: WriteArtifactInput<F>): Promise<StorageResult<ArtifactEnvelope<F>>>;
  readArtifact<F extends ArtifactFamily>(
    ref: ArtifactRef<F>,
    options?: ReadArtifactOptions
  ): Promise<StorageResult<ArtifactEnvelope<F>>>;
}

export type CreateAuditBundleInput = {
  bundleId: string;
  intentHash: string;
  policyHash: string;
  createdAt?: string;
  refs: AuditBundleManifest["artifacts"];
  verifyReadback?: boolean;
};

export interface AuditStore {
  createAuditBundle(input: CreateAuditBundleInput): Promise<StorageResult<ArtifactEnvelope<"audit-bundle">>>;
  readAuditBundle(ref: ArtifactRef<"audit-bundle">): Promise<StorageResult<ArtifactEnvelope<"audit-bundle">>>;
}
