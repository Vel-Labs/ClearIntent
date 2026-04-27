import { advanceIntentLifecycle, type LifecycleEvidence } from "./status";
import type { AgentIntent, AgentPolicy, CoreResult, ResultIssue } from "./types";
import { deriveCoreStateSnapshot, type CoreStateSnapshot } from "./state";
import { verifyAuthority, type AuthorityVerification } from "./verification";

export type CoreAuthorityEvaluationInput = {
  intent: AgentIntent;
  evidence?: LifecycleEvidence;
  policy?: AgentPolicy;
  now?: Date | string;
};

export type CoreAuthorityEvaluation = {
  snapshot: CoreStateSnapshot;
  lifecycleAdvance?: CoreResult<AgentIntent>;
  authorityVerification?: CoreResult<AuthorityVerification>;
  issues: ResultIssue[];
};

export function evaluateCoreAuthority(input: CoreAuthorityEvaluationInput): CoreAuthorityEvaluation {
  const evidence = input.evidence ?? {};
  const snapshot = deriveCoreStateSnapshot({ intent: input.intent, evidence });
  const lifecycleAdvance = snapshot.nextState === undefined ? undefined : advanceIntentLifecycle(input.intent, evidence);
  const authorityVerification =
    input.policy === undefined
      ? undefined
      : verifyAuthority({
          intent: input.intent,
          policy: input.policy,
          riskReport: evidence.riskReport,
          humanReview: evidence.humanReview,
          signature: evidence.signature,
          now: input.now
        });

  return {
    snapshot,
    lifecycleAdvance,
    authorityVerification,
    issues: collectIssues(snapshot.blockingIssues, lifecycleAdvance, authorityVerification)
  };
}

function collectIssues(
  snapshotIssues: ResultIssue[],
  lifecycleAdvance: CoreResult<AgentIntent> | undefined,
  authorityVerification: CoreResult<AuthorityVerification> | undefined
): ResultIssue[] {
  const issues = [...snapshotIssues];
  if (lifecycleAdvance !== undefined && !lifecycleAdvance.ok) {
    issues.push(...lifecycleAdvance.issues);
  }
  if (authorityVerification !== undefined && !authorityVerification.ok) {
    issues.push(...authorityVerification.issues);
  }

  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.code}:${issue.path ?? ""}:${issue.message}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

