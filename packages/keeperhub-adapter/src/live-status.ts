import validIntent from "../../../contracts/examples/valid-agent-intent.json";
import type { AgentIntent, ExecutionReceipt } from "../../core/src";
import { buildVerifiedLocalExecutionInput } from "./local-execution-adapter";
import { convertRunToExecutionReceipt } from "./receipt";
import { readKeeperHubLiveConfig, type KeeperHubLiveConfig } from "./live-config";
import {
  KEEPERHUB_LIVE_EXECUTED_CLAIM,
  KEEPERHUB_LIVE_READINESS_CLAIM,
  KEEPERHUB_LIVE_SUBMITTED_CLAIM,
  type ExecutionIssue,
  type ExecutionRun,
  type KeeperHubClaimLevel,
  type VerifiedExecutionIntent
} from "./types";

export type KeeperHubLiveCheck = {
  id:
    | "api-token"
    | "workflow"
    | "executor"
    | "clearintent-binding"
    | "live-probe"
    | "live-submit-gate"
    | "live-submit"
    | "receipt";
  label: string;
  status: "pass" | "degraded" | "blocking";
  detail: string;
};

export type KeeperHubLiveStatus = {
  ok: boolean;
  claimLevel: KeeperHubClaimLevel;
  providerMode: "live";
  localFixtureAvailable: false;
  liveProvider: boolean;
  liveProviderDisabled: boolean;
  liveExecutionProven: boolean;
  authorityApprovalProvidedByKeeperHub: false;
  workflowId?: string;
  executionMode: "workflow" | "direct";
  executorAddress?: string;
  clearIntentEnsName?: string;
  summary: string;
  checks: KeeperHubLiveCheck[];
  blockingReasons: ExecutionIssue["code"][];
  degradedReasons: ExecutionIssue["code"][];
  workflow?: {
    id?: string;
    name?: string;
    visibility?: string;
    updatedAt?: string;
  };
  submission?: {
    executionId?: string;
    runId?: string;
    status?: string;
    transactionHash?: string;
  };
  receipt?: ExecutionReceipt;
};

type FetchLike = (input: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

export async function getKeeperHubLiveStatus(options: {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: FetchLike;
} = {}): Promise<KeeperHubLiveStatus> {
  const config = readKeeperHubLiveConfig(options.env);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const base = buildBaseLiveStatus(config);

  if (base.blockingReasons.length > 0 || !config.liveProbeEnabled || config.workflowId === undefined) {
    return base;
  }

  try {
    const response = await fetchKeeperHub(fetchImpl, config, `/workflows/${config.workflowId}`, { method: "GET" });
    if (!response.ok) {
      return addDegraded(base, "live_probe_failed", `KeeperHub workflow probe returned HTTP ${response.status}.`);
    }
    const payload = await response.json();
    const workflow = unwrapData(payload);
    return {
      ...base,
      ok: base.degradedReasons.length === 0,
      summary: "KeeperHub live workflow probe succeeded. No execution was submitted.",
      checks: base.checks.map((check) =>
        check.id === "live-probe"
          ? { ...check, status: "pass", detail: "KeeperHub workflow lookup succeeded without submitting execution." }
          : check
      ),
      degradedReasons: base.degradedReasons.filter((reason) => reason !== "live_probe_not_enabled"),
      workflow: workflowRecord(workflow)
    };
  } catch (error) {
    return addDegraded(base, "live_probe_failed", error instanceof Error ? error.message : "KeeperHub workflow probe failed.");
  }
}

export async function submitKeeperHubLiveWorkflow(options: {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: FetchLike;
  input?: VerifiedExecutionIntent;
} = {}): Promise<KeeperHubLiveStatus> {
  const config = readKeeperHubLiveConfig(options.env);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const input = options.input ?? buildVerifiedLocalExecutionInput(validIntent as AgentIntent);
  const base = buildBaseLiveStatus(config);

  const submitBlocking: ExecutionIssue["code"][] = [...base.blockingReasons];
  if (!config.liveSubmitEnabled) {
    submitBlocking.push("live_submit_disabled");
  }
  if (input.verification?.status !== "verified" || input.verification.intentHash !== input.intent.hashes.intentHash) {
    submitBlocking.push("missing_verification");
  }
  if (input.signature === undefined || input.signature.signer.toLowerCase() !== input.intent.authority.signer.toLowerCase()) {
    submitBlocking.push("missing_signature");
  }

  if (submitBlocking.length > 0 || config.workflowId === undefined) {
    return {
      ...base,
      ok: false,
      checks: withSubmitChecks(base.checks, false, "KeeperHub live submit is blocked before any provider call."),
      blockingReasons: uniqueIssueCodes(submitBlocking)
    };
  }

  try {
    const response = await fetchKeeperHub(fetchImpl, config, `/workflow/${config.workflowId}/execute`, {
      method: "POST",
      body: JSON.stringify(buildWorkflowSubmitBody(input))
    });
    if (!response.ok) {
      return {
        ...base,
        ok: false,
        checks: withSubmitChecks(base.checks, false, `KeeperHub submit returned HTTP ${response.status}.`),
        blockingReasons: uniqueIssueCodes([...base.blockingReasons, "live_submit_failed"])
      };
    }

    const payload = await response.json();
    const data = unwrapData(payload);
    const run = buildExecutionRun(config.workflowId, data);
    const receipt = convertRunToExecutionReceipt({ intent: input.intent, run });
    const liveExecutionProven = receipt.ok && receipt.value.status === "executed";
    const degradedReasons = receipt.ok
      ? base.degradedReasons
      : uniqueIssueCodes([...base.degradedReasons, ...receipt.issues.map((issue) => issue.code)]);

    return {
      ...base,
      ok: receipt.ok,
      claimLevel: liveExecutionProven ? KEEPERHUB_LIVE_EXECUTED_CLAIM : KEEPERHUB_LIVE_SUBMITTED_CLAIM,
      liveExecutionProven,
      summary: liveExecutionProven
        ? "KeeperHub live workflow submitted and returned executable transaction evidence."
        : "KeeperHub live workflow submitted, but execution receipt remains degraded until transaction evidence is available.",
      checks: withSubmitChecks(base.checks, true, "KeeperHub live workflow execute endpoint accepted the request."),
      degradedReasons,
      submission: {
        executionId: stringField(data, "executionId"),
        runId: stringField(data, "runId") ?? run.runId,
        status: stringField(data, "status") ?? run.status,
        transactionHash: run.transactionHash
      },
      receipt: receipt.value
    };
  } catch (error) {
    return {
      ...base,
      ok: false,
      checks: withSubmitChecks(base.checks, false, error instanceof Error ? error.message : "KeeperHub live submit failed."),
      blockingReasons: uniqueIssueCodes([...base.blockingReasons, "live_submit_failed"])
    };
  }
}

function buildBaseLiveStatus(config: KeeperHubLiveConfig): KeeperHubLiveStatus {
  const checks: KeeperHubLiveCheck[] = [
    {
      id: "api-token",
      label: "KeeperHub API token",
      status: config.apiTokenStatus === "present" ? "pass" : "blocking",
      detail:
        config.apiTokenStatus === "present"
          ? "Organization API token is configured and was not printed."
          : config.apiTokenStatus === "invalid"
            ? "KEEPERHUB_API_TOKEN is present but does not look like an organization key."
            : "KEEPERHUB_API_TOKEN is missing."
    },
    {
      id: "workflow",
      label: "KeeperHub workflow",
      status: config.workflowId === undefined ? "blocking" : "pass",
      detail: config.workflowId === undefined ? "KEEPERHUB_WORKFLOW_ID is missing." : "Workflow ID is configured."
    },
    {
      id: "executor",
      label: "KeeperHub executor",
      status: config.executorAddressStatus === "invalid" ? "blocking" : config.executorAddressStatus === "present" ? "pass" : "degraded",
      detail:
        config.executorAddressStatus === "present"
          ? "Executor address is configured for receipt/audit binding."
          : config.executorAddressStatus === "invalid"
            ? "KEEPERHUB_EXECUTOR_ADDRESS is present but invalid."
            : "Executor address is not configured; live receipt can still be recorded but executor binding is degraded."
    },
    {
      id: "clearintent-binding",
      label: "0G/ENS binding",
      status: config.clearIntentBinding.complete ? "pass" : "blocking",
      detail: config.clearIntentBinding.complete
        ? "ClearIntent policy, audit, and agent-card refs are configured from the 0G/ENS binding."
        : "ClearIntent 0G/ENS binding refs are incomplete."
    },
    {
      id: "live-probe",
      label: "Live probe",
      status: config.liveProbeEnabled ? "degraded" : "degraded",
      detail: config.liveProbeEnabled
        ? "Live probe is enabled; workflow lookup has not completed yet."
        : "Set KEEPERHUB_ENABLE_LIVE_PROBE=true to probe the workflow without submitting execution."
    },
    {
      id: "live-submit-gate",
      label: "Live submit gate",
      status: config.liveSubmitEnabled ? "degraded" : "degraded",
      detail: config.liveSubmitEnabled
        ? "KEEPERHUB_ENABLE_LIVE_SUBMIT=true. Live submit may execute the selected workflow."
        : "KEEPERHUB_ENABLE_LIVE_SUBMIT is false; live execution remains gated."
    }
  ];

  const blockingReasons: ExecutionIssue["code"][] = [];
  const degradedReasons: ExecutionIssue["code"][] = [];

  if (config.apiTokenStatus === "missing") blockingReasons.push("missing_api_token");
  if (config.apiTokenStatus === "invalid") blockingReasons.push("invalid_api_token");
  if (config.workflowId === undefined) blockingReasons.push("missing_workflow_id");
  if (config.executorAddressStatus === "invalid") blockingReasons.push("invalid_executor_address");
  if (!config.clearIntentBinding.complete) blockingReasons.push("missing_clearintent_binding");
  if (config.executorAddressStatus === "missing") degradedReasons.push("unsupported_executor");
  if (!config.liveProbeEnabled) degradedReasons.push("live_probe_not_enabled");

  return {
    ok: blockingReasons.length === 0 && degradedReasons.length === 0,
    claimLevel: KEEPERHUB_LIVE_READINESS_CLAIM,
    providerMode: "live",
    localFixtureAvailable: false,
    liveProvider: config.apiTokenStatus === "present",
    liveProviderDisabled: config.apiTokenStatus !== "present",
    liveExecutionProven: false,
    authorityApprovalProvidedByKeeperHub: false,
    workflowId: config.workflowId,
    executionMode: config.executionMode,
    executorAddress: config.executorAddress,
    clearIntentEnsName: config.clearIntentBinding.ensName,
    summary:
      blockingReasons.length === 0
        ? "KeeperHub live configuration is present. No live execution is proven until live-submit succeeds."
        : "KeeperHub live configuration is blocked before execution.",
    checks,
    blockingReasons,
    degradedReasons
  };
}

function withSubmitChecks(checks: KeeperHubLiveCheck[], accepted: boolean, detail: string): KeeperHubLiveCheck[] {
  return [
    ...checks,
    {
      id: "live-submit",
      label: "Live submit",
      status: accepted ? "pass" : "blocking",
      detail
    }
  ];
}

function addDegraded(status: KeeperHubLiveStatus, code: ExecutionIssue["code"], detail: string): KeeperHubLiveStatus {
  return {
    ...status,
    ok: false,
    checks: status.checks.map((check) => (check.id === "live-probe" ? { ...check, status: "degraded", detail } : check)),
    degradedReasons: uniqueIssueCodes([...status.degradedReasons, code])
  };
}

function buildWorkflowSubmitBody(input: VerifiedExecutionIntent): Record<string, unknown> {
  return {
    clearintent: {
      intentId: input.intent.intentId,
      intentHash: input.intent.hashes.intentHash,
      policyHash: input.intent.policy.policyHash,
      agentEnsName: input.intent.agentIdentity.ensName,
      action: input.intent.action,
      authority: input.intent.authority,
      verification: input.verification,
      submittedBy: "clearintent-cli"
    }
  };
}

function buildExecutionRun(workflowId: string, payload: unknown): ExecutionRun {
  const status = stringField(payload, "status");
  const transactionHash = stringField(payload, "transactionHash");
  const runId = stringField(payload, "runId") ?? stringField(payload, "executionId") ?? `keeperhub-live-${Date.now()}`;
  return {
    claimLevel: transactionHash !== undefined ? KEEPERHUB_LIVE_EXECUTED_CLAIM : KEEPERHUB_LIVE_SUBMITTED_CLAIM,
    workflowId,
    runId,
    submittedAt: new Date().toISOString(),
    status: mapRunStatus(status),
    transactionHash,
    error: stringField(payload, "error")
  };
}

function mapRunStatus(status: string | undefined): ExecutionRun["status"] {
  if (status === "success" || status === "completed" || status === "executed") return "executed";
  if (status === "failed" || status === "error") return "failed";
  if (status === "running") return "running";
  if (status === "pending") return "pending";
  return "submitted";
}

async function fetchKeeperHub(
  fetchImpl: FetchLike,
  config: KeeperHubLiveConfig,
  path: string,
  init: { method: string; body?: string }
): Promise<Awaited<ReturnType<FetchLike>>> {
  if (config.apiToken === undefined) {
    throw new Error("KEEPERHUB_API_TOKEN is missing.");
  }
  return fetchImpl(`${config.baseUrl}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json"
    },
    body: init.body
  });
}

function unwrapData(payload: unknown): unknown {
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as { data: unknown }).data;
  }
  return payload;
}

function stringField(payload: unknown, key: string): string | undefined {
  if (typeof payload !== "object" || payload === null || !(key in payload)) {
    return undefined;
  }
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function uniqueIssueCodes(values: ExecutionIssue["code"][]): ExecutionIssue["code"][] {
  return [...new Set(values)];
}

function workflowRecord(value: unknown): KeeperHubLiveStatus["workflow"] {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }
  return {
    id: stringField(value, "id"),
    name: stringField(value, "name"),
    visibility: stringField(value, "visibility"),
    updatedAt: stringField(value, "updatedAt")
  };
}
