import { describe, expect, it } from "vitest";
import validIntent from "../../contracts/examples/valid-agent-intent.json";
import validPolicy from "../../contracts/examples/valid-agent-policy.json";
import validReview from "../../contracts/examples/valid-human-review-checkpoint.json";
import validRiskReport from "../../contracts/examples/valid-risk-report.json";
import { evaluateCoreAuthority, type AgentIntent, type AgentPolicy, type HumanReviewCheckpoint, type RiskReport } from "../../packages/core/src";

describe("ClearIntent module-facing core API", () => {
  it("composes state snapshot, lifecycle advancement, and authority verification for modules", () => {
    const result = evaluateCoreAuthority({
      intent: {
        ...(validIntent as AgentIntent),
        lifecycleState: "human_approved"
      },
      policy: validPolicy as AgentPolicy,
      evidence: {
        humanReview: validReview as HumanReviewCheckpoint,
        riskReport: validRiskReport as RiskReport,
        signature: {
          signer: (validIntent as AgentIntent).authority.signer,
          signature: "0xmock-signature"
        }
      },
      now: "2026-05-03T18:03:00Z"
    });

    expect(result.snapshot.nextAction?.code).toBe("collect_signature");
    expect(result.lifecycleAdvance?.ok).toBe(true);
    expect(result.lifecycleAdvance?.ok ? result.lifecycleAdvance.value.lifecycleState : undefined).toBe("signed");
    expect(result.authorityVerification?.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("exposes module-facing issue codes without requiring callers to parse messages", () => {
    const result = evaluateCoreAuthority({
      intent: {
        ...(validIntent as AgentIntent),
        lifecycleState: "reviewed"
      },
      policy: {
        ...(validPolicy as AgentPolicy),
        allowedExecutors: ["0x9999999999999999999999999999999999999999"]
      },
      evidence: {
        humanReview: {
          ...(validReview as HumanReviewCheckpoint),
          decision: "rejected"
        }
      },
      now: "2026-05-03T18:03:00Z"
    });

    expect(result.snapshot.nextAction?.code).toBe("request_human_review");
    expect(result.lifecycleAdvance?.ok).toBe(false);
    expect(result.authorityVerification?.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["lifecycle_evidence_mismatch", "executor_not_allowed", "risk_report_missing", "human_review_not_approved"])
    );
  });
});

