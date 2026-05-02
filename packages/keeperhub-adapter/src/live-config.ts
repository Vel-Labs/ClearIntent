export type KeeperHubExecutionMode = "workflow" | "direct";

export type KeeperHubLiveConfig = {
  baseUrl: string;
  apiToken?: string;
  apiTokenStatus: "present" | "missing" | "invalid";
  webhookTokenStatus: "present" | "missing" | "invalid";
  workflowId?: string;
  executionId?: string;
  projectId?: string;
  organizationId?: string;
  executorAddress?: string;
  executorAddressStatus: "present" | "missing" | "invalid";
  executionMode: KeeperHubExecutionMode;
  liveProbeEnabled: boolean;
  liveSubmitEnabled: boolean;
  clearIntentBinding: {
    ensName?: string;
    policyUri?: string;
    policyHash?: string;
    auditLatest?: string;
    agentCardUri?: string;
    complete: boolean;
  };
};

const DEFAULT_BASE_URL = "https://app.keeperhub.com/api";

export function readKeeperHubLiveConfig(env: NodeJS.ProcessEnv = process.env): KeeperHubLiveConfig {
  const apiToken = nonEmpty(env.KEEPERHUB_API_TOKEN);
  const webhookToken = nonEmpty(env.KEEPERHUB_WEBHOOK_TOKEN);
  const executorAddress = nonEmpty(env.KEEPERHUB_EXECUTOR_ADDRESS);
  const policyUri = nonEmpty(env.CLEARINTENT_POLICY_URI) ?? nonEmpty(env.CLEARINTENT_EXPECTED_POLICY_URI);
  const policyHash = nonEmpty(env.CLEARINTENT_POLICY_HASH) ?? nonEmpty(env.CLEARINTENT_EXPECTED_POLICY_HASH);
  const auditLatest = nonEmpty(env.CLEARINTENT_AUDIT_LATEST) ?? nonEmpty(env.CLEARINTENT_EXPECTED_AUDIT_URI);
  const agentCardUri = nonEmpty(env.CLEARINTENT_AGENT_CARD_URI);

  return {
    baseUrl: stripTrailingSlash(nonEmpty(env.KEEPERHUB_API_BASE_URL) ?? DEFAULT_BASE_URL),
    apiToken,
    apiTokenStatus: apiToken === undefined ? "missing" : apiToken.startsWith("kh_") ? "present" : "invalid",
    webhookTokenStatus: webhookToken === undefined ? "missing" : webhookToken.startsWith("wfb_") ? "present" : "invalid",
    workflowId: nonEmpty(env.KEEPERHUB_WORKFLOW_ID),
    executionId: nonEmpty(env.KEEPERHUB_EXECUTION_ID) ?? nonEmpty(env.KEEPERHUB_RUN_ID),
    projectId: nonEmpty(env.KEEPERHUB_PROJECT_ID),
    organizationId: nonEmpty(env.KEEPERHUB_ORG_ID),
    executorAddress,
    executorAddressStatus:
      executorAddress === undefined ? "missing" : /^0x[a-fA-F0-9]{40}$/.test(executorAddress) ? "present" : "invalid",
    executionMode: parseExecutionMode(env.KEEPERHUB_EXECUTION_MODE),
    liveProbeEnabled: parseBoolean(env.KEEPERHUB_ENABLE_LIVE_PROBE),
    liveSubmitEnabled: parseBoolean(env.KEEPERHUB_ENABLE_LIVE_SUBMIT),
    clearIntentBinding: {
      ensName: nonEmpty(env.CLEARINTENT_ENS_NAME) ?? nonEmpty(env.ENS_NAME),
      policyUri,
      policyHash,
      auditLatest,
      agentCardUri,
      complete: policyUri !== undefined && policyHash !== undefined && auditLatest !== undefined && agentCardUri !== undefined
    }
  };
}

function parseExecutionMode(value: string | undefined): KeeperHubExecutionMode {
  return value === "direct" ? "direct" : "workflow";
}

function parseBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === "true" || value === "1";
}

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}
