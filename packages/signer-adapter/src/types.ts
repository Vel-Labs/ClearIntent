import type { AgentIntent, CoreResult, ResultIssue, SignatureEvidence } from "../../core/src";

export const SIGNER_LOCAL_FIXTURE_CLAIM = "signer-local-fixture" as const;
export const EIP712_LOCAL_FIXTURE_CLAIM = "eip712-local-fixture" as const;
export const ERC7730_LOCAL_METADATA_CLAIM = "erc7730-local-metadata" as const;

export type SignerClaimLevel =
  | typeof SIGNER_LOCAL_FIXTURE_CLAIM
  | typeof EIP712_LOCAL_FIXTURE_CLAIM
  | typeof ERC7730_LOCAL_METADATA_CLAIM;

export type WalletClass = "software" | "walletconnect" | "hardware" | "smart_account" | "generic";
export type WalletCapabilityLevel =
  | "request_shape_only"
  | "eip712_local_fixture"
  | "signer_local_fixture"
  | "erc7730_local_metadata"
  | "software_wallet_tested"
  | "secure_device_tested"
  | "vendor_clear_signing_approved";

export type DisplayStatus =
  | "app_preview_only"
  | "wallet_typed_preview"
  | "secure_device_preview"
  | "vendor_clear_signing_approved"
  | "blind_or_limited_display"
  | "unknown";

export type DisplayWarningCode =
  | "app_preview_only"
  | "wallet_display_unverified"
  | "secure_device_display_unverified"
  | "blind_or_limited_display_possible"
  | "vendor_clear_signing_not_approved";

export type SignerIssueCode =
  | "missing_chain_id"
  | "missing_verifying_contract"
  | "invalid_signer"
  | "invalid_typed_data"
  | "invalid_metadata"
  | "user_rejected"
  | "unauthorized"
  | "unsupported_method"
  | "disconnected"
  | "chain_disconnected"
  | "unknown_provider_error";

export type SignerIssue = ResultIssue & {
  code: SignerIssueCode;
};

export type SignerResult<T> = CoreResult<T> | { ok: false; issues: SignerIssue[] };

export type ApprovalFieldKey =
  | "intentId"
  | "intentHash"
  | "policyHash"
  | "actionHash"
  | "signer"
  | "executor"
  | "nonce"
  | "deadline"
  | "chainId"
  | "verifyingContract"
  | "valueLimit"
  | "identity"
  | "auditRefs";

export type ApprovalField = {
  key: ApprovalFieldKey;
  label: string;
  required: boolean;
};

export const APPROVAL_FIELD_MAP: readonly ApprovalField[] = [
  { key: "intentId", label: "Intent ID", required: true },
  { key: "intentHash", label: "Intent hash", required: true },
  { key: "policyHash", label: "Policy hash", required: true },
  { key: "actionHash", label: "Action hash", required: true },
  { key: "signer", label: "Signer", required: true },
  { key: "executor", label: "Executor", required: true },
  { key: "nonce", label: "Nonce", required: true },
  { key: "deadline", label: "Deadline", required: true },
  { key: "chainId", label: "Chain ID", required: true },
  { key: "verifyingContract", label: "Verifying contract", required: true },
  { key: "valueLimit", label: "Value bound", required: false },
  { key: "identity", label: "Agent identity", required: true },
  { key: "auditRefs", label: "Audit references", required: false }
] as const;

export type SignerAuditRefs = {
  agentCardUri?: string;
  policyUri?: string;
  auditBundleUri?: string;
  riskReportUri?: string;
  humanReviewUri?: string;
};

export type Eip712Domain = {
  name: "ClearIntent";
  version: "1";
  chainId: number;
  verifyingContract: string;
};

export type ClearIntentTypedDataMessage = {
  intentId: string;
  intentHash: string;
  policyHash: string;
  actionHash: string;
  signer: string;
  executor: string;
  nonce: string;
  deadline: string;
  chainId: number;
  verifyingContract: string;
  actionType: string;
  target: string;
  valueLimit: string;
  identity: string;
  auditRefs: string;
};

export type ClearIntentTypedData = {
  types: {
    EIP712Domain: Array<{ name: string; type: string }>;
    ClearIntentAgentIntent: Array<{ name: keyof ClearIntentTypedDataMessage; type: string }>;
  };
  primaryType: "ClearIntentAgentIntent";
  domain: Eip712Domain;
  message: ClearIntentTypedDataMessage;
};

export type ApprovalPreviewField = ApprovalField & {
  value: string;
};

export type ApprovalPreview = {
  claimLevel: typeof EIP712_LOCAL_FIXTURE_CLAIM;
  displayStatus: DisplayStatus;
  title: "ClearIntent Approval Preview";
  summary: string;
  fields: ApprovalPreviewField[];
  warnings: DisplayWarningCode[];
};

export type FixtureSignatureEvidence = SignatureEvidence & {
  claimLevel: typeof SIGNER_LOCAL_FIXTURE_CLAIM;
  typedDataHash: string;
  displayStatus: DisplayStatus;
  displayWarnings: DisplayWarningCode[];
};

export type ReviewPromptCode =
  | "value_threshold"
  | "high_risk"
  | "new_executor"
  | "degraded_audit_write"
  | "policy_change";

export type ReviewPromptInput = {
  valueLimit?: string;
  valueThreshold?: string;
  riskSeverity?: "none" | "low" | "medium" | "high" | "critical";
  knownExecutors?: string[];
  executor?: string;
  auditWriteStatus?: "ok" | "degraded" | "missing";
  policyHash?: string;
  previousPolicyHash?: string;
};

export type ReviewPrompt = {
  code: ReviewPromptCode;
  severity: "warning" | "blocking";
  message: string;
};

export interface SignerAdapter {
  readonly walletClass: WalletClass;
  readonly capabilityLevel: WalletCapabilityLevel;
  readonly claimLevel: SignerClaimLevel;
  buildTypedData(intent: AgentIntent, auditRefs?: SignerAuditRefs): ClearIntentTypedData;
  renderPreview(intent: AgentIntent, auditRefs?: SignerAuditRefs): ApprovalPreview;
}
