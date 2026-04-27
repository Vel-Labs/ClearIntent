import { lifecycleHasReached } from "./lifecycle";
import type { AgentIntent, AgentPolicy, CoreResult, HumanReviewCheckpoint, ResultIssue, RiskReport, RiskSeverity, SignatureEvidence } from "./types";

export type AuthorityVerificationInput = {
  intent: AgentIntent;
  policy: AgentPolicy;
  riskReport?: RiskReport;
  humanReview?: HumanReviewCheckpoint;
  now?: Date | string;
  signature?: SignatureEvidence;
};

export type AuthorityVerification = {
  status: "verified";
  intentHash: string;
  policyHash: string;
};

const severityOrder: Record<RiskSeverity, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

export function verifyAuthority(input: AuthorityVerificationInput): CoreResult<AuthorityVerification> {
  const issues: ResultIssue[] = [];
  const { intent, policy, riskReport, humanReview, signature } = input;

  requireEqual(intent.policy.policyHash, policy.policyHash, "policy_hash_mismatch", "Intent policy hash does not match loaded policy.", "policy.policyHash", issues);
  requireEqual(intent.agentIdentity.ensName, policy.subject.ensName, "identity_ens_mismatch", "Intent ENS identity does not match policy subject.", "agentIdentity.ensName", issues);
  requireAddressEqual(
    intent.agentIdentity.controllerAddress,
    policy.subject.controllerAddress,
    "identity_controller_mismatch",
    "Intent controller address does not match policy subject.",
    "agentIdentity.controllerAddress",
    issues
  );

  if (!policy.allowedActions.includes(intent.action.actionType)) {
    issues.push({
      code: "action_not_allowed",
      message: `Action ${intent.action.actionType} is not allowed by policy.`,
      path: "action.actionType"
    });
  }

  if (!containsAddress(policy.allowedExecutors, intent.authority.executor)) {
    issues.push({
      code: "executor_not_allowed",
      message: "Intent executor is not allowed by policy.",
      path: "authority.executor"
    });
  }

  if (!containsAddress(policy.signerRequirements.allowedSigners, intent.authority.signer)) {
    issues.push({
      code: "signer_not_allowed",
      message: "Intent signer is not allowed by policy.",
      path: "authority.signer"
    });
  }

  const valueLimit = parseUnsignedBigInt(intent.action.valueLimit ?? "0");
  const maxValue = parseUnsignedBigInt(policy.limits.maxValue);
  if (valueLimit === undefined || maxValue === undefined) {
    issues.push({ code: "invalid_value_limit", message: "Intent value limit or policy maximum is not a valid unsigned integer.", path: "action.valueLimit" });
  } else if (valueLimit > maxValue) {
    issues.push({
      code: "value_limit_exceeds_policy",
      message: "Intent value limit exceeds policy maximum.",
      path: "action.valueLimit"
    });
  }

  if (parseUnsignedBigInt(intent.authority.nonce) === undefined) {
    issues.push({ code: "invalid_nonce", message: "Intent nonce is not a valid unsigned integer.", path: "authority.nonce" });
  }

  const now = input.now === undefined ? new Date() : new Date(input.now);
  const createdAtMs = Date.parse(intent.createdAt);
  const deadlineMs = Date.parse(intent.authority.deadline);
  if (!Number.isFinite(now.valueOf()) || !Number.isFinite(deadlineMs)) {
    issues.push({ code: "invalid_deadline", message: "Intent deadline or verification clock is invalid.", path: "authority.deadline" });
  } else if (deadlineMs <= now.valueOf()) {
    issues.push({ code: "deadline_expired", message: "Intent deadline has expired.", path: "authority.deadline" });
  }
  if (!Number.isFinite(createdAtMs)) {
    issues.push({ code: "invalid_created_at", message: "Intent createdAt timestamp is invalid.", path: "createdAt" });
  } else if (Number.isFinite(deadlineMs)) {
    const deadlineWindowMs = deadlineMs - createdAtMs;
    if (deadlineWindowMs <= 0) {
      issues.push({ code: "deadline_before_created_at", message: "Intent deadline is not after createdAt.", path: "authority.deadline" });
    } else if (deadlineWindowMs > policy.limits.deadlineSeconds * 1000) {
      issues.push({
        code: "deadline_exceeds_policy_window",
        message: "Intent deadline exceeds the policy deadline window.",
        path: "authority.deadline"
      });
    }
  }

  if (!lifecycleHasReached(intent.lifecycleState, "human_approved")) {
    issues.push({
      code: "human_review_lifecycle_missing",
      message: "Intent has not reached the human_approved lifecycle state.",
      path: "lifecycleState"
    });
  }

  if (policy.riskRequirements.riskReviewRequired) {
    verifyRiskReport(intent, policy, riskReport, issues);
  }

  verifyHumanReview(intent, policy, humanReview, issues);

  if (signature === undefined) {
    issues.push({ code: "signature_missing", message: "Signature is required before verification." });
  } else {
    if (!sameAddress(signature.signer, intent.authority.signer)) {
      issues.push({ code: "signature_signer_mismatch", message: "Signature signer does not match intent signer.", path: "signature.signer" });
    }
    if (signature.signature.length === 0) {
      issues.push({ code: "signature_missing", message: "Signature value is empty.", path: "signature.signature" });
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      status: "verified",
      intentHash: intent.hashes.intentHash,
      policyHash: policy.policyHash
    },
    issues: []
  };
}

function verifyRiskReport(intent: AgentIntent, policy: AgentPolicy, riskReport: RiskReport | undefined, issues: ResultIssue[]): void {
  if (riskReport === undefined) {
    issues.push({ code: "risk_report_missing", message: "Policy requires a risk report before execution." });
    return;
  }

  requireEqual(riskReport.intentHash, intent.hashes.intentHash, "risk_intent_hash_mismatch", "Risk report does not bind the intent hash.", "riskReport.intentHash", issues);
  requireEqual(riskReport.policyHash, policy.policyHash, "risk_policy_hash_mismatch", "Risk report does not bind the policy hash.", "riskReport.policyHash", issues);

  if (riskReport.decision === "block") {
    issues.push({ code: "risk_report_blocks", message: "Risk report blocks this intent.", path: "riskReport.decision" });
  }

  if (severityOrder[riskReport.severity] > severityOrder[policy.riskRequirements.maxAllowedSeverity]) {
    issues.push({
      code: "risk_severity_too_high",
      message: `Risk severity ${riskReport.severity} exceeds policy maximum ${policy.riskRequirements.maxAllowedSeverity}.`,
      path: "riskReport.severity"
    });
  }
}

function verifyHumanReview(
  intent: AgentIntent,
  policy: AgentPolicy,
  humanReview: HumanReviewCheckpoint | undefined,
  issues: ResultIssue[]
): void {
  if (humanReview === undefined) {
    issues.push({ code: "human_review_missing", message: "Human review checkpoint is required before signing or execution." });
    return;
  }

  if (humanReview.decision !== "approved") {
    issues.push({ code: "human_review_not_approved", message: "Human review checkpoint is not approved.", path: "humanReview.decision" });
  }
  requireEqual(
    humanReview.approvedIntentHash,
    intent.hashes.intentHash,
    "human_review_intent_hash_mismatch",
    "Human review does not bind the approved intent hash.",
    "humanReview.approvedIntentHash",
    issues
  );
  requireEqual(humanReview.policyHash, policy.policyHash, "human_review_policy_hash_mismatch", "Human review does not bind the policy hash.", "humanReview.policyHash", issues);
}

function requireEqual(actual: string, expected: string, code: string, message: string, path: string, issues: ResultIssue[]): void {
  if (actual !== expected) {
    issues.push({ code, message, path });
  }
}

function requireAddressEqual(actual: string, expected: string, code: string, message: string, path: string, issues: ResultIssue[]): void {
  if (!sameAddress(actual, expected)) {
    issues.push({ code, message, path });
  }
}

function containsAddress(addresses: string[], address: string): boolean {
  return addresses.some((candidate) => sameAddress(candidate, address));
}

function sameAddress(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

function parseUnsignedBigInt(value: string): bigint | undefined {
  if (!/^[0-9]+$/.test(value)) {
    return undefined;
  }
  return BigInt(value);
}
