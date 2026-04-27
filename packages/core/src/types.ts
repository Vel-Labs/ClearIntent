export type LifecycleState =
  | "proposed"
  | "policy_checked"
  | "reviewed"
  | "human_approved"
  | "signed"
  | "verified"
  | "submitted"
  | "executed"
  | "audited";

export type RiskSeverity = "none" | "low" | "medium" | "high" | "critical";
export type RiskDecision = "allow" | "block" | "needs_human_review";
export type ReviewDecision = "approved" | "rejected" | "needs_changes";

export type ResultIssue = {
  code: string;
  message: string;
  path?: string;
};

export type CoreResult<T = undefined> =
  | {
      ok: true;
      value: T;
      issues: [];
    }
  | {
      ok: false;
      issues: ResultIssue[];
    };

export type AgentIdentity = {
  ensName: string;
  controllerAddress: string;
  agentCardUri?: string;
  role?: string;
};

export type IntentPolicyRef = {
  policyUri: string;
  policyHash: string;
};

export type AgentAction = {
  actionType: string;
  target: string;
  chainId: number;
  valueLimit?: string;
  calldataHash?: string;
  description: string;
};

export type IntentAuthority = {
  signer: string;
  executor: string;
  nonce: string;
  deadline: string;
  verifyingContract: string;
};

export type AgentIntent = {
  schemaVersion: "clearintent.agent-intent.v1";
  intentId: string;
  lifecycleState: LifecycleState;
  createdAt: string;
  agentIdentity: AgentIdentity;
  policy: IntentPolicyRef;
  action: AgentAction;
  authority: IntentAuthority;
  hashes: {
    actionHash: string;
    intentHash: string;
  };
};

export type AgentPolicy = {
  schemaVersion: "clearintent.agent-policy.v1";
  policyId: string;
  policyHash: string;
  subject: {
    ensName: string;
    controllerAddress: string;
  };
  allowedActions: string[];
  allowedExecutors: string[];
  signerRequirements: {
    allowedSigners: string[];
    hardwareBackedRequired: boolean;
  };
  limits: {
    maxValue: string;
    deadlineSeconds: number;
  };
  riskRequirements: {
    riskReviewRequired: boolean;
    maxAllowedSeverity: RiskSeverity;
  };
};

export type RiskReport = {
  schemaVersion: "clearintent.risk-report.v1";
  reportId: string;
  intentHash: string;
  policyHash: string;
  decision: RiskDecision;
  severity: RiskSeverity;
  reasons: string[];
  createdAt: string;
  degradedSignals?: string[];
};

export type HumanReviewCheckpoint = {
  schemaVersion: "clearintent.human-review-checkpoint.v1";
  reviewId: string;
  reviewer: string;
  decision: ReviewDecision;
  reviewedAt: string;
  approvedIntentHash: string;
  policyHash: string;
  summary: string;
  displayWarnings: string[];
};

export type SignatureEvidence = {
  signer: string;
  signature: string;
};

export type ExecutionReceipt = {
  schemaVersion: "clearintent.execution-receipt.v1";
  receiptId: string;
  intentHash: string;
  executor: {
    adapter: string;
    address: string;
    workflowId?: string;
    runId?: string;
  };
  status: "submitted" | "executed" | "failed" | "degraded";
  submittedAt: string;
  completedAt?: string;
  transactionHash?: string;
  error?: string;
  degradedReason?: string;
};

export type ArtifactRef = {
  uri: string;
  hash: string;
};

export type AuditBundle = {
  schemaVersion: "clearintent.audit-bundle.v1";
  bundleId: string;
  intentHash: string;
  policyHash: string;
  createdAt: string;
  artifacts: {
    identity: ArtifactRef;
    policy: ArtifactRef;
    intent: ArtifactRef;
    riskReport: ArtifactRef;
    humanReview: ArtifactRef;
    signature?: ArtifactRef;
    executionReceipt?: ArtifactRef;
  };
  finalStatus: "audited" | "degraded" | "blocked";
  degradedReasons?: string[];
};

export type ContractKind =
  | "AgentIntent"
  | "AgentPolicy"
  | "RiskReport"
  | "HumanReviewCheckpoint"
  | "ExecutionReceipt"
  | "AuditBundle";
