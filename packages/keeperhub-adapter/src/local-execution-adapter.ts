import type { AgentIntent } from "../../core/src";
import { convertRunToExecutionReceipt } from "./receipt";
import {
  deterministicRunId,
  deterministicWorkflowId,
  isSupportedLocalExecutor,
  mapVerifiedIntentToWorkflow
} from "./workflow-mapping";
import {
  KEEPERHUB_LOCAL_FIXTURE_CLAIM,
  type ExecutionAdapter,
  type ExecutionAdapterStatus,
  type ExecutionIssue,
  type ExecutionResult,
  type ExecutionRun,
  type ExecutionSubmission,
  type KeeperHubWorkflowRequest,
  type VerifiedExecutionIntent
} from "./types";

const LOCAL_SUBMITTED_AT = "2026-05-03T18:05:00Z";
const LOCAL_COMPLETED_AT = "2026-05-03T18:06:00Z";
const LOCAL_TRANSACTION_HASH = "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";

export type LocalExecutionAdapterOptions = {
  terminalStatus?: "executed" | "failed";
  includeTransactionEvidence?: boolean;
};

export class LocalKeeperHubExecutionAdapter implements ExecutionAdapter {
  readonly claimLevel = KEEPERHUB_LOCAL_FIXTURE_CLAIM;
  readonly providerMode = "local" as const;
  private readonly terminalStatus: "executed" | "failed";
  private readonly includeTransactionEvidence: boolean;

  constructor(options: LocalExecutionAdapterOptions = {}) {
    this.terminalStatus = options.terminalStatus ?? "executed";
    this.includeTransactionEvidence = options.includeTransactionEvidence ?? true;
  }

  status(): ExecutionAdapterStatus {
    return {
      claimLevel: this.claimLevel,
      providerMode: this.providerMode,
      localFixtureAvailable: true,
      liveProvider: false,
      liveProviderDisabled: true,
      liveExecutionProven: false,
      authorityApprovalProvidedByKeeperHub: false,
      summary: "Local KeeperHub fixture adapter is available. Live KeeperHub and onchain execution are disabled and unproven.",
      issues: [
        {
          code: "live_provider_unavailable",
          message: "Phase 4A does not call live KeeperHub, KeeperHub CLI, MCP, or onchain execution surfaces.",
          path: "keeperhub.live"
        }
      ]
    };
  }

  createWorkflow(input: VerifiedExecutionIntent): ExecutionResult<KeeperHubWorkflowRequest> {
    const issues = validateExecutionInput(input);
    if (issues.length > 0) {
      return { ok: false, issues };
    }
    return { ok: true, value: mapVerifiedIntentToWorkflow(input), issues: [] };
  }

  submitWorkflow(input: VerifiedExecutionIntent): ExecutionResult<ExecutionSubmission> {
    const workflow = this.createWorkflow(input);
    if (!workflow.ok) {
      return { ok: false, issues: workflow.issues };
    }
    return {
      ok: true,
      value: {
        claimLevel: this.claimLevel,
        workflowId: workflow.value.workflowId,
        runId: deterministicRunId(workflow.value.workflowId),
        submittedAt: LOCAL_SUBMITTED_AT
      },
      issues: []
    };
  }

  monitorRun(input: { workflowId?: string; runId?: string }): ExecutionResult<ExecutionRun> {
    if (input.workflowId === undefined || input.workflowId.length === 0) {
      return {
        ok: false,
        issues: [{ code: "missing_workflow_id", message: "Cannot monitor a local KeeperHub run without a workflow ID." }]
      };
    }

    const runId = input.runId ?? deterministicRunId(input.workflowId);
    const failed = this.terminalStatus === "failed";
    const value: ExecutionRun = {
      claimLevel: this.claimLevel,
      workflowId: input.workflowId,
      runId,
      submittedAt: LOCAL_SUBMITTED_AT,
      completedAt: LOCAL_COMPLETED_AT,
      status: failed ? "failed" : "executed",
      transactionHash: failed || !this.includeTransactionEvidence ? undefined : LOCAL_TRANSACTION_HASH,
      error: failed ? "Local KeeperHub fixture run failed." : undefined
    };

    if (failed) {
      return {
        ok: false,
        value,
        issues: [{ code: "failed_run", message: "Local KeeperHub fixture run reached a failed terminal status." }]
      };
    }

    return {
      ok: true,
      value,
      issues: []
    };
  }

  toReceipt(input: { intent: AgentIntent; run?: ExecutionRun }) {
    return convertRunToExecutionReceipt(input);
  }
}

export function createLocalKeeperHubExecutionAdapter(
  options: LocalExecutionAdapterOptions = {}
): LocalKeeperHubExecutionAdapter {
  return new LocalKeeperHubExecutionAdapter(options);
}

function validateExecutionInput(input: VerifiedExecutionIntent): ExecutionIssue[] {
  const issues: ExecutionIssue[] = [];

  if (input.verification?.status !== "verified" || input.verification.intentHash !== input.intent.hashes.intentHash) {
    issues.push({
      code: "missing_verification",
      message: "Execution submission requires ClearIntent verification evidence bound to the intent hash.",
      path: "verification"
    });
  }
  if (input.signature === undefined || input.signature.signer.toLowerCase() !== input.intent.authority.signer.toLowerCase()) {
    issues.push({
      code: "missing_signature",
      message: "Execution submission requires signature evidence from the approved intent signer.",
      path: "signature"
    });
  }
  if (!isSupportedLocalExecutor(input.intent.authority.executor)) {
    issues.push({
      code: "unsupported_executor",
      message: "Local KeeperHub fixture only supports the configured fixture executor.",
      path: "intent.authority.executor"
    });
  }

  return issues;
}

export function buildVerifiedLocalExecutionInput(intent: AgentIntent): VerifiedExecutionIntent {
  return {
    intent,
    signature: {
      signer: intent.authority.signer,
      signature: "0xfixture-signature"
    },
    verification: {
      status: "verified",
      intentHash: intent.hashes.intentHash,
      policyHash: intent.policy.policyHash
    }
  };
}

export function deterministicLocalWorkflowId(intent: AgentIntent): string {
  return deterministicWorkflowId(intent);
}
