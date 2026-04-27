import { describe, expect, it } from "vitest";
import validIntent from "../../contracts/examples/valid-agent-intent.json";
import validAuditBundle from "../../contracts/examples/valid-audit-bundle.json";
import validReceipt from "../../contracts/examples/valid-execution-receipt.json";
import { deriveCoreStateSnapshot, type AgentIntent, type AuditBundle, type ExecutionReceipt } from "../../packages/core/src";

describe("ClearIntent core state snapshots", () => {
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

