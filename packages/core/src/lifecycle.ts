import type { CoreResult, LifecycleState } from "./types";

export const LIFECYCLE_STATES: readonly LifecycleState[] = [
  "proposed",
  "policy_checked",
  "reviewed",
  "human_approved",
  "signed",
  "verified",
  "submitted",
  "executed",
  "audited"
];

export function canAdvanceLifecycle(from: LifecycleState, to: LifecycleState): boolean {
  return LIFECYCLE_STATES.indexOf(to) === LIFECYCLE_STATES.indexOf(from) + 1;
}

export function assertLifecycleAdvance(from: LifecycleState, to: LifecycleState): CoreResult<LifecycleState> {
  if (canAdvanceLifecycle(from, to)) {
    return { ok: true, value: to, issues: [] };
  }

  return {
    ok: false,
    issues: [
      {
        code: "invalid_lifecycle_transition",
        message: `Cannot advance lifecycle from ${from} to ${to}.`,
        path: "lifecycleState"
      }
    ]
  };
}

export function lifecycleHasReached(current: LifecycleState, required: LifecycleState): boolean {
  return LIFECYCLE_STATES.indexOf(current) >= LIFECYCLE_STATES.indexOf(required);
}

