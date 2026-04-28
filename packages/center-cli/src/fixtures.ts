import validAuditBundle from "../../../contracts/examples/valid-audit-bundle.json";
import validExecutionReceipt from "../../../contracts/examples/valid-execution-receipt.json";
import validHumanReview from "../../../contracts/examples/valid-human-review-checkpoint.json";
import validIntent from "../../../contracts/examples/valid-agent-intent.json";
import validPolicy from "../../../contracts/examples/valid-agent-policy.json";
import validRiskReport from "../../../contracts/examples/valid-risk-report.json";
import type {
  AgentIntent,
  AgentPolicy,
  AuditBundle,
  ExecutionReceipt,
  HumanReviewCheckpoint,
  RiskReport
} from "../../core/src";
import type { LifecycleEvidence } from "../../core/src/status";

export type FixtureName = "valid" | "missing-evidence" | "policy-mismatch" | "expired" | "audited";

export type CliFixture = {
  name: FixtureName;
  intent: AgentIntent;
  policy?: AgentPolicy;
  evidence: LifecycleEvidence;
};

const baseIntent = validIntent as AgentIntent;
const basePolicy = validPolicy as AgentPolicy;
const riskReport = validRiskReport as RiskReport;
const humanReview = validHumanReview as HumanReviewCheckpoint;
const executionReceipt = validExecutionReceipt as ExecutionReceipt;
const auditBundle = validAuditBundle as AuditBundle;

export const defaultClock = "2026-05-03T18:03:00Z";

export function loadFixture(name: FixtureName = "valid"): CliFixture {
  switch (name) {
    case "missing-evidence":
      return {
        name,
        intent: { ...baseIntent, lifecycleState: "proposed" },
        evidence: {}
      };
    case "policy-mismatch":
      return {
        name,
        intent: {
          ...baseIntent,
          policy: {
            ...baseIntent.policy,
            policyHash: "0x9999999999999999999999999999999999999999999999999999999999999999"
          }
        },
        policy: basePolicy,
        evidence: {
          policy: { policyHash: basePolicy.policyHash },
          riskReport,
          humanReview
        }
      };
    case "expired":
      return {
        name,
        intent: {
          ...baseIntent,
          authority: {
            ...baseIntent.authority,
            deadline: "2020-01-01T00:00:00Z"
          }
        },
        policy: basePolicy,
        evidence: {
          policy: { policyHash: basePolicy.policyHash },
          riskReport,
          humanReview,
          signature: {
            signer: baseIntent.authority.signer,
            signature: "0xfixture-signature"
          }
        }
      };
    case "audited":
      return {
        name,
        intent: { ...baseIntent, lifecycleState: "audited" },
        policy: basePolicy,
        evidence: {
          policy: { policyHash: basePolicy.policyHash },
          riskReport,
          humanReview,
          signature: {
            signer: baseIntent.authority.signer,
            signature: "0xfixture-signature"
          },
          verification: {
            status: "verified",
            intentHash: baseIntent.hashes.intentHash,
            policyHash: basePolicy.policyHash
          },
          executionReceipt,
          auditBundle
        }
      };
    case "valid":
      return {
        name,
        intent: baseIntent,
        policy: basePolicy,
        evidence: {
          policy: { policyHash: basePolicy.policyHash },
          riskReport,
          humanReview
        }
      };
  }
}

export function parseFixtureName(value: string | undefined): FixtureName {
  const candidate = value ?? "valid";
  if (candidate === "valid" || candidate === "missing-evidence" || candidate === "policy-mismatch" || candidate === "expired" || candidate === "audited") {
    return candidate;
  }
  throw new Error(`Unknown fixture '${candidate}'. Expected valid, missing-evidence, policy-mismatch, expired, or audited.`);
}
