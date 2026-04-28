import type {
  AgentIntent,
  AgentPolicy,
  ExecutionReceipt,
  HumanReviewCheckpoint,
  RiskReport,
  SignatureEvidence
} from "../../core/src";
import { createLocalAuditStore } from "./audit-store";
import { createLocalMemoryAdapter } from "./local-memory-adapter";
import type { CenterMemoryStatus, MemoryDoctorCheck, MemoryDoctorReport } from "./types";

export async function getCenterMemoryStatus(): Promise<CenterMemoryStatus> {
  return toCenterMemoryStatus(await runLocalMemoryDoctor());
}

export async function getLocalMemoryStatus(): Promise<CenterMemoryStatus> {
  return getCenterMemoryStatus();
}

export async function runLocalMemoryDoctor(): Promise<MemoryDoctorReport> {
  const memory = createLocalMemoryAdapter();
  const audit = createLocalAuditStore(memory);
  const policy = localPolicy();
  const intent = localIntent(policy);
  const riskReport = localRiskReport(intent, policy);
  const humanReview = localHumanReview(intent, policy);
  const signatureEvidence = localSignatureEvidence(intent);
  const executionReceipt = localExecutionReceipt(intent);

  const policyWrite = await memory.writeArtifact({
    family: "policy",
    artifactId: "local-phase-2a-policy",
    payload: policy,
    verifyReadback: true
  });
  const intentWrite = await memory.writeArtifact({
    family: "intent",
    artifactId: "local-phase-2a-intent",
    payload: intent,
    verifyReadback: true
  });
  const riskWrite = await memory.writeArtifact({
    family: "risk-report",
    artifactId: "local-phase-2a-risk",
    payload: riskReport,
    verifyReadback: true
  });
  const reviewWrite = await memory.writeArtifact({
    family: "human-review-checkpoint",
    artifactId: "local-phase-2a-review",
    payload: humanReview,
    verifyReadback: true
  });
  const signatureWrite = await memory.writeArtifact({
    family: "signature-evidence",
    artifactId: "local-phase-2a-signature",
    payload: signatureEvidence,
    verifyReadback: true
  });
  const receiptWrite = await memory.writeArtifact({
    family: "execution-receipt",
    artifactId: "local-phase-2a-receipt",
    payload: executionReceipt,
    verifyReadback: true
  });
  const proof = policyWrite.ok ? await memory.readArtifact(policyWrite.value.ref, { requireProof: true }) : policyWrite;
  const bundle =
    policyWrite.ok && intentWrite.ok && riskWrite.ok && reviewWrite.ok && signatureWrite.ok && receiptWrite.ok
      ? await audit.createAuditBundle({
          bundleId: "local-phase-2a-bundle",
          intentHash: intent.hashes.intentHash,
          policyHash: policy.policyHash,
          refs: {
            policy: policyWrite.value.ref,
            intent: intentWrite.value.ref,
            riskReport: riskWrite.value.ref,
            humanReviewCheckpoint: reviewWrite.value.ref,
            signatureEvidence: signatureWrite.value.ref,
            executionReceipt: receiptWrite.value.ref
          },
          verifyReadback: true
        })
      : undefined;

  return {
    providerMode: memory.providerMode,
    claimLevel: memory.claimLevel,
    liveProvider: false,
    checks: [
      check("write", policyWrite.ok, "Local policy artifact write succeeded.", "Local policy artifact write failed.", policyWrite.issues[0]?.code),
      check("read", policyWrite.ok, "Local policy artifact readback succeeded.", "Local policy artifact readback failed.", policyWrite.issues[0]?.code),
      check("hash", policyWrite.ok, "Readback content hash matched the artifact ref.", "Readback content hash did not validate.", policyWrite.issues[0]?.code),
      check(
        "audit_bundle",
        bundle?.ok === true,
        "Local audit bundle rolled up artifact refs.",
        "Local audit bundle generation was incomplete.",
        bundle?.issues[0]?.code
      ),
      {
        name: "proof",
        state: "local-only",
        message: "Phase 2A is local-only; live 0G proof is unavailable until Phase 2B.",
        issueCode: proof.issues[0]?.code ?? "missing_proof"
      }
    ],
    issues: [
      ...policyWrite.issues,
      ...intentWrite.issues,
      ...riskWrite.issues,
      ...reviewWrite.issues,
      ...signatureWrite.issues,
      ...receiptWrite.issues,
      ...proof.issues,
      ...(bundle?.issues ?? [])
    ]
  };
}

function check(
  name: MemoryDoctorCheck["name"],
  ok: boolean,
  passMessage: string,
  failMessage: string,
  issueCode?: string
): MemoryDoctorCheck {
  return {
    name,
    state: ok ? "pass" : "degraded",
    message: ok ? passMessage : failMessage,
    issueCode
  };
}

function toCenterMemoryStatus(report: MemoryDoctorReport): CenterMemoryStatus {
  return {
    ok: report.checks.every((check) => check.state === "pass" || check.state === "local-only"),
    providerMode: report.providerMode,
    claimLevel: report.claimLevel,
    liveProvider: false,
    localOnly: true,
    summary: "Local adapter wrote, read, hash-validated, and bundled audit artifacts without live 0G usage.",
    checks: report.checks.map((check) => ({
      id: check.name === "audit_bundle" ? "audit-bundle" : check.name,
      label: labelForCheck(check.name),
      status: check.state === "blocked" ? "fail" : check.state,
      detail: check.message
    })),
    degradedReasons: ["missing_proof", "live_provider_disabled"]
  };
}

function labelForCheck(name: MemoryDoctorCheck["name"]): string {
  if (name === "audit_bundle") {
    return "Audit bundle";
  }
  if (name === "write") {
    return "Write check";
  }
  if (name === "read") {
    return "Read check";
  }
  if (name === "hash") {
    return "Hash validation";
  }
  return "Proof check";
}

function localPolicy(): AgentPolicy {
  return {
    schemaVersion: "clearintent.agent-policy.v1",
    policyId: "local-phase-2a-policy",
    policyHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
    subject: {
      ensName: "local.clearintent.eth",
      controllerAddress: "0x1111111111111111111111111111111111111111"
    },
    allowedActions: ["contract_call"],
    allowedExecutors: ["0x2222222222222222222222222222222222222222"],
    signerRequirements: {
      allowedSigners: ["0x3333333333333333333333333333333333333333"],
      hardwareBackedRequired: true
    },
    limits: {
      maxValue: "0",
      deadlineSeconds: 900
    },
    riskRequirements: {
      riskReviewRequired: true,
      maxAllowedSeverity: "medium"
    }
  };
}

function localIntent(policy: AgentPolicy): AgentIntent {
  return {
    schemaVersion: "clearintent.agent-intent.v1",
    intentId: "local-phase-2a-intent",
    lifecycleState: "human_approved",
    createdAt: "2026-04-28T00:00:00.000Z",
    agentIdentity: {
      ensName: policy.subject.ensName,
      controllerAddress: policy.subject.controllerAddress
    },
    policy: {
      policyUri: "local://zerog-memory/policy/local-phase-2a-policy",
      policyHash: policy.policyHash
    },
    action: {
      actionType: "contract_call",
      target: "0x4444444444444444444444444444444444444444",
      chainId: 11155111,
      valueLimit: "0",
      description: "Local Phase 2A memory doctor action."
    },
    authority: {
      signer: "0x3333333333333333333333333333333333333333",
      executor: "0x2222222222222222222222222222222222222222",
      nonce: "1",
      deadline: "2026-04-28T00:15:00.000Z",
      verifyingContract: "0x5555555555555555555555555555555555555555"
    },
    hashes: {
      actionHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      intentHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    }
  };
}

function localRiskReport(intent: AgentIntent, policy: AgentPolicy): RiskReport {
  return {
    schemaVersion: "clearintent.risk-report.v1",
    reportId: "local-phase-2a-risk",
    intentHash: intent.hashes.intentHash,
    policyHash: policy.policyHash,
    decision: "needs_human_review",
    severity: "low",
    reasons: ["Local adapter doctor keeps human review explicit."],
    createdAt: "2026-04-28T00:01:00.000Z",
    degradedSignals: []
  };
}

function localHumanReview(intent: AgentIntent, policy: AgentPolicy): HumanReviewCheckpoint {
  return {
    schemaVersion: "clearintent.human-review-checkpoint.v1",
    reviewId: "local-phase-2a-review",
    reviewer: "local-operator",
    decision: "approved",
    reviewedAt: "2026-04-28T00:02:00.000Z",
    approvedIntentHash: intent.hashes.intentHash,
    policyHash: policy.policyHash,
    summary: "Approved local Phase 2A memory doctor intent.",
    displayWarnings: ["Local adapter has no live 0G proof."]
  };
}

function localSignatureEvidence(intent: AgentIntent): SignatureEvidence {
  return {
    signer: intent.authority.signer,
    signature: "0xlocal-signature"
  };
}

function localExecutionReceipt(intent: AgentIntent): ExecutionReceipt {
  return {
    schemaVersion: "clearintent.execution-receipt.v1",
    receiptId: "local-phase-2a-receipt",
    intentHash: intent.hashes.intentHash,
    executor: {
      adapter: "local",
      address: intent.authority.executor
    },
    status: "executed",
    submittedAt: "2026-04-28T00:05:00.000Z",
    completedAt: "2026-04-28T00:06:00.000Z"
  };
}
