import type { ReviewPrompt, ReviewPromptInput } from "./types";

const severityRank = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
} as const;

export function buildConditionalReviewPrompts(input: ReviewPromptInput): ReviewPrompt[] {
  const prompts: ReviewPrompt[] = [];

  if (exceedsValueThreshold(input.valueLimit, input.valueThreshold)) {
    prompts.push({
      code: "value_threshold",
      severity: "blocking",
      message: "Intent value bound exceeds the configured human-review threshold."
    });
  }

  if (input.riskSeverity !== undefined && severityRank[input.riskSeverity] >= severityRank.high) {
    prompts.push({
      code: "high_risk",
      severity: "blocking",
      message: "Risk severity is high or critical and requires explicit human review."
    });
  }

  if (input.executor !== undefined && input.knownExecutors !== undefined && !input.knownExecutors.map((value) => value.toLowerCase()).includes(input.executor.toLowerCase())) {
    prompts.push({
      code: "new_executor",
      severity: "blocking",
      message: "Executor has not been seen in the configured executor allowlist context."
    });
  }

  if (input.auditWriteStatus === "degraded" || input.auditWriteStatus === "missing") {
    prompts.push({
      code: "degraded_audit_write",
      severity: "warning",
      message: "Audit write evidence is degraded or missing and must be visible before signing."
    });
  }

  if (input.policyHash !== undefined && input.previousPolicyHash !== undefined && input.policyHash !== input.previousPolicyHash) {
    prompts.push({
      code: "policy_change",
      severity: "blocking",
      message: "Policy hash changed from the previous reviewed context."
    });
  }

  return prompts;
}

function exceedsValueThreshold(valueLimit?: string, valueThreshold?: string): boolean {
  if (valueLimit === undefined || valueThreshold === undefined) {
    return false;
  }
  return BigInt(valueLimit) > BigInt(valueThreshold);
}
