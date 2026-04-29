import type { AgentIntent } from "../../core/src";
import { KEEPERHUB_LOCAL_FIXTURE_CLAIM, type KeeperHubWorkflowRequest, type VerifiedExecutionIntent } from "./types";

const SUPPORTED_LOCAL_EXECUTOR = "0x2222222222222222222222222222222222222222";

export const localKeeperHubWorkflowFixture = {
  workflowPrefix: "keeperhub-local-workflow",
  supportedExecutor: SUPPORTED_LOCAL_EXECUTOR,
  claimLevel: KEEPERHUB_LOCAL_FIXTURE_CLAIM
} as const;

export function isSupportedLocalExecutor(executor: string): boolean {
  return executor.toLowerCase() === SUPPORTED_LOCAL_EXECUTOR.toLowerCase();
}

export function mapVerifiedIntentToWorkflow(input: VerifiedExecutionIntent): KeeperHubWorkflowRequest {
  const { intent } = input;
  return {
    claimLevel: KEEPERHUB_LOCAL_FIXTURE_CLAIM,
    workflowId: deterministicWorkflowId(intent),
    intentHash: intent.hashes.intentHash,
    executor: intent.authority.executor,
    action: {
      actionType: intent.action.actionType,
      target: intent.action.target,
      chainId: intent.action.chainId,
      valueLimit: intent.action.valueLimit,
      calldataHash: intent.action.calldataHash
    }
  };
}

export function deterministicWorkflowId(intent: AgentIntent): string {
  return `${localKeeperHubWorkflowFixture.workflowPrefix}-${intent.intentId}`;
}

export function deterministicRunId(workflowId: string): string {
  return `${workflowId}-run-001`;
}
