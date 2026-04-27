import { assertLifecycleAdvance, lifecycleHasReached } from "./lifecycle";
import type {
  AgentIntent,
  AuditBundle,
  CoreResult,
  ExecutionReceipt,
  HumanReviewCheckpoint,
  LifecycleState,
  ResultIssue,
  RiskReport,
  SignatureEvidence
} from "./types";
import type { AuthorityVerification } from "./verification";

export type LifecycleEvidenceKey =
  | "policy"
  | "risk_report"
  | "human_review"
  | "signature"
  | "verification"
  | "submission_receipt"
  | "execution_receipt"
  | "audit_bundle";

export type LifecycleEvidence = {
  policy?: { policyHash: string };
  riskReport?: RiskReport;
  humanReview?: HumanReviewCheckpoint;
  signature?: SignatureEvidence;
  verification?: AuthorityVerification;
  executionReceipt?: ExecutionReceipt;
  auditBundle?: AuditBundle;
};

export type LifecycleStatus = {
  currentState: LifecycleState;
  nextState?: LifecycleState;
  canAdvance: boolean;
  missingEvidence: LifecycleEvidenceKey[];
  blockingIssues: ResultIssue[];
};

type StateRequirement = {
  state: LifecycleState;
  evidence: LifecycleEvidenceKey;
};

const advanceRequirements: readonly StateRequirement[] = [
  { state: "policy_checked", evidence: "policy" },
  { state: "reviewed", evidence: "risk_report" },
  { state: "human_approved", evidence: "human_review" },
  { state: "signed", evidence: "signature" },
  { state: "verified", evidence: "verification" },
  { state: "submitted", evidence: "submission_receipt" },
  { state: "executed", evidence: "execution_receipt" },
  { state: "audited", evidence: "audit_bundle" }
];

export function inspectLifecycle(intent: AgentIntent, evidence: LifecycleEvidence = {}): LifecycleStatus {
  const nextRequirement = advanceRequirements.find((requirement) => !lifecycleHasReached(intent.lifecycleState, requirement.state));
  if (nextRequirement === undefined) {
    return {
      currentState: intent.lifecycleState,
      canAdvance: false,
      missingEvidence: [],
      blockingIssues: []
    };
  }

  const blockingIssues = validateEvidenceForState(intent, nextRequirement.state, evidence);
  const missingEvidence = blockingIssues
    .filter((issue) => issue.code === "missing_lifecycle_evidence")
    .map((issue) => issue.path as LifecycleEvidenceKey);

  return {
    currentState: intent.lifecycleState,
    nextState: nextRequirement.state,
    canAdvance: blockingIssues.length === 0,
    missingEvidence,
    blockingIssues
  };
}

export function advanceIntentLifecycle(intent: AgentIntent, evidence: LifecycleEvidence = {}): CoreResult<AgentIntent> {
  const status = inspectLifecycle(intent, evidence);
  if (status.nextState === undefined) {
    return {
      ok: false,
      issues: [{ code: "lifecycle_already_terminal", message: "Intent lifecycle is already at the terminal audited state.", path: "lifecycleState" }]
    };
  }

  const transition = assertLifecycleAdvance(intent.lifecycleState, status.nextState);
  if (!transition.ok) {
    return transition;
  }

  if (!status.canAdvance) {
    return { ok: false, issues: status.blockingIssues };
  }

  return {
    ok: true,
    value: {
      ...intent,
      lifecycleState: status.nextState
    },
    issues: []
  };
}

function validateEvidenceForState(intent: AgentIntent, state: LifecycleState, evidence: LifecycleEvidence): ResultIssue[] {
  switch (state) {
    case "policy_checked":
      return requirePolicy(intent, evidence);
    case "reviewed":
      return requireRiskReport(intent, evidence);
    case "human_approved":
      return requireHumanReview(intent, evidence);
    case "signed":
      return requireSignature(intent, evidence);
    case "verified":
      return requireVerification(intent, evidence);
    case "submitted":
      return requireSubmittedReceipt(intent, evidence);
    case "executed":
      return requireExecutedReceipt(intent, evidence);
    case "audited":
      return requireAuditBundle(intent, evidence);
    case "proposed":
      return [];
  }
}

function requirePolicy(intent: AgentIntent, evidence: LifecycleEvidence): ResultIssue[] {
  if (evidence.policy === undefined) {
    return [missing("policy", "Policy evidence is required to advance to policy_checked.")];
  }
  if (evidence.policy.policyHash !== intent.policy.policyHash) {
    return [mismatch("policy", "Policy evidence does not match the intent policy hash.")];
  }
  return [];
}

function requireRiskReport(intent: AgentIntent, evidence: LifecycleEvidence): ResultIssue[] {
  if (evidence.riskReport === undefined) {
    return [missing("risk_report", "Risk report evidence is required to advance to reviewed.")];
  }
  if (evidence.riskReport.intentHash !== intent.hashes.intentHash) {
    return [mismatch("risk_report", "Risk report does not bind the intent hash.")];
  }
  if (evidence.riskReport.policyHash !== intent.policy.policyHash) {
    return [mismatch("risk_report", "Risk report does not bind the policy hash.")];
  }
  return [];
}

function requireHumanReview(intent: AgentIntent, evidence: LifecycleEvidence): ResultIssue[] {
  if (evidence.humanReview === undefined) {
    return [missing("human_review", "Human review checkpoint is required to advance to human_approved.")];
  }
  if (evidence.humanReview.decision !== "approved") {
    return [mismatch("human_review", "Human review decision is not approved.")];
  }
  if (evidence.humanReview.approvedIntentHash !== intent.hashes.intentHash) {
    return [mismatch("human_review", "Human review does not bind the approved intent hash.")];
  }
  return [];
}

function requireSignature(intent: AgentIntent, evidence: LifecycleEvidence): ResultIssue[] {
  if (evidence.signature === undefined) {
    return [missing("signature", "Signature evidence is required to advance to signed.")];
  }
  if (evidence.signature.signer.toLowerCase() !== intent.authority.signer.toLowerCase()) {
    return [mismatch("signature", "Signature signer does not match the intent signer.")];
  }
  if (evidence.signature.signature.length === 0) {
    return [mismatch("signature", "Signature value is empty.")];
  }
  return [];
}

function requireVerification(intent: AgentIntent, evidence: LifecycleEvidence): ResultIssue[] {
  if (evidence.verification === undefined) {
    return [missing("verification", "Authority verification evidence is required to advance to verified.")];
  }
  if (evidence.verification.intentHash !== intent.hashes.intentHash) {
    return [mismatch("verification", "Verification does not bind the intent hash.")];
  }
  if (evidence.verification.policyHash !== intent.policy.policyHash) {
    return [mismatch("verification", "Verification does not bind the policy hash.")];
  }
  return [];
}

function requireSubmittedReceipt(intent: AgentIntent, evidence: LifecycleEvidence): ResultIssue[] {
  if (evidence.executionReceipt === undefined) {
    return [missing("submission_receipt", "Execution receipt evidence is required to advance to submitted.")];
  }
  if (evidence.executionReceipt.intentHash !== intent.hashes.intentHash) {
    return [mismatch("submission_receipt", "Execution receipt does not bind the intent hash.")];
  }
  if (!["submitted", "executed", "degraded"].includes(evidence.executionReceipt.status)) {
    return [mismatch("submission_receipt", "Execution receipt is not submitted, executed, or degraded.")];
  }
  return [];
}

function requireExecutedReceipt(intent: AgentIntent, evidence: LifecycleEvidence): ResultIssue[] {
  if (evidence.executionReceipt === undefined) {
    return [missing("execution_receipt", "Executed receipt evidence is required to advance to executed.")];
  }
  if (evidence.executionReceipt.intentHash !== intent.hashes.intentHash) {
    return [mismatch("execution_receipt", "Executed receipt does not bind the intent hash.")];
  }
  if (evidence.executionReceipt.status !== "executed") {
    return [mismatch("execution_receipt", "Execution receipt is not executed.")];
  }
  return [];
}

function requireAuditBundle(intent: AgentIntent, evidence: LifecycleEvidence): ResultIssue[] {
  if (evidence.auditBundle === undefined) {
    return [missing("audit_bundle", "Audit bundle evidence is required to advance to audited.")];
  }
  if (evidence.auditBundle.intentHash !== intent.hashes.intentHash) {
    return [mismatch("audit_bundle", "Audit bundle does not bind the intent hash.")];
  }
  if (evidence.auditBundle.policyHash !== intent.policy.policyHash) {
    return [mismatch("audit_bundle", "Audit bundle does not bind the policy hash.")];
  }
  return [];
}

function missing(path: LifecycleEvidenceKey, message: string): ResultIssue {
  return { code: "missing_lifecycle_evidence", message, path };
}

function mismatch(path: LifecycleEvidenceKey, message: string): ResultIssue {
  return { code: "lifecycle_evidence_mismatch", message, path };
}

