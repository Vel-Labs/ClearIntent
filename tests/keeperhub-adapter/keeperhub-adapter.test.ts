import { describe, expect, it } from "vitest";
import validIntent from "../../contracts/examples/valid-agent-intent.json";
import {
  buildVerifiedLocalExecutionInput,
  createLocalKeeperHubExecutionAdapter,
  deterministicLocalWorkflowId,
  getCenterExecutionStatus,
  getKeeperHubLiveStatus,
  KEEPERHUB_LOCAL_FIXTURE_CLAIM,
  submitKeeperHubLiveWorkflow,
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

  it("reports KeeperHub live readiness blockers without printing secrets", async () => {
    const status = await getKeeperHubLiveStatus({
      env: {
        KEEPERHUB_API_TOKEN: "",
        KEEPERHUB_WORKFLOW_ID: "",
        KEEPERHUB_ENABLE_LIVE_PROBE: "false"
      } as NodeJS.ProcessEnv
    });

    expect(status.ok).toBe(false);
    expect(status.claimLevel).toBe("keeperhub-live-readiness");
    expect(status.liveProvider).toBe(false);
    expect(status.blockingReasons).toEqual(expect.arrayContaining(["missing_api_token", "missing_workflow_id"]));
    expect(JSON.stringify(status)).not.toContain("kh_");
  });

  it("probes a configured KeeperHub workflow without submitting execution", async () => {
    const calls: string[] = [];
    const status = await getKeeperHubLiveStatus({
      env: liveKeeperHubEnv({ KEEPERHUB_ENABLE_LIVE_PROBE: "true" }),
      fetchImpl: async (url) => {
        calls.push(url);
        return {
          ok: true,
          status: 200,
          json: async () => ({ data: { id: "wf_demo", name: "ClearIntent demo", visibility: "private" } })
        };
      }
    });

    expect(status.blockingReasons).toEqual([]);
    expect(status.workflow?.id).toBe("wf_demo");
    expect(calls).toEqual(["https://app.keeperhub.com/api/workflows/wf_demo"]);
    expect(status.liveExecutionProven).toBe(false);
  });

  it("keeps KeeperHub live submit gated until explicit opt-in", async () => {
    const status = await submitKeeperHubLiveWorkflow({
      env: liveKeeperHubEnv({ KEEPERHUB_ENABLE_LIVE_SUBMIT: "false" }),
      fetchImpl: async () => {
        throw new Error("fetch should not be called while submit is gated");
      }
    });

    expect(status.ok).toBe(false);
    expect(status.blockingReasons).toEqual(expect.arrayContaining(["live_submit_disabled"]));
    expect(status.submission).toBeUndefined();
  });

  it("submits a verified fixture intent to KeeperHub and returns degraded receipt until tx evidence exists", async () => {
    const status = await submitKeeperHubLiveWorkflow({
      env: liveKeeperHubEnv({ KEEPERHUB_ENABLE_LIVE_SUBMIT: "true" }),
      fetchImpl: async (url, init) => {
        expect(url).toBe("https://app.keeperhub.com/api/workflow/wf_demo/execute");
        expect(init?.method).toBe("POST");
        expect(init?.headers?.Authorization).toBe("Bearer kh_test");
        return {
          ok: true,
          status: 200,
          json: async () => ({ executionId: "exec_demo", runId: "run_demo", status: "pending" })
        };
      }
    });

    expect(status.claimLevel).toBe("keeperhub-live-submitted");
    expect(status.submission?.executionId).toBe("exec_demo");
    expect(status.receipt).toMatchObject({ status: "degraded", degradedReason: "missing_transaction_evidence" });
    expect(status.degradedReasons).toEqual(expect.arrayContaining(["missing_transaction_evidence"]));
  });
});

function liveKeeperHubEnv(overrides: Record<string, string> = {}): NodeJS.ProcessEnv {
  return {
    KEEPERHUB_API_TOKEN: "kh_test",
    KEEPERHUB_WORKFLOW_ID: "wf_demo",
    KEEPERHUB_EXECUTOR_ADDRESS: "0x2222222222222222222222222222222222222222",
    CLEARINTENT_ENS_NAME: "guardian.agent.clearintent.eth",
    CLEARINTENT_AGENT_CARD_URI: "0g://agent-card",
    CLEARINTENT_POLICY_URI: "0g://policy",
    CLEARINTENT_POLICY_HASH: "0x1111111111111111111111111111111111111111111111111111111111111111",
    CLEARINTENT_AUDIT_LATEST: "0g://audit",
    ...overrides
  } as NodeJS.ProcessEnv;
}
