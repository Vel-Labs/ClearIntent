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
});
