import { lifecycleHasReached } from "./lifecycle";
import { inspectLifecycle, type LifecycleEvidence, type LifecycleEvidenceKey } from "./status";
import type { AgentIntent, LifecycleState, ResultIssue } from "./types";

export type CoreStateEvidenceSummary = {
  policy: "present" | "missing" | "mismatched";
  riskReport: "present" | "missing" | "mismatched" | "blocked";
  humanReview: "approved" | "missing" | "rejected" | "needs_changes" | "mismatched";
  signature: "present" | "missing" | "mismatched";
  verification: "present" | "missing" | "mismatched";
  executionReceipt: "missing" | "submitted" | "executed" | "failed" | "degraded" | "mismatched";
  auditBundle: "missing" | "audited" | "blocked" | "degraded" | "mismatched";
};

export type CoreNextAction = {
  code:
    | "load_policy"
    | "produce_risk_report"
    | "request_human_review"
    | "collect_signature"
    | "verify_authority"
    | "submit_execution"
    | "await_execution"
    | "write_audit_bundle";
  label: string;
  requiredEvidence: LifecycleEvidenceKey[];
};

export type CoreStateSnapshot = {
  intentId: string;
  currentState: LifecycleState;
  nextState?: LifecycleState;
  canAdvance: boolean;
  executionBlocked: boolean;
  evidence: CoreStateEvidenceSummary;
  missingEvidence: LifecycleEvidenceKey[];
  blockingIssues: ResultIssue[];
  nextAction?: CoreNextAction;
  degradedSignals: string[];
};

export type CoreStateSnapshotInput = {
  intent: AgentIntent;
  evidence?: LifecycleEvidence;
};

export function deriveCoreStateSnapshot(input: CoreStateSnapshotInput): CoreStateSnapshot {
  const evidence = input.evidence ?? {};
  const lifecycle = inspectLifecycle(input.intent, evidence);
  const evidenceSummary = summarizeEvidence(input.intent, evidence);
  const degradedSignals = collectDegradedSignals(evidence);

  return {
    intentId: input.intent.intentId,
    currentState: lifecycle.currentState,
    nextState: lifecycle.nextState,
    canAdvance: lifecycle.canAdvance,
    executionBlocked: isExecutionBlocked(input.intent.lifecycleState, lifecycle.blockingIssues, evidenceSummary),
    evidence: evidenceSummary,
    missingEvidence: lifecycle.missingEvidence,
    blockingIssues: lifecycle.blockingIssues,
    nextAction: nextActionForState(lifecycle.nextState),
    degradedSignals
  };
}

function summarizeEvidence(intent: AgentIntent, evidence: LifecycleEvidence): CoreStateEvidenceSummary {
  return {
    policy: summarizePolicy(intent, evidence),
    riskReport: summarizeRiskReport(intent, evidence),
    humanReview: summarizeHumanReview(intent, evidence),
    signature: summarizeSignature(intent, evidence),
    verification: summarizeVerification(intent, evidence),
    executionReceipt: summarizeExecutionReceipt(intent, evidence),
    auditBundle: summarizeAuditBundle(intent, evidence)
  };
}

function summarizePolicy(intent: AgentIntent, evidence: LifecycleEvidence): CoreStateEvidenceSummary["policy"] {
  if (evidence.policy === undefined) {
    return "missing";
  }
  return evidence.policy.policyHash === intent.policy.policyHash ? "present" : "mismatched";
}

function summarizeRiskReport(intent: AgentIntent, evidence: LifecycleEvidence): CoreStateEvidenceSummary["riskReport"] {
  if (evidence.riskReport === undefined) {
    return "missing";
  }
  if (evidence.riskReport.intentHash !== intent.hashes.intentHash || evidence.riskReport.policyHash !== intent.policy.policyHash) {
    return "mismatched";
  }
  return evidence.riskReport.decision === "block" ? "blocked" : "present";
}

function summarizeHumanReview(intent: AgentIntent, evidence: LifecycleEvidence): CoreStateEvidenceSummary["humanReview"] {
  if (evidence.humanReview === undefined) {
    return "missing";
  }
  if (evidence.humanReview.approvedIntentHash !== intent.hashes.intentHash || evidence.humanReview.policyHash !== intent.policy.policyHash) {
    return "mismatched";
  }
  return evidence.humanReview.decision;
}

function summarizeSignature(intent: AgentIntent, evidence: LifecycleEvidence): CoreStateEvidenceSummary["signature"] {
  if (evidence.signature === undefined) {
    return "missing";
  }
  if (evidence.signature.signer.toLowerCase() !== intent.authority.signer.toLowerCase() || evidence.signature.signature.length === 0) {
    return "mismatched";
  }
  return "present";
}

function summarizeVerification(intent: AgentIntent, evidence: LifecycleEvidence): CoreStateEvidenceSummary["verification"] {
  if (evidence.verification === undefined) {
    return "missing";
  }
  if (evidence.verification.intentHash !== intent.hashes.intentHash || evidence.verification.policyHash !== intent.policy.policyHash) {
    return "mismatched";
  }
  return "present";
}

function summarizeExecutionReceipt(intent: AgentIntent, evidence: LifecycleEvidence): CoreStateEvidenceSummary["executionReceipt"] {
  if (evidence.executionReceipt === undefined) {
    return "missing";
  }
  if (evidence.executionReceipt.intentHash !== intent.hashes.intentHash) {
    return "mismatched";
  }
  return evidence.executionReceipt.status;
}

function summarizeAuditBundle(intent: AgentIntent, evidence: LifecycleEvidence): CoreStateEvidenceSummary["auditBundle"] {
  if (evidence.auditBundle === undefined) {
    return "missing";
  }
  if (evidence.auditBundle.intentHash !== intent.hashes.intentHash || evidence.auditBundle.policyHash !== intent.policy.policyHash) {
    return "mismatched";
  }
  return evidence.auditBundle.finalStatus;
}

function nextActionForState(nextState: LifecycleState | undefined): CoreNextAction | undefined {
  switch (nextState) {
    case "policy_checked":
      return { code: "load_policy", label: "Load matching policy evidence", requiredEvidence: ["policy"] };
    case "reviewed":
      return { code: "produce_risk_report", label: "Produce risk report", requiredEvidence: ["risk_report"] };
    case "human_approved":
      return { code: "request_human_review", label: "Request human review checkpoint", requiredEvidence: ["human_review"] };
    case "signed":
      return { code: "collect_signature", label: "Collect signer evidence", requiredEvidence: ["signature"] };
    case "verified":
      return { code: "verify_authority", label: "Verify authority evidence", requiredEvidence: ["verification"] };
    case "submitted":
      return { code: "submit_execution", label: "Submit verified intent to executor", requiredEvidence: ["submission_receipt"] };
    case "executed":
      return { code: "await_execution", label: "Capture executed receipt", requiredEvidence: ["execution_receipt"] };
    case "audited":
      return { code: "write_audit_bundle", label: "Write audit bundle", requiredEvidence: ["audit_bundle"] };
    case "proposed":
    case undefined:
      return undefined;
  }
}

function isExecutionBlocked(
  currentState: LifecycleState,
  blockingIssues: ResultIssue[],
  evidence: CoreStateEvidenceSummary
): boolean {
  if (!lifecycleHasReached(currentState, "verified")) {
    return true;
  }
  if (evidence.executionReceipt === "failed" || evidence.auditBundle === "blocked") {
    return true;
  }
  return blockingIssues.some((issue) => issue.code === "lifecycle_evidence_mismatch");
}

function collectDegradedSignals(evidence: LifecycleEvidence): string[] {
  const signals: string[] = [];
  signals.push(...(evidence.riskReport?.degradedSignals ?? []));
  if (evidence.executionReceipt?.status === "degraded" && evidence.executionReceipt.degradedReason !== undefined) {
    signals.push(evidence.executionReceipt.degradedReason);
  }
  if (evidence.executionReceipt?.status === "failed" && evidence.executionReceipt.error !== undefined) {
    signals.push(evidence.executionReceipt.error);
  }
  if (evidence.auditBundle?.finalStatus !== undefined && evidence.auditBundle.finalStatus !== "audited") {
    signals.push(`audit_${evidence.auditBundle.finalStatus}`);
  }
  signals.push(...(evidence.auditBundle?.degradedReasons ?? []));
  return [...new Set(signals)];
}

