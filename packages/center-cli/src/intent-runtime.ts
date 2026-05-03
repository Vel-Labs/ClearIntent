import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getAgentContextStatus } from "./agent-context";

export type IntentRuntimeStatus = {
  ok: boolean;
  stage: "created" | "evaluated" | "submitted" | "executed";
  summary: string;
  intentPath: string;
  evaluationPath: string;
  submissionPath: string;
  template?: string;
  approved: boolean;
  shouldExecute: boolean;
  intentHash?: string;
  policyHash?: string;
  errors: string[];
  nextActions: string[];
  payload?: Record<string, unknown>;
};

const intentsDirectory = ".clearintent/intents";
const latestIntentFile = "latest.json";
const latestEvaluationFile = "latest.evaluation.json";
const latestSubmissionFile = "latest.submission.json";

export function createIntentDraft(options: { agent?: string; template?: string } = {}, cwd = process.cwd()): IntentRuntimeStatus {
  const paths = getIntentPaths(cwd);
  mkdirSync(path.dirname(paths.intentPath), { recursive: true });
  const context = getAgentContextStatus({ agent: options.agent }, cwd);
  const template = options.template ?? "safe-test-transfer";
  const payload = buildIntentPayload(context, template);
  writeFileSync(paths.intentPath, `${JSON.stringify(payload, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return {
    ok: true,
    stage: "created",
    summary: "Created a local ClearIntent draft. This is not authority approval or execution.",
    ...paths,
    template,
    approved: false,
    shouldExecute: false,
    intentHash: stringField(payload, "intentHash"),
    policyHash: stringField(payload, "policyHash"),
    errors: [],
    nextActions: ["Run clearintent intent evaluate before any KeeperHub submission."],
    payload
  };
}

export function evaluateIntentDraft(options: { agent?: string; intentPath?: string } = {}, cwd = process.cwd()): IntentRuntimeStatus {
  const paths = getIntentPaths(cwd, options.intentPath);
  const payload = readIntent(paths.intentPath);
  const context = getAgentContextStatus({ agent: options.agent }, cwd);
  const errors = evaluatePayload(payload, context);
  const approved = errors.length === 0;
  const evaluation = {
    schemaVersion: "clearintent.intent-evaluation.v1",
    evaluatedAt: new Date().toISOString(),
    approved,
    shouldExecute: approved,
    errors,
    intentHash: stringField(payload, "intentHash") ?? null,
    policyHash: stringField(payload, "policyHash") ?? null,
    contextClaimLevel: context.claimLevel
  };
  mkdirSync(path.dirname(paths.evaluationPath), { recursive: true });
  writeFileSync(paths.evaluationPath, `${JSON.stringify(evaluation, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return {
    ok: approved,
    stage: "evaluated",
    summary: approved
      ? "Intent passed the local ClearIntent gate. Submit through the configured executor; do not bypass the executor path."
      : "Intent is blocked by the local ClearIntent gate. The agent must stop or escalate to human review.",
    ...paths,
    approved,
    shouldExecute: approved,
    intentHash: stringField(payload, "intentHash"),
    policyHash: stringField(payload, "policyHash"),
    errors,
    nextActions: approved
      ? ["Run clearintent intent submit to route through KeeperHub or the configured executor."]
      : ["Fix the intent/context mismatch or escalate to the parent wallet for human review."],
    payload
  };
}

export function submitIntentDraft(options: { intentPath?: string } = {}, cwd = process.cwd()): IntentRuntimeStatus {
  const paths = getIntentPaths(cwd, options.intentPath);
  const payload = readIntent(paths.intentPath);
  const evaluation = readRecord(paths.evaluationPath);
  const approved = evaluation?.approved === true && evaluation.shouldExecute === true;
  const errors = approved ? [] : ["missing_approved_clearintent_evaluation"];
  const submission = {
    schemaVersion: "clearintent.intent-submission.v1",
    submittedAt: new Date().toISOString(),
    status: approved ? "ready_for_executor" : "blocked",
    executor: process.env.KEEPERHUB_WORKFLOW_ID ?? null,
    intentHash: stringField(payload, "intentHash") ?? null,
    errors
  };
  mkdirSync(path.dirname(paths.submissionPath), { recursive: true });
  writeFileSync(paths.submissionPath, `${JSON.stringify(submission, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return {
    ok: approved,
    stage: "submitted",
    summary: approved
      ? "Intent is ready for the configured executor. This CLI scaffold has not submitted an onchain transaction."
      : "Intent submission is blocked because ClearIntent approval evidence is missing.",
    ...paths,
    approved,
    shouldExecute: approved,
    intentHash: stringField(payload, "intentHash"),
    policyHash: stringField(payload, "policyHash"),
    errors,
    nextActions: approved
      ? ["Use keeperhub live-submit only when the executor adapter is intentionally enabled and evidence will be recorded."]
      : ["Run clearintent intent evaluate and resolve all blockers before submit."],
    payload
  };
}

export function executeIntentDraft(options: { intentPath?: string } = {}, cwd = process.cwd()): IntentRuntimeStatus {
  const paths = getIntentPaths(cwd, options.intentPath);
  const payload = readIntent(paths.intentPath);
  const submission = readRecord(paths.submissionPath);
  const errors = submission?.status === "ready_for_executor" ? ["executor_adapter_not_enabled_for_direct_cli_execution"] : ["missing_executor_submission"];
  return {
    ok: false,
    stage: "executed",
    summary:
      "Direct execution is fail-closed. Use the configured executor path with recorded ClearIntent evaluation, KeeperHub receipt, and audit evidence.",
    ...paths,
    approved: false,
    shouldExecute: false,
    intentHash: stringField(payload, "intentHash"),
    policyHash: stringField(payload, "policyHash"),
    errors,
    nextActions: ["Route through KeeperHub or another explicit adapter; do not let an agent bypass ClearIntent."],
    payload
  };
}

function getIntentPaths(cwd: string, intentPath?: string): Pick<IntentRuntimeStatus, "intentPath" | "evaluationPath" | "submissionPath"> {
  const resolvedIntentPath = path.resolve(cwd, intentPath ?? path.join(intentsDirectory, latestIntentFile));
  const directory = path.dirname(resolvedIntentPath);
  return {
    intentPath: resolvedIntentPath,
    evaluationPath: path.join(directory, latestEvaluationFile),
    submissionPath: path.join(directory, latestSubmissionFile)
  };
}

function buildIntentPayload(context: ReturnType<typeof getAgentContextStatus>, template: string): Record<string, unknown> {
  const policyHash = context.policyHash ?? "missing-policy-hash";
  return {
    schemaVersion: "clearintent.intent.v1",
    template,
    createdAt: new Date().toISOString(),
    agentEnsName: context.agentEnsName ?? null,
    parentWallet: context.parentWallet ?? null,
    agentAccount: context.agentAccount ?? null,
    policyUri: context.policyUri ?? null,
    policyHash,
    auditLatest: context.auditLatest ?? null,
    keeperHubWorkflowId: context.keeperHubWorkflowId ?? null,
    intentHash: `local-${Date.now().toString(36)}`,
    action: {
      actionType: template,
      target: "demo-safe-target",
      chainId: process.env.KEEPERHUB_CHAIN_ID ?? process.env.SOFTWARE_WALLET_CHAIN_ID ?? "11155111",
      valueLimit: "0"
    },
    humanReadable: {
      summary: "Demo safe-test intent. Replace with the real proposed transaction before execution.",
      rule: "Agent must stop if ClearIntent evaluation fails."
    }
  };
}

function evaluatePayload(payload: Record<string, unknown>, context: ReturnType<typeof getAgentContextStatus>): string[] {
  const errors: string[] = [];
  const requiredFields = ["agentEnsName", "agentAccount", "policyUri", "policyHash", "intentHash"];
  for (const field of requiredFields) {
    if (stringField(payload, field) === undefined) {
      errors.push(`missing_${field}`);
    }
  }
  if (context.missing.length > 0) {
    errors.push(...context.missing.map((field) => `context_missing_${field}`));
  }
  const expectedPolicyHash = context.policyHash;
  const intentPolicyHash = stringField(payload, "policyHash");
  if (expectedPolicyHash !== undefined && intentPolicyHash !== expectedPolicyHash) {
    errors.push("policy_hash_mismatch");
  }
  return [...new Set(errors)];
}

function readIntent(intentPath: string): Record<string, unknown> {
  if (!existsSync(intentPath)) {
    return {};
  }
  return readRecord(intentPath) ?? {};
}

function readRecord(filePath: string): Record<string, unknown> | undefined {
  if (!existsSync(filePath)) {
    return undefined;
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function stringField(value: Record<string, unknown>, field: string): string | undefined {
  const fieldValue = value[field];
  return typeof fieldValue === "string" && fieldValue.trim().length > 0 ? fieldValue.trim() : undefined;
}
