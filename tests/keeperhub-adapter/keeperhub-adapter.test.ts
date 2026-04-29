import { describe, expect, it } from "vitest";
import validIntent from "../../contracts/examples/valid-agent-intent.json";
import {
  buildVerifiedLocalExecutionInput,
  createLocalKeeperHubExecutionAdapter,
  deterministicLocalWorkflowId,
  getCenterExecutionStatus,
  KEEPERHUB_LOCAL_FIXTURE_CLAIM,
  type VerifiedExecutionIntent
} from "../../packages/keeperhub-adapter/src";
import { createContractValidator, type AgentIntent } from "../../packages/core/src";

const intent = validIntent as AgentIntent;

describe("KeeperHub local execution adapter", () => {
  it("maps a verified intent to a deterministic local workflow fixture", () => {
    const adapter = createLocalKeeperHubExecutionAdapter();
    const result = adapter.createWorkflow(buildVerifiedLocalExecutionInput(intent));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toMatchObject({
        claimLevel: KEEPERHUB_LOCAL_FIXTURE_CLAIM,
        workflowId: "keeperhub-local-workflow-guardian-demo-intent-001",
        intentHash: intent.hashes.intentHash,
        executor: intent.authority.executor
      });
      expect(result.value.action.actionType).toBe("contract_call");
    }
  });

  it("submits locally with deterministic workflow and run IDs", () => {
    const adapter = createLocalKeeperHubExecutionAdapter();
    const result = adapter.submitWorkflow(buildVerifiedLocalExecutionInput(intent));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.workflowId).toBe(deterministicLocalWorkflowId(intent));
      expect(result.value.runId).toBe("keeperhub-local-workflow-guardian-demo-intent-001-run-001");
      expect(result.value.submittedAt).toBe("2026-05-03T18:05:00Z");
    }
  });

  it("monitors locally to a deterministic terminal status", () => {
    const adapter = createLocalKeeperHubExecutionAdapter();
    const submission = adapter.submitWorkflow(buildVerifiedLocalExecutionInput(intent));
    expect(submission.ok).toBe(true);
    if (!submission.ok) return;

    const run = adapter.monitorRun({ workflowId: submission.value.workflowId, runId: submission.value.runId });

    expect(run.ok).toBe(true);
    if (run.ok) {
      expect(run.value.status).toBe("executed");
      expect(run.value.completedAt).toBe("2026-05-03T18:06:00Z");
      expect(run.value.transactionHash).toMatch(/^0x[c]{64}$/);
    }
  });

  it("converts local run evidence into the canonical ExecutionReceipt schema", async () => {
    const adapter = createLocalKeeperHubExecutionAdapter();
    const submission = adapter.submitWorkflow(buildVerifiedLocalExecutionInput(intent));
    expect(submission.ok).toBe(true);
    if (!submission.ok) return;
    const run = adapter.monitorRun({ workflowId: submission.value.workflowId, runId: submission.value.runId });

    const receipt = adapter.toReceipt({ intent, run: run.value });
    expect(receipt.ok).toBe(true);
    if (!receipt.ok) return;

    const validator = await createContractValidator();
    const schemaResult = validator.validateContract("ExecutionReceipt", receipt.value);
    expect(schemaResult.ok).toBe(true);
    expect(receipt.value.executor.adapter).toBe("keeperhub");
    expect(receipt.value.status).toBe("executed");
  });

  it("blocks submission when verification evidence is missing", () => {
    const adapter = createLocalKeeperHubExecutionAdapter();
    const input: VerifiedExecutionIntent = {
      ...buildVerifiedLocalExecutionInput(intent),
      verification: undefined
    };

    const result = adapter.submitWorkflow(input);

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: "missing_verification" })]));
  });

  it("blocks submission when signature evidence is missing", () => {
    const adapter = createLocalKeeperHubExecutionAdapter();
    const input: VerifiedExecutionIntent = {
      ...buildVerifiedLocalExecutionInput(intent),
      signature: undefined
    };

    const result = adapter.submitWorkflow(input);

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: "missing_signature" })]));
  });

  it("blocks submission for unsupported executors", () => {
    const adapter = createLocalKeeperHubExecutionAdapter();
    const input = buildVerifiedLocalExecutionInput({
      ...intent,
      authority: {
        ...intent.authority,
        executor: "0x9999999999999999999999999999999999999999"
      }
    });

    const result = adapter.submitWorkflow(input);

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: "unsupported_executor" })]));
  });

  it("blocks monitor and receipt behavior when workflow ID is missing", () => {
    const adapter = createLocalKeeperHubExecutionAdapter();
    const run = adapter.monitorRun({ workflowId: "" });
    const receipt = adapter.toReceipt({
      intent,
      run: {
        claimLevel: KEEPERHUB_LOCAL_FIXTURE_CLAIM,
        workflowId: "",
        runId: "missing-workflow-run",
        submittedAt: "2026-05-03T18:05:00Z",
        status: "degraded"
      }
    });

    expect(run.ok).toBe(false);
    expect(run.issues[0]?.code).toBe("missing_workflow_id");
    expect(receipt.ok).toBe(false);
    expect(receipt.issues[0]?.code).toBe("missing_workflow_id");
  });

  it("returns explicit failed_run issue for failed local runs", () => {
    const adapter = createLocalKeeperHubExecutionAdapter({ terminalStatus: "failed" });
    const submission = adapter.submitWorkflow(buildVerifiedLocalExecutionInput(intent));
    expect(submission.ok).toBe(true);
    if (!submission.ok) return;

    const run = adapter.monitorRun({ workflowId: submission.value.workflowId, runId: submission.value.runId });
    const receipt = adapter.toReceipt({ intent, run: run.value });

    expect(run.ok).toBe(false);
    expect(run.issues[0]?.code).toBe("failed_run");
    expect(receipt.value?.status).toBe("failed");
  });

  it("treats missing transaction evidence as degraded and not a live/onchain claim", () => {
    const adapter = createLocalKeeperHubExecutionAdapter({ includeTransactionEvidence: false });
    const submission = adapter.submitWorkflow(buildVerifiedLocalExecutionInput(intent));
    expect(submission.ok).toBe(true);
    if (!submission.ok) return;

    const run = adapter.monitorRun({ workflowId: submission.value.workflowId, runId: submission.value.runId });
    const receipt = adapter.toReceipt({ intent, run: run.value });

    expect(run.value?.transactionHash).toBeUndefined();
    expect(receipt.ok).toBe(false);
    expect(receipt.value?.status).toBe("degraded");
    expect(receipt.value?.transactionHash).toBeUndefined();
    expect(receipt.issues[0]?.code).toBe("missing_transaction_evidence");
  });

  it("reports live provider unavailable and no live execution claim", () => {
    const adapter = createLocalKeeperHubExecutionAdapter();
    const status = adapter.status();
    const centerStatus = getCenterExecutionStatus();

    expect(status.claimLevel).toBe("keeperhub-local-fixture");
    expect(status.localFixtureAvailable).toBe(true);
    expect(status.liveProvider).toBe(false);
    expect(status.liveExecutionProven).toBe(false);
    expect(status.authorityApprovalProvidedByKeeperHub).toBe(false);
    expect(status.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: "live_provider_unavailable" })]));
    expect(centerStatus.liveProviderDisabled).toBe(true);
    expect(centerStatus.liveExecutionProven).toBe(false);
  });
});
