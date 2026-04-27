import { describe, expect, it } from "vitest";
import validIntent from "../../contracts/examples/valid-agent-intent.json";
import validPolicy from "../../contracts/examples/valid-agent-policy.json";
import validAuditBundle from "../../contracts/examples/valid-audit-bundle.json";
import validReceipt from "../../contracts/examples/valid-execution-receipt.json";
import validReview from "../../contracts/examples/valid-human-review-checkpoint.json";
import validRiskReport from "../../contracts/examples/valid-risk-report.json";
import {
  advanceIntentLifecycle,
  assertLifecycleAdvance,
  createContractValidator,
  deriveCoreStateSnapshot,
  hashAction,
  inspectLifecycle,
  stableStringify,
  verifyAuthority,
  type AgentIntent,
  type AgentPolicy,
  type AuditBundle,
  type ExecutionReceipt,
  type HumanReviewCheckpoint,
  type RiskReport
} from "../../packages/core/src";

describe("ClearIntent core authority primitives", () => {
  it("validates contract fixtures through the canonical schema files", async () => {
    const validator = await createContractValidator();

    expect(validator.validateContract("AgentIntent", validIntent).ok).toBe(true);
    expect(validator.validateContract("AgentPolicy", validPolicy).ok).toBe(true);
    expect(validator.validateContract("RiskReport", validRiskReport).ok).toBe(true);
    expect(validator.validateContract("HumanReviewCheckpoint", validReview).ok).toBe(true);
  });

  it("rejects invalid lifecycle jumps", () => {
    expect(assertLifecycleAdvance("proposed", "policy_checked").ok).toBe(true);

    const result = assertLifecycleAdvance("proposed", "signed");
    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.issues.map((issue) => issue.code)).toContain("invalid_lifecycle_transition");
  });

  it("produces stable hashes independent of object key order", () => {
    const left = { b: 2, a: { y: true, x: "value" } };
    const right = { a: { x: "value", y: true }, b: 2 };

    expect(stableStringify(left)).toEqual(stableStringify(right));
    expect(hashAction(left)).toEqual(hashAction(right));
  });

  it("verifies the valid authority fixture set", () => {
    const result = verifyAuthority({
      intent: validIntent as AgentIntent,
      policy: validPolicy as AgentPolicy,
      riskReport: validRiskReport as RiskReport,
      humanReview: validReview as HumanReviewCheckpoint,
      signature: {
        signer: (validIntent as AgentIntent).authority.signer,
        signature: "0xmock-signature"
      },
      now: "2026-05-03T18:03:00Z"
    });

    expect(result.ok).toBe(true);
    expect(result.ok ? result.value.status : undefined).toBe("verified");
  });

  it("fails closed when required authority evidence is missing or mismatched", () => {
    const result = verifyAuthority({
      intent: validIntent as AgentIntent,
      policy: {
        ...(validPolicy as AgentPolicy),
        allowedExecutors: ["0x9999999999999999999999999999999999999999"]
      },
      now: "2026-05-03T18:03:00Z"
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["executor_not_allowed", "risk_report_missing", "human_review_missing", "signature_missing"])
    );
  });

  it("fails closed for nonce, deadline, value, risk, review, and signature violations", () => {
    const result = verifyAuthority({
      intent: {
        ...(validIntent as AgentIntent),
        createdAt: "2026-05-03T18:00:00Z",
        action: {
          ...(validIntent as AgentIntent).action,
          valueLimit: "100000000000000001"
        },
        authority: {
          ...(validIntent as AgentIntent).authority,
          nonce: "not-a-number",
          deadline: "2026-05-03T18:16:00Z"
        }
      },
      policy: validPolicy as AgentPolicy,
      riskReport: {
        ...(validRiskReport as RiskReport),
        decision: "block",
        severity: "critical"
      },
      humanReview: {
        ...(validReview as HumanReviewCheckpoint),
        decision: "needs_changes"
      },
      signature: {
        signer: "0x9999999999999999999999999999999999999999",
        signature: ""
      },
      now: "2026-05-03T18:03:00Z"
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "value_limit_exceeds_policy",
        "invalid_nonce",
        "deadline_exceeds_policy_window",
        "risk_report_blocks",
        "risk_severity_too_high",
        "human_review_not_approved",
        "signature_signer_mismatch",
        "signature_missing"
      ])
    );
  });

  it("rejects lifecycle evidence mismatches before advancing state", () => {
    const reviewedIntent = {
      ...(validIntent as AgentIntent),
      lifecycleState: "reviewed"
    } satisfies AgentIntent;

    const result = advanceIntentLifecycle(reviewedIntent, {
      humanReview: {
        ...(validReview as HumanReviewCheckpoint),
        approvedIntentHash: "0x9999999999999999999999999999999999999999999999999999999999999999"
      }
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.issues.map((issue) => issue.code)).toContain("lifecycle_evidence_mismatch");
  });

  it("reports the next lifecycle evidence needed for machine-readable CLI wrappers", () => {
    const proposedIntent = {
      ...(validIntent as AgentIntent),
      lifecycleState: "proposed"
    } satisfies AgentIntent;

    const blockedStatus = inspectLifecycle(proposedIntent);
    expect(blockedStatus.canAdvance).toBe(false);
    expect(blockedStatus.nextState).toBe("policy_checked");
    expect(blockedStatus.missingEvidence).toEqual(["policy"]);

    const readyStatus = inspectLifecycle(proposedIntent, {
      policy: { policyHash: proposedIntent.policy.policyHash }
    });
    expect(readyStatus.canAdvance).toBe(true);
    expect(readyStatus.blockingIssues).toEqual([]);
  });

  it("advances lifecycle one state at a time with bound evidence", () => {
    const proposedIntent = {
      ...(validIntent as AgentIntent),
      lifecycleState: "proposed"
    } satisfies AgentIntent;

    const policyChecked = advanceIntentLifecycle(proposedIntent, {
      policy: { policyHash: proposedIntent.policy.policyHash }
    });

    expect(policyChecked.ok).toBe(true);
    expect(policyChecked.ok ? policyChecked.value.lifecycleState : undefined).toBe("policy_checked");

    const reviewed = advanceIntentLifecycle(policyChecked.ok ? policyChecked.value : proposedIntent, {
      riskReport: validRiskReport as RiskReport
    });
    expect(reviewed.ok).toBe(true);
    expect(reviewed.ok ? reviewed.value.lifecycleState : undefined).toBe("reviewed");
  });

  it("requires execution and audit evidence for terminal lifecycle states", () => {
    const submittedIntent = {
      ...(validIntent as AgentIntent),
      lifecycleState: "submitted"
    } satisfies AgentIntent;

    const executed = advanceIntentLifecycle(submittedIntent, {
      executionReceipt: validReceipt as ExecutionReceipt
    });
    expect(executed.ok).toBe(true);
    expect(executed.ok ? executed.value.lifecycleState : undefined).toBe("executed");

    const audited = advanceIntentLifecycle(executed.ok ? executed.value : submittedIntent, {
      auditBundle: validAuditBundle as AuditBundle
    });
    expect(audited.ok).toBe(true);
    expect(audited.ok ? audited.value.lifecycleState : undefined).toBe("audited");
  });

  it("derives an incomplete proposed state snapshot with missing policy evidence", () => {
    const snapshot = deriveCoreStateSnapshot({
      intent: {
        ...(validIntent as AgentIntent),
        lifecycleState: "proposed"
      }
    });

    expect(snapshot.intentId).toBe((validIntent as AgentIntent).intentId);
    expect(snapshot.currentState).toBe("proposed");
    expect(snapshot.nextState).toBe("policy_checked");
    expect(snapshot.executionBlocked).toBe(true);
    expect(snapshot.evidence.policy).toBe("missing");
    expect(snapshot.missingEvidence).toEqual(["policy"]);
    expect(snapshot.nextAction?.code).toBe("load_policy");
  });

  it("derives a ready-to-advance policy state snapshot", () => {
    const intent = {
      ...(validIntent as AgentIntent),
      lifecycleState: "proposed"
    } satisfies AgentIntent;
    const snapshot = deriveCoreStateSnapshot({
      intent,
      evidence: { policy: { policyHash: intent.policy.policyHash } }
    });

    expect(snapshot.canAdvance).toBe(true);
    expect(snapshot.blockingIssues).toEqual([]);
    expect(snapshot.evidence.policy).toBe("present");
  });

  it("derives stable blocked-state issue codes for mismatched evidence", () => {
    const snapshot = deriveCoreStateSnapshot({
      intent: {
        ...(validIntent as AgentIntent),
        lifecycleState: "proposed"
      },
      evidence: {
        policy: {
          policyHash: "0x9999999999999999999999999999999999999999999999999999999999999999"
        }
      }
    });

    expect(snapshot.canAdvance).toBe(false);
    expect(snapshot.executionBlocked).toBe(true);
    expect(snapshot.evidence.policy).toBe("mismatched");
    expect(snapshot.blockingIssues.map((issue) => issue.code)).toContain("lifecycle_evidence_mismatch");
  });

  it("identifies human review as the next action for reviewed intents", () => {
    const snapshot = deriveCoreStateSnapshot({
      intent: {
        ...(validIntent as AgentIntent),
        lifecycleState: "reviewed"
      }
    });

    expect(snapshot.nextState).toBe("human_approved");
    expect(snapshot.nextAction?.code).toBe("request_human_review");
    expect(snapshot.missingEvidence).toEqual(["human_review"]);
  });

  it("identifies verification as the next action for signed intents", () => {
    const snapshot = deriveCoreStateSnapshot({
      intent: {
        ...(validIntent as AgentIntent),
        lifecycleState: "signed"
      }
    });

    expect(snapshot.nextState).toBe("verified");
    expect(snapshot.nextAction?.code).toBe("verify_authority");
    expect(snapshot.missingEvidence).toEqual(["verification"]);
  });

  it("identifies submission as the next action for verified but unsubmitted intents", () => {
    const snapshot = deriveCoreStateSnapshot({
      intent: {
        ...(validIntent as AgentIntent),
        lifecycleState: "verified"
      }
    });

    expect(snapshot.nextState).toBe("submitted");
    expect(snapshot.nextAction?.code).toBe("submit_execution");
    expect(snapshot.executionBlocked).toBe(false);
    expect(snapshot.missingEvidence).toEqual(["submission_receipt"]);
  });

  it("keeps degraded execution and audit signals visible", () => {
    const snapshot = deriveCoreStateSnapshot({
      intent: {
        ...(validIntent as AgentIntent),
        lifecycleState: "verified"
      },
      evidence: {
        executionReceipt: {
          ...(validReceipt as ExecutionReceipt),
          status: "degraded",
          degradedReason: "audit write delayed"
        },
        auditBundle: {
          ...(validAuditBundle as AuditBundle),
          finalStatus: "degraded",
          degradedReasons: ["execution receipt stored locally only"]
        }
      }
    });

    expect(snapshot.evidence.executionReceipt).toBe("degraded");
    expect(snapshot.evidence.auditBundle).toBe("degraded");
    expect(snapshot.degradedSignals).toEqual(
      expect.arrayContaining(["audit write delayed", "audit_degraded", "execution receipt stored locally only"])
    );
  });

  it("points executed intents toward audit bundle creation", () => {
    const snapshot = deriveCoreStateSnapshot({
      intent: {
        ...(validIntent as AgentIntent),
        lifecycleState: "executed"
      }
    });

    expect(snapshot.nextState).toBe("audited");
    expect(snapshot.nextAction?.code).toBe("write_audit_bundle");
    expect(snapshot.missingEvidence).toEqual(["audit_bundle"]);
  });

  it("treats audited state as terminal", () => {
    const snapshot = deriveCoreStateSnapshot({
      intent: {
        ...(validIntent as AgentIntent),
        lifecycleState: "audited"
      }
    });

    expect(snapshot.nextState).toBeUndefined();
    expect(snapshot.nextAction).toBeUndefined();
    expect(snapshot.canAdvance).toBe(false);
    expect(snapshot.executionBlocked).toBe(false);
  });
});
