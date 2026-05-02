import type { AgentIntent, ExecutionReceipt, ResultIssue, SignatureEvidence } from "../../core/src";

export const KEEPERHUB_LOCAL_FIXTURE_CLAIM = "keeperhub-local-fixture" as const;
export const KEEPERHUB_LIVE_READINESS_CLAIM = "keeperhub-live-readiness" as const;
export const KEEPERHUB_LIVE_SUBMITTED_CLAIM = "keeperhub-live-submitted" as const;
export const KEEPERHUB_LIVE_EXECUTED_CLAIM = "keeperhub-live-executed" as const;

export type KeeperHubClaimLevel =
  | typeof KEEPERHUB_LOCAL_FIXTURE_CLAIM
  | typeof KEEPERHUB_LIVE_READINESS_CLAIM
  | typeof KEEPERHUB_LIVE_SUBMITTED_CLAIM
  | typeof KEEPERHUB_LIVE_EXECUTED_CLAIM;
export type ExecutionProviderMode = "local" | "live";
export type ExecutionRunStatus = "pending" | "running" | "submitted" | "executed" | "failed" | "degraded";

export type ExecutionIssueCode =
  | "missing_verification"
  | "missing_signature"
  | "unsupported_executor"
  | "missing_workflow_id"
  | "missing_api_token"
  | "invalid_api_token"
  | "invalid_executor_address"
  | "missing_clearintent_binding"
  | "live_probe_not_enabled"
  | "live_probe_failed"
  | "live_submit_disabled"
  | "live_submit_failed"
  | "failed_run"
  | "missing_transaction_evidence"
  | "missing_receipt"
  | "live_provider_unavailable";

export type ExecutionIssue = ResultIssue & {
  code: ExecutionIssueCode;
};

export type ExecutionVerificationEvidence = {
  status: "verified";
  intentHash: string;
  policyHash: string;
};

export type VerifiedExecutionIntent = {
  intent: AgentIntent;
  signature?: SignatureEvidence;
  verification?: ExecutionVerificationEvidence;
};

export type KeeperHubWorkflowRequest = {
  claimLevel: KeeperHubClaimLevel;
  workflowId: string;
  intentHash: string;
  executor: string;
  action: {
    actionType: string;
    target: string;
    chainId: number;
    valueLimit?: string;
    calldataHash?: string;
  };
};

export type ExecutionSubmission = {
  claimLevel: KeeperHubClaimLevel;
  workflowId: string;
  runId: string;
  submittedAt: string;
};

export type ExecutionRun = ExecutionSubmission & {
  status: ExecutionRunStatus;
  completedAt?: string;
  transactionHash?: string;
  error?: string;
};

export type ExecutionAdapterStatus = {
  claimLevel: KeeperHubClaimLevel;
  providerMode: ExecutionProviderMode;
  localFixtureAvailable: boolean;
  liveProvider: boolean;
  liveProviderDisabled: boolean;
  liveExecutionProven: false;
  authorityApprovalProvidedByKeeperHub: false;
  summary: string;
  issues: ExecutionIssue[];
};

export type ExecutionResult<T> =
  | {
      ok: true;
      value: T;
      issues: [];
    }
  | {
      ok: false;
      issues: ExecutionIssue[];
      value?: T;
    };

export interface ExecutionAdapter {
  readonly claimLevel: KeeperHubClaimLevel;
  readonly providerMode: ExecutionProviderMode;
  status(): ExecutionAdapterStatus;
  createWorkflow(input: VerifiedExecutionIntent): ExecutionResult<KeeperHubWorkflowRequest>;
  submitWorkflow(input: VerifiedExecutionIntent): ExecutionResult<ExecutionSubmission>;
  monitorRun(input: { workflowId?: string; runId?: string }): ExecutionResult<ExecutionRun>;
  toReceipt(input: { intent: AgentIntent; run?: ExecutionRun }): ExecutionResult<ExecutionReceipt>;
}
