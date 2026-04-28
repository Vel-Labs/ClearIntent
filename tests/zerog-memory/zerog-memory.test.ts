import { describe, expect, it } from "vitest";
import validIntent from "../../contracts/examples/valid-agent-intent.json";
import validPolicy from "../../contracts/examples/valid-agent-policy.json";
import validReceipt from "../../contracts/examples/valid-execution-receipt.json";
import validReview from "../../contracts/examples/valid-human-review-checkpoint.json";
import validRiskReport from "../../contracts/examples/valid-risk-report.json";
import type {
  AgentIntent,
  AgentPolicy,
  ExecutionReceipt,
  HumanReviewCheckpoint,
  RiskReport,
  SignatureEvidence
} from "../../packages/core/src";
import {
  hashArtifactPayload,
  LocalAuditStore,
  LocalMemoryAdapter,
  type ArtifactEnvelope,
  type ArtifactFamily,
  type ArtifactPayloadByFamily
} from "../../packages/zerog-memory/src";

const fixedNow = "2026-05-03T18:08:00.000Z";

const signatureEvidence: SignatureEvidence = {
  signer: (validIntent as AgentIntent).authority.signer,
  signature: "0xmock-signature"
};

const artifacts = {
  policy: validPolicy as AgentPolicy,
  intent: validIntent as AgentIntent,
  "risk-report": validRiskReport as RiskReport,
  "human-review-checkpoint": validReview as HumanReviewCheckpoint,
  "signature-evidence": signatureEvidence,
  "execution-receipt": validReceipt as ExecutionReceipt
} satisfies Omit<ArtifactPayloadByFamily, "audit-bundle">;

describe("0G local memory adapter", () => {
  it("reports a local-only SDK-shaped status without live provider claims", () => {
    const adapter = new LocalMemoryAdapter({ now: () => fixedNow });

    expect(adapter.status()).toEqual({
      providerMode: "local",
      claimLevel: "local-adapter",
      writable: true,
      readable: true,
      proofVerified: false,
      degradedReasons: []
    });
  });

  it("writes and reads every required non-audit artifact family deterministically", async () => {
    const adapter = new LocalMemoryAdapter({ now: () => fixedNow });

    for (const [family, payload] of Object.entries(artifacts) as [
      keyof typeof artifacts,
      (typeof artifacts)[keyof typeof artifacts]
    ][]) {
      const write = await writeKnownArtifact(adapter, family, payload);
      expect(write.ok).toBe(true);

      const envelope = expectValue(write);
      expect(envelope.family).toBe(family);
      expect(envelope.ref.providerMode).toBe("local");
      expect(envelope.ref.claimLevel).toBe("local-adapter");
      expect(envelope.metadata.contentHash).toBe(hashArtifactPayload(payload));
      expect(envelope.metadata.createdAt).toBe(fixedNow);

      const read = await adapter.readArtifact(envelope.ref);
      expect(read.ok).toBe(true);
      expect(expectValue(read)).toEqual(envelope);
    }
  });

  it("blocks reads for missing artifacts with a loud issue", async () => {
    const adapter = new LocalMemoryAdapter({ now: () => fixedNow });
    const write = await writeKnownArtifact(adapter, "policy", artifacts.policy);
    const ref = expectValue(write).ref;

    const missing = await adapter.readArtifact({
      ...ref,
      uri: "local://zerog-memory/policy/missing-policy"
    });

    expect(missing.ok).toBe(false);
    expect(missing.state).toBe("blocked");
    expect(missing.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_artifact",
          artifact: expect.objectContaining({
            family: "policy",
            uri: "local://zerog-memory/policy/missing-policy"
          })
        })
      ])
    );
  });

  it("blocks reads when stable content hash validation fails", async () => {
    const adapter = new LocalMemoryAdapter({ now: () => fixedNow });
    const write = await writeKnownArtifact(adapter, "policy", artifacts.policy);
    const envelope = expectValue(write);

    adapter.corruptArtifactForTest(envelope.ref, {
      ...(artifacts.policy as AgentPolicy),
      allowedActions: ["unexpected_action"]
    });

    const read = await adapter.readArtifact(envelope.ref);
    expect(read.ok).toBe(false);
    expect(read.state).toBe("blocked");
    expect(read.issues.map((issue) => issue.code)).toContain("mismatched_hash");
  });

  it("degrades when a proof is required but only local hash validation is available", async () => {
    const adapter = new LocalMemoryAdapter({ now: () => fixedNow });
    const write = await writeKnownArtifact(adapter, "intent", artifacts.intent);

    const read = await adapter.readArtifact(expectValue(write).ref, { requireProof: true });
    expect(read.ok).toBe(false);
    expect(read.state).toBe("degraded");
    expect(read.value?.family).toBe("intent");
    expect(read.issues.map((issue) => issue.code)).toContain("missing_proof");
  });

  it("degrades write results when required readback is missing", async () => {
    const adapter = new LocalMemoryAdapter({
      now: () => fixedNow,
      failReadbackUris: ["local://zerog-memory/intent/intent-1"]
    });

    const write = await adapter.writeArtifact({
      family: "intent",
      artifactId: "intent-1",
      payload: artifacts.intent,
      verifyReadback: true
    });

    expect(write.ok).toBe(false);
    expect(write.state).toBe("degraded");
    expect(write.value?.family).toBe("intent");
    expect(write.issues.map((issue) => issue.code)).toContain("missing_readback");
  });

  it("blocks unsupported live claim levels instead of performing network-shaped work", async () => {
    const adapter = new LocalMemoryAdapter({ now: () => fixedNow, claimLevel: "0g-write-read" });

    const write = await writeKnownArtifact(adapter, "policy", artifacts.policy);
    expect(write.ok).toBe(false);
    expect(write.state).toBe("blocked");
    expect(write.issues.map((issue) => issue.code)).toContain("provider_mode_unsupported");
    expect(adapter.status().degradedReasons).toEqual(["local adapter only supports local-adapter claims"]);
  });
});

describe("0G local audit store", () => {
  it("creates a local audit bundle over individual artifact refs", async () => {
    const adapter = new LocalMemoryAdapter({ now: () => fixedNow });
    const auditStore = new LocalAuditStore(adapter);
    const refs = await writeBundleRefs(adapter);

    const bundle = await auditStore.createAuditBundle({
      bundleId: "bundle-1",
      intentHash: (validIntent as AgentIntent).hashes.intentHash,
      policyHash: (validPolicy as AgentPolicy).policyHash,
      refs,
      createdAt: fixedNow,
      verifyReadback: true
    });

    expect(bundle.ok).toBe(true);
    const envelope = expectValue(bundle);
    expect(envelope.family).toBe("audit-bundle");
    expect(envelope.payload.finalStatus).toBe("audited");
    expect(envelope.payload.artifacts).toEqual(refs);
    expect(envelope.ref.uri).toBe("local://zerog-memory/audit-bundle/bundle-1");

    const read = await auditStore.readAuditBundle(envelope.ref);
    expect(read.ok).toBe(true);
    expect(expectValue(read)).toEqual(envelope);
  });

  it("marks incomplete audit bundle writes as degraded", async () => {
    const adapter = new LocalMemoryAdapter({
      now: () => fixedNow,
      failReadbackUris: ["local://zerog-memory/audit-bundle/bundle-2"]
    });
    const auditStore = new LocalAuditStore(adapter);
    const refs = await writeBundleRefs(adapter);

    const bundle = await auditStore.createAuditBundle({
      bundleId: "bundle-2",
      intentHash: (validIntent as AgentIntent).hashes.intentHash,
      policyHash: (validPolicy as AgentPolicy).policyHash,
      refs,
      createdAt: fixedNow,
      verifyReadback: true
    });

    expect(bundle.ok).toBe(false);
    expect(bundle.state).toBe("degraded");
    expect(bundle.value?.family).toBe("audit-bundle");
    expect(bundle.issues.map((issue) => issue.code)).toContain("incomplete_audit_write");
  });

  it("marks audit bundles as degraded when a required ref is absent", async () => {
    const adapter = new LocalMemoryAdapter({ now: () => fixedNow });
    const auditStore = new LocalAuditStore(adapter);
    const refs = await writeBundleRefs(adapter);

    const bundle = await auditStore.createAuditBundle({
      bundleId: "bundle-3",
      intentHash: (validIntent as AgentIntent).hashes.intentHash,
      policyHash: (validPolicy as AgentPolicy).policyHash,
      refs: {
        ...refs,
        riskReport: undefined as never
      },
      createdAt: fixedNow
    });

    expect(bundle.ok).toBe(true);
    expect(expectValue(bundle).payload.finalStatus).toBe("degraded");
    expect(expectValue(bundle).payload.degradedReasons).toEqual(["missing required audit artifact ref: riskReport"]);
  });
});

async function writeBundleRefs(adapter: LocalMemoryAdapter) {
  const policy = expectValue(await writeKnownArtifact(adapter, "policy", artifacts.policy)).ref;
  const intent = expectValue(await writeKnownArtifact(adapter, "intent", artifacts.intent)).ref;
  const riskReport = expectValue(await writeKnownArtifact(adapter, "risk-report", artifacts["risk-report"])).ref;
  const humanReviewCheckpoint = expectValue(
    await writeKnownArtifact(adapter, "human-review-checkpoint", artifacts["human-review-checkpoint"])
  ).ref;
  const signatureEvidence = expectValue(
    await writeKnownArtifact(adapter, "signature-evidence", artifacts["signature-evidence"])
  ).ref;
  const executionReceipt = expectValue(
    await writeKnownArtifact(adapter, "execution-receipt", artifacts["execution-receipt"])
  ).ref;

  return {
    policy,
    intent,
    riskReport,
    humanReviewCheckpoint,
    signatureEvidence,
    executionReceipt
  };
}

function writeKnownArtifact<F extends Exclude<ArtifactFamily, "audit-bundle">>(
  adapter: LocalMemoryAdapter,
  family: F,
  payload: ArtifactPayloadByFamily[F]
) {
  return adapter.writeArtifact({
    family,
    artifactId: `${family}-1`,
    payload,
    verifyReadback: true
  });
}

function expectValue<F extends ArtifactFamily>(
  result: { ok: true; value: ArtifactEnvelope<F> } | { ok: false; value?: ArtifactEnvelope<F> }
): ArtifactEnvelope<F> {
  expect(result.value).toBeDefined();
  return result.value as ArtifactEnvelope<F>;
}
