import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getOperatorSecretsFilePath } from "./env";

export type LocalOperatorSetupStatus = {
  ok: boolean;
  summary: string;
  cwd: string;
  secretsFile?: string;
  secretsFileCreated: boolean;
  workspaceDirectory: string;
  intentDirectory: string;
  auditDirectory: string;
  agentContextFile: string;
  agentEnsName?: string;
  commands: string[];
  nextActions: string[];
  warnings: string[];
  blockingReasons: string[];
};

export function ensureLocalOperatorSetup(options: { agent?: string } = {}, cwd = process.cwd()): LocalOperatorSetupStatus {
  const clearintentDirectory = path.join(cwd, ".clearintent");
  const intentDirectory = path.join(clearintentDirectory, "intents");
  const auditDirectory = path.join(clearintentDirectory, "audit");
  const agentContextFile = path.join(clearintentDirectory, "agent-context.json");
  const secretsFile = getOperatorSecretsFilePath(cwd);
  const agentEnsName = nonEmpty(options.agent) ?? nonEmpty(process.env.CLEARINTENT_ENS_NAME);
  const blockingReasons: string[] = [];
  const warnings: string[] = [];
  let secretsFileCreated = false;

  mkdirSync(intentDirectory, { recursive: true });
  mkdirSync(auditDirectory, { recursive: true });

  if (secretsFile === undefined) {
    blockingReasons.push("operator_secrets_path_unavailable");
  } else if (!existsSync(secretsFile)) {
    mkdirSync(path.dirname(secretsFile), { recursive: true });
    writeFileSync(secretsFile, loadSecretsTemplate(cwd), { encoding: "utf8", mode: 0o600 });
    secretsFileCreated = true;
  }

  if (!existsSync(agentContextFile)) {
    writeFileSync(
      agentContextFile,
      `${JSON.stringify(buildAgentContextSeed(agentEnsName), null, 2)}\n`,
      { encoding: "utf8", mode: 0o600 }
    );
  } else {
    warnings.push("agent_context_file_already_exists");
  }

  return {
    ok: blockingReasons.length === 0,
    summary:
      blockingReasons.length === 0
        ? "Local operator workspace is ready. Secrets stay outside the repo and intent drafts stay under .clearintent/."
        : "Local operator setup is blocked before any live provider action.",
    cwd,
    secretsFile,
    secretsFileCreated,
    workspaceDirectory: clearintentDirectory,
    intentDirectory,
    auditDirectory,
    agentContextFile,
    agentEnsName,
    commands: [
      "clearintent credentials status",
      "clearintent agent context",
      "clearintent memory live-status",
      "clearintent intent create --template safe-test-transfer",
      "clearintent intent evaluate"
    ],
    nextActions: [
      secretsFileCreated
        ? `Edit ${secretsFile ?? "the external secrets file"} locally and add operator-owned provider credentials.`
        : "Confirm the external secrets file has only operator-owned provider credentials.",
      "Run clearintent credentials status before any live write.",
      "Use clearintent agent context before asking an agent to propose or submit an onchain action."
    ],
    warnings,
    blockingReasons
  };
}

function buildAgentContextSeed(agentEnsName: string | undefined): Record<string, unknown> {
  return {
    schemaVersion: "clearintent.agent-context.v1",
    createdAt: new Date().toISOString(),
    agentEnsName: agentEnsName ?? null,
    custody: {
      parentWallet: nonEmpty(process.env.CLEARINTENT_PARENT_WALLET) ?? null,
      agentAccount: nonEmpty(process.env.CLEARINTENT_AGENT_ACCOUNT) ?? null,
      rule: "The agent must use ClearIntent intent evaluation before any onchain submission."
    },
    records: {
      policyUri: nonEmpty(process.env.CLEARINTENT_POLICY_URI) ?? nonEmpty(process.env.CLEARINTENT_EXPECTED_POLICY_URI) ?? null,
      policyHash: nonEmpty(process.env.CLEARINTENT_POLICY_HASH) ?? nonEmpty(process.env.CLEARINTENT_EXPECTED_POLICY_HASH) ?? null,
      auditLatest: nonEmpty(process.env.CLEARINTENT_AUDIT_LATEST) ?? nonEmpty(process.env.CLEARINTENT_EXPECTED_AUDIT_URI) ?? null
    },
    keeperhub: {
      workflowId: nonEmpty(process.env.KEEPERHUB_WORKFLOW_ID) ?? null
    },
    commands: [
      "clearintent agent context",
      "clearintent intent create --template safe-test-transfer",
      "clearintent intent evaluate",
      "clearintent intent submit",
      "clearintent intent execute"
    ]
  };
}

function loadSecretsTemplate(cwd: string): string {
  const templatePath = path.join(cwd, "operator-secrets", "clearintent.secrets.env.example");
  if (existsSync(templatePath)) {
    return readFileSync(templatePath, "utf8");
  }
  return [
    "# ClearIntent operator secrets.",
    "# Keep this file outside the repo and never paste values into chat.",
    "ZERO_G_WALLET_ADDRESS=",
    "ZERO_G_PRIVATE_KEY=",
    "ENS_SIGNER_PRIVATE_KEY=",
    "KEEPERHUB_API_TOKEN=",
    "PRIVATE_EVM_RPC_URL=",
    ""
  ].join("\n");
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}
