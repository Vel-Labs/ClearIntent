import { describe, expect, it } from "vitest";
import {
  assertAuditBundleBindsIntentAndPolicy,
  assertExpiredDeadline,
  assertHumanReviewBindsIntent,
  assertPolicyHashMismatch,
  compileSchemas,
  FIXED_TEST_CLOCK,
  loadContractCorpus,
  schemaTitleForFixture
} from "../../scripts/validate-contracts";

describe("ClearIntent contract validation", async () => {
  const corpus = await loadContractCorpus();
  const validators = compileSchemas(corpus.schemas);

  it("loads all schemas as valid JSON", () => {
    expect(corpus.schemas.size).toBeGreaterThan(0);
    expect([...corpus.schemas.keys()].sort()).toEqual([
      "agent-intent.schema.json",
      "agent-policy.schema.json",
      "audit-bundle.schema.json",
      "execution-receipt.schema.json",
      "human-review-checkpoint.schema.json",
      "risk-report.schema.json"
    ]);
  });

  it("loads all examples as valid JSON", () => {
    expect(corpus.examples.size).toBeGreaterThan(0);
    expect([...corpus.examples.keys()].sort()).toEqual([
      "invalid-expired-deadline.json",
      "invalid-missing-policy.json",
      "invalid-policy-hash.json",
      "valid-agent-intent.json",
      "valid-agent-policy.json",
      "valid-audit-bundle.json",
      "valid-execution-receipt.json",
      "valid-human-review-checkpoint.json",
      "valid-risk-report.json"
    ]);
  });

  it("compiles all schemas", () => {
    expect([...validators.keys()].sort()).toEqual([
      "AgentIntent",
      "AgentPolicy",
      "AuditBundle",
      "ExecutionReceipt",
      "HumanReviewCheckpoint",
      "RiskReport"
    ]);
  });

  it("accepts every valid fixture against its intended schema", () => {
    for (const [fixtureName, fixture] of corpus.examples) {
      if (!fixtureName.startsWith("valid-")) {
        continue;
      }

      const schemaTitle = schemaTitleForFixture(fixtureName);
      expect(schemaTitle, `${fixtureName} should map to an intended schema`).toBeDefined();
      const validator = validators.get(schemaTitle as string);
      expect(validator, `${schemaTitle} should be compiled`).toBeDefined();
      expect(validator?.(fixture), `${fixtureName} should satisfy ${schemaTitle}`).toBe(true);
    }
  });

  it("rejects the missing-policy fixture at schema validation", () => {
    const validator = validators.get("AgentIntent");
    const fixture = corpus.examples.get("invalid-missing-policy.json");

    expect(validator).toBeDefined();
    expect(fixture).toBeDefined();
    expect(validator?.(fixture), "AgentIntent requires policy URI and hash").toBe(false);
  });

  it("semantically rejects the expired deadline fixture with a fixed clock", () => {
    const fixture = corpus.examples.get("invalid-expired-deadline.json");

    expect(fixture).toBeDefined();
    expect(assertExpiredDeadline(fixture!, FIXED_TEST_CLOCK)).toBeUndefined();
  });

  it("semantically rejects the policy hash mismatch fixture", () => {
    const fixture = corpus.examples.get("invalid-policy-hash.json");
    const policy = corpus.examples.get("valid-agent-policy.json");

    expect(fixture).toBeDefined();
    expect(policy).toBeDefined();
    expect(assertPolicyHashMismatch(fixture!, policy!)).toBeUndefined();
  });

  it("requires the human review checkpoint to bind the exact intent hash", () => {
    const review = corpus.examples.get("valid-human-review-checkpoint.json");
    const intent = corpus.examples.get("valid-agent-intent.json");

    expect(review).toBeDefined();
    expect(intent).toBeDefined();
    expect(assertHumanReviewBindsIntent(review!, intent!)).toBeUndefined();
  });

  it("requires the audit bundle to bind exact intent and policy hashes", () => {
    const auditBundle = corpus.examples.get("valid-audit-bundle.json");
    const intent = corpus.examples.get("valid-agent-intent.json");
    const policy = corpus.examples.get("valid-agent-policy.json");

    expect(auditBundle).toBeDefined();
    expect(intent).toBeDefined();
    expect(policy).toBeDefined();
    expect(assertAuditBundleBindsIntentAndPolicy(auditBundle!, intent!, policy!)).toBeUndefined();
  });
});
