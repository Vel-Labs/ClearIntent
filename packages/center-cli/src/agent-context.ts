import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type AgentContextStatus = {
  ok: boolean;
  summary: string;
  claimLevel: "local-context";
  agentEnsName?: string;
  parentWallet?: string;
  agentAccount?: string;
  policyUri?: string;
  policyHash?: string;
  auditLatest?: string;
  keeperHubWorkflowId?: string;
  contextFile: string;
  contextFilePresent: boolean;
  missing: string[];
  commands: string[];
  blockingReasons: string[];
};

export function getAgentContextStatus(options: { agent?: string } = {}, cwd = process.cwd()): AgentContextStatus {
  const contextFile = path.join(cwd, ".clearintent", "agent-context.json");
  const fileContext = readContextFile(contextFile);
  const agentEnsName = firstNonEmpty(options.agent, fileString(fileContext, "agentEnsName"), process.env.CLEARINTENT_ENS_NAME);
  const parentWallet = firstNonEmpty(
    nestedString(fileContext, ["custody", "parentWallet"]),
    process.env.CLEARINTENT_PARENT_WALLET,
    process.env.SOFTWARE_WALLET_SIGNER_ADDRESS
  );
  const agentAccount = firstNonEmpty(nestedString(fileContext, ["custody", "agentAccount"]), process.env.CLEARINTENT_AGENT_ACCOUNT);
  const policyUri = firstNonEmpty(
    nestedString(fileContext, ["records", "policyUri"]),
    process.env.CLEARINTENT_POLICY_URI,
    process.env.CLEARINTENT_EXPECTED_POLICY_URI
  );
  const policyHash = firstNonEmpty(
    nestedString(fileContext, ["records", "policyHash"]),
    process.env.CLEARINTENT_POLICY_HASH,
    process.env.CLEARINTENT_EXPECTED_POLICY_HASH
  );
  const auditLatest = firstNonEmpty(
    nestedString(fileContext, ["records", "auditLatest"]),
    process.env.CLEARINTENT_AUDIT_LATEST,
    process.env.CLEARINTENT_EXPECTED_AUDIT_URI
  );
  const keeperHubWorkflowId = firstNonEmpty(nestedString(fileContext, ["keeperhub", "workflowId"]), process.env.KEEPERHUB_WORKFLOW_ID);
  const missing = [
    { key: "agent_ens_name", value: agentEnsName },
    { key: "parent_wallet", value: parentWallet },
    { key: "agent_account", value: agentAccount },
    { key: "policy_uri", value: policyUri },
    { key: "policy_hash", value: policyHash },
    { key: "audit_latest", value: auditLatest },
    { key: "keeperhub_workflow_id", value: keeperHubWorkflowId }
  ]
    .filter((item) => item.value === undefined)
    .map((item) => item.key);

  return {
    ok: missing.length === 0,
    summary:
      missing.length === 0
        ? "Agent context is ready for local ClearIntent-gated operation. This is context, not execution approval."
        : "Agent context is incomplete. Agents must not submit onchain actions until context and policy references are present.",
    claimLevel: "local-context",
    agentEnsName,
    parentWallet,
    agentAccount,
    policyUri,
    policyHash,
    auditLatest,
    keeperHubWorkflowId,
    contextFile,
    contextFilePresent: existsSync(contextFile),
    missing,
    commands: [
      "clearintent intent create --template safe-test-transfer",
      "clearintent intent evaluate",
      "clearintent keeperhub live-status",
      "clearintent intent submit",
      "clearintent intent execute"
    ],
    blockingReasons: missing
  };
}

function readContextFile(filePath: string): Record<string, unknown> | undefined {
  if (!existsSync(filePath)) {
    return undefined;
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function nestedString(value: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  let current: unknown = value;
  for (const key of keys) {
    if (typeof current !== "object" || current === null || !(key in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" && current.trim().length > 0 ? current.trim() : undefined;
}

function fileString(value: Record<string, unknown> | undefined, key: string): string | undefined {
  const field = value?.[key];
  return typeof field === "string" && field.trim().length > 0 ? field.trim() : undefined;
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed !== undefined && trimmed.length > 0) {
      return trimmed;
    }
  }
  return undefined;
}
