import type { AgentIntent, ExecutionReceipt } from "../../core/src";
import type { ExecutionIssue, ExecutionResult, ExecutionRun } from "./types";

const LOCAL_SUBMITTED_AT = "2026-05-03T18:05:00Z";
const LOCAL_COMPLETED_AT = "2026-05-03T18:06:00Z";

export function convertRunToExecutionReceipt(input: {
  intent: AgentIntent;
  run?: ExecutionRun;
}): ExecutionResult<ExecutionReceipt> {
  const { intent, run } = input;
  if (run === undefined) {
    return blocked("missing_receipt", "Cannot create an execution receipt without run evidence.");
  }
  if (run.workflowId.length === 0) {
    return blocked("missing_workflow_id", "Cannot create an execution receipt without a workflow ID.");
  }

  const base = {
    schemaVersion: "clearintent.execution-receipt.v1" as const,
    receiptId: `keeperhub-local-receipt-${run.runId}`,
    intentHash: intent.hashes.intentHash,
    executor: {
      adapter: "keeperhub",
      address: intent.authority.executor,
      workflowId: run.workflowId,
      runId: run.runId
    },
    submittedAt: run.submittedAt || LOCAL_SUBMITTED_AT
  };

  if (run.status === "failed") {
    return {
      ok: true,
      value: {
        ...base,
        status: "failed",
        completedAt: run.completedAt || LOCAL_COMPLETED_AT,
        error: run.error || "Local KeeperHub fixture run failed."
      },
      issues: []
    };
  }

  if (run.transactionHash === undefined) {
    return {
      ok: false,
      value: {
        ...base,
        status: "degraded",
        completedAt: run.completedAt,
        degradedReason: "missing_transaction_evidence"
      },
      issues: [
        {
          code: "missing_transaction_evidence",
          message: "Local fixture receipt has no transaction evidence and cannot support a live/onchain execution claim.",
          path: "transactionHash"
        }
      ]
    };
  }

  return {
    ok: true,
    value: {
      ...base,
      status: "executed",
      completedAt: run.completedAt || LOCAL_COMPLETED_AT,
      transactionHash: run.transactionHash
    },
    issues: []
  };
}

function blocked(code: ExecutionIssue["code"], message: string): ExecutionResult<ExecutionReceipt> {
  return {
    ok: false,
    issues: [{ code, message }]
  };
}
