import { createHmac, timingSafeEqual } from "node:crypto";

export const KEEPERHUB_EVENT_SCHEMA_VERSION = "clearintent.keeperhub.reported-event.v1" as const;
export const CLEARINTENT_KEEPERHUB_EVENT_SCHEMA_VERSION = "clearintent.keeperhub-event.v1" as const;
export const KEEPERHUB_EVENT_AUTHORITY = "reported_non_authoritative" as const;

export type KeeperHubReportedEventStatus =
  | "pending"
  | "running"
  | "submitted"
  | "executed"
  | "failed"
  | "degraded";

export type KeeperHubReportedEvent = {
  schemaVersion: typeof KEEPERHUB_EVENT_SCHEMA_VERSION;
  eventId: string;
  eventType: string;
  workflowId: string;
  runId?: string;
  executionId?: string;
  status: KeeperHubReportedEventStatus;
  occurredAt: string;
  transactionHash?: string;
  intentHash?: string;
  policyHash?: string;
  source?: {
    provider?: "keeperhub";
    projectId?: string;
    organizationId?: string;
    webhookId?: string;
  };
  payload?: Record<string, unknown>;
};

export type ClearIntentKeeperHubEvent = {
  schemaVersion: typeof CLEARINTENT_KEEPERHUB_EVENT_SCHEMA_VERSION;
  source: "keeperhub";
  project: "clearintent";
  eventType: string;
  status: string;
  error?: string;
  severity?: string;
  shouldExecute?: boolean;
  parentWallet?: string;
  agentAccount?: string;
  agentEnsName?: string;
  intentHash?: string;
  verificationIntentHash?: string;
  policyHash?: string;
  verificationPolicyHash?: string;
  auditLatest?: string;
  actionType?: string;
  target?: string;
  chainId?: string;
  valueLimit?: string;
  executor?: string;
  signer?: string;
  transactionHash?: string;
};

export type KeeperHubEventIssueCode =
  | "invalid_payload"
  | "unsupported_schema_version"
  | "unsupported_source"
  | "unresolved_template_value"
  | "missing_agent_binding"
  | "missing_event_id"
  | "missing_event_type"
  | "missing_workflow_id"
  | "missing_run_or_execution_id"
  | "missing_webhook_token"
  | "invalid_webhook_token"
  | "invalid_status"
  | "invalid_occurred_at"
  | "invalid_transaction_hash"
  | "invalid_intent_hash"
  | "invalid_policy_hash";

export type KeeperHubEventIssue = {
  code: KeeperHubEventIssueCode;
  message: string;
  path?: string;
};

export type KeeperHubEventBoundaryCheck = {
  id: "token" | "signature" | "timestamp_replay" | "source_binding";
  status: "pass" | "fail" | "not_configured" | "not_implemented" | "not_checked";
  supplied: boolean;
  authoritative: false;
  detail: string;
};

export type KeeperHubEventIngestReceipt = {
  ok: true;
  accepted: true;
  provider: "keeperhub";
  boundary: typeof KEEPERHUB_EVENT_AUTHORITY;
  authoritative: false;
  event: KeeperHubReportedEvent;
  clearintent?: ClearIntentKeeperHubEvent;
  isolationKey?: string;
  delivery: {
    fanout: "disabled";
    userWebhookForwarding: false;
    detail: string;
  };
  checks: KeeperHubEventBoundaryCheck[];
  warnings: string[];
};

export type KeeperHubEventIngestFailure = {
  ok: false;
  accepted: false;
  provider: "keeperhub";
  boundary: typeof KEEPERHUB_EVENT_AUTHORITY;
  authoritative: false;
  issues: KeeperHubEventIssue[];
  checks: KeeperHubEventBoundaryCheck[];
};

export type KeeperHubEventIngestResult = KeeperHubEventIngestReceipt | KeeperHubEventIngestFailure;

export type KeeperHubEventRequestContext = {
  headers?: Headers | Record<string, string | undefined>;
  webhookSecret?: string;
};

const VALID_STATUSES = new Set<KeeperHubReportedEventStatus>([
  "pending",
  "running",
  "submitted",
  "executed",
  "failed",
  "degraded"
]);

export function ingestKeeperHubReportedEvent(
  payload: unknown,
  context: KeeperHubEventRequestContext = {}
): KeeperHubEventIngestResult {
  const checks = buildBoundaryChecks(context.headers);
  const clearIntentEvent = validateClearIntentKeeperHubEvent(payload);
  if (clearIntentEvent.ok) {
    const occurredAt = new Date().toISOString();
    const eventId = buildClearIntentEventId(clearIntentEvent.event, occurredAt);
    const event: KeeperHubReportedEvent = {
      schemaVersion: KEEPERHUB_EVENT_SCHEMA_VERSION,
      eventId,
      eventType: clearIntentEvent.event.eventType,
      workflowId: optionalNonEmptyString(readHeader(context.headers, "x-keeperhub-workflow-id")) ?? "keeperhub-workflow-unbound",
      runId: optionalNonEmptyString(readHeader(context.headers, "x-keeperhub-run-id")),
      executionId: optionalNonEmptyString(readHeader(context.headers, "x-keeperhub-execution-id")),
      status: normalizeReportedStatus(clearIntentEvent.event.status),
      occurredAt,
      transactionHash: clearIntentEvent.event.transactionHash,
      intentHash: clearIntentEvent.event.intentHash,
      policyHash: clearIntentEvent.event.policyHash,
      source: { provider: "keeperhub" },
      payload: { ...clearIntentEvent.event }
    };
    const isolationKey = buildIsolationKey(clearIntentEvent.event);
    const tokenValidation = validateAgentWebhookToken(clearIntentEvent.event, context);
    const eventChecks = updateTokenCheck(checks, tokenValidation);
    if (!tokenValidation.ok) {
      return {
        ok: false,
        accepted: false,
        provider: "keeperhub",
        boundary: KEEPERHUB_EVENT_AUTHORITY,
        authoritative: false,
        issues: [tokenValidation.issue],
        checks: eventChecks
      };
    }

    return {
      ok: true,
      accepted: true,
      provider: "keeperhub",
      boundary: KEEPERHUB_EVENT_AUTHORITY,
      authoritative: false,
      event,
      clearintent: clearIntentEvent.event,
      isolationKey,
      delivery: disabledDelivery(),
      checks: eventChecks,
      warnings: [
        "ClearIntent KeeperHub event shape was accepted for display and local routing only.",
        tokenValidation.configured
          ? "Agent-scoped webhook token matched the event binding. This authenticates delivery only; it is not authority approval."
          : "Agent-scoped webhook token validation is not configured. Set CLEARINTENT_KEEPERHUB_WEBHOOK_SECRET before enabling user fanout.",
        "User webhook fanout is disabled until agent-scoped webhook registration and replay checks exist."
      ]
    };
  }

  if (clearIntentEvent.schemaMatched) {
    return {
      ok: false,
      accepted: false,
      provider: "keeperhub",
      boundary: KEEPERHUB_EVENT_AUTHORITY,
      authoritative: false,
      issues: clearIntentEvent.issues,
      checks
    };
  }

  const validation = validateKeeperHubReportedEvent(payload);

  if (!validation.ok) {
    return {
      ok: false,
      accepted: false,
      provider: "keeperhub",
      boundary: KEEPERHUB_EVENT_AUTHORITY,
      authoritative: false,
      issues: validation.issues,
      checks
    };
  }

  return {
    ok: true,
    accepted: true,
    provider: "keeperhub",
    boundary: KEEPERHUB_EVENT_AUTHORITY,
    authoritative: false,
    event: validation.event,
    delivery: disabledDelivery(),
    checks,
    warnings: [
      "KeeperHub event shape was accepted for display only.",
      "Token, signature, timestamp/replay, and source-binding checks are planned but not implemented."
    ]
  };
}

export function buildKeeperHubWebhookToken(input: {
  secret: string;
  parentWallet?: string;
  agentAccount?: string;
  agentEnsName?: string;
}): string {
  return createHmac("sha256", input.secret).update(buildWebhookTokenMaterial(input)).digest("hex");
}

export function validateClearIntentKeeperHubEvent(payload: unknown):
  | { ok: true; schemaMatched: true; event: ClearIntentKeeperHubEvent }
  | { ok: false; schemaMatched: boolean; issues: KeeperHubEventIssue[] } {
  if (!isRecord(payload)) {
    return { ok: false, schemaMatched: false, issues: [{ code: "invalid_payload", message: "KeeperHub event payload must be a JSON object." }] };
  }
  if (payload.schemaVersion !== CLEARINTENT_KEEPERHUB_EVENT_SCHEMA_VERSION) {
    return { ok: false, schemaMatched: false, issues: [] };
  }

  const issues: KeeperHubEventIssue[] = [];
  if (payload.source !== "keeperhub") {
    issues.push({ code: "unsupported_source", message: "ClearIntent KeeperHub event source must be keeperhub.", path: "source" });
  }
  if (payload.project !== "clearintent") {
    issues.push({ code: "unsupported_source", message: "ClearIntent KeeperHub event project must be clearintent.", path: "project" });
  }

  requireTemplateSafeString(payload, "eventType", "missing_event_type", "ClearIntent KeeperHub event requires eventType.", issues);
  requireTemplateSafeString(payload, "status", "invalid_status", "ClearIntent KeeperHub event requires status.", issues);

  const agentEnsName = optionalBindingString(payload.agentEnsName, "agentEnsName", issues);
  const agentAccount = optionalBindingString(payload.agentAccount, "agentAccount", issues);
  const parentWallet = optionalBindingString(payload.parentWallet, "parentWallet", issues);
  if (agentEnsName === undefined && agentAccount === undefined && parentWallet === undefined) {
    issues.push({
      code: "missing_agent_binding",
      message: "ClearIntent KeeperHub event requires agentEnsName, agentAccount, or parentWallet for user isolation.",
      path: "agentEnsName"
    });
  }

  const intentHash = optionalTemplateSafeString(payload.intentHash, "intentHash", issues);
  const verificationIntentHash = optionalTemplateSafeString(payload.verificationIntentHash, "verificationIntentHash", issues);
  const policyHash = optionalTemplateSafeString(payload.policyHash, "policyHash", issues);
  const verificationPolicyHash = optionalTemplateSafeString(payload.verificationPolicyHash, "verificationPolicyHash", issues);
  const transactionHash = optionalTemplateSafeString(payload.transactionHash, "transactionHash", issues);
  requireHashText(intentHash, "intentHash", "invalid_intent_hash", issues);
  requireHashText(verificationIntentHash, "verificationIntentHash", "invalid_intent_hash", issues);
  requireHashText(policyHash, "policyHash", "invalid_policy_hash", issues);
  requireHashText(verificationPolicyHash, "verificationPolicyHash", "invalid_policy_hash", issues);
  requireHashText(transactionHash, "transactionHash", "invalid_transaction_hash", issues);

  if (issues.length > 0) {
    return { ok: false, schemaMatched: true, issues };
  }

  return {
    ok: true,
    schemaMatched: true,
    event: {
      schemaVersion: CLEARINTENT_KEEPERHUB_EVENT_SCHEMA_VERSION,
      source: "keeperhub",
      project: "clearintent",
      eventType: payload.eventType as string,
      status: payload.status as string,
      error: optionalTemplateSafeString(payload.error, "error", issues),
      severity: optionalTemplateSafeString(payload.severity, "severity", issues),
      shouldExecute: parseBooleanLike(payload.shouldExecute),
      parentWallet,
      agentAccount,
      agentEnsName,
      intentHash,
      verificationIntentHash,
      policyHash,
      verificationPolicyHash,
      auditLatest: optionalTemplateSafeString(payload.auditLatest, "auditLatest", issues),
      actionType: optionalTemplateSafeString(payload.actionType, "actionType", issues),
      target: optionalTemplateSafeString(payload.target, "target", issues),
      chainId: optionalTemplateSafeString(payload.chainId, "chainId", issues),
      valueLimit: optionalTemplateSafeString(payload.valueLimit, "valueLimit", issues),
      executor: optionalTemplateSafeString(payload.executor, "executor", issues),
      signer: optionalTemplateSafeString(payload.signer, "signer", issues),
      transactionHash
    }
  };
}

export function validateKeeperHubReportedEvent(payload: unknown):
  | { ok: true; event: KeeperHubReportedEvent }
  | { ok: false; issues: KeeperHubEventIssue[] } {
  if (!isRecord(payload)) {
    return {
      ok: false,
      issues: [{ code: "invalid_payload", message: "KeeperHub event payload must be a JSON object." }]
    };
  }

  const issues: KeeperHubEventIssue[] = [];

  requireExactString(payload, "schemaVersion", KEEPERHUB_EVENT_SCHEMA_VERSION, issues);
  requireNonEmptyString(payload, "eventId", "missing_event_id", "KeeperHub event requires eventId.", issues);
  requireNonEmptyString(payload, "eventType", "missing_event_type", "KeeperHub event requires eventType.", issues);
  requireNonEmptyString(payload, "workflowId", "missing_workflow_id", "KeeperHub event requires workflowId.", issues);

  const runId = optionalNonEmptyString(payload.runId);
  const executionId = optionalNonEmptyString(payload.executionId);
  if (runId === undefined && executionId === undefined) {
    issues.push({
      code: "missing_run_or_execution_id",
      message: "KeeperHub event requires runId or executionId.",
      path: "runId"
    });
  }

  const status = optionalNonEmptyString(payload.status);
  if (status === undefined || !VALID_STATUSES.has(status as KeeperHubReportedEventStatus)) {
    issues.push({
      code: "invalid_status",
      message: "KeeperHub event status must be one of pending, running, submitted, executed, failed, or degraded.",
      path: "status"
    });
  }

  const occurredAt = optionalNonEmptyString(payload.occurredAt);
  if (occurredAt === undefined || Number.isNaN(Date.parse(occurredAt))) {
    issues.push({
      code: "invalid_occurred_at",
      message: "KeeperHub event requires occurredAt as an ISO-compatible timestamp.",
      path: "occurredAt"
    });
  }

  requireHashLike(payload.transactionHash, "transactionHash", "invalid_transaction_hash", issues);
  requireHashLike(payload.intentHash, "intentHash", "invalid_intent_hash", issues);
  requireHashLike(payload.policyHash, "policyHash", "invalid_policy_hash", issues);

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    event: {
      schemaVersion: KEEPERHUB_EVENT_SCHEMA_VERSION,
      eventId: payload.eventId as string,
      eventType: payload.eventType as string,
      workflowId: payload.workflowId as string,
      runId,
      executionId,
      status: status as KeeperHubReportedEventStatus,
      occurredAt: occurredAt as string,
      transactionHash: optionalNonEmptyString(payload.transactionHash),
      intentHash: optionalNonEmptyString(payload.intentHash),
      policyHash: optionalNonEmptyString(payload.policyHash),
      source: parseSource(payload.source),
      payload: isRecord(payload.payload) ? payload.payload : undefined
    }
  };
}

function buildBoundaryChecks(headers: KeeperHubEventRequestContext["headers"]): KeeperHubEventBoundaryCheck[] {
  return [
    {
      id: "token",
      status: "not_configured",
      supplied: hasHeader(headers, "authorization") || hasHeader(headers, "x-keeperhub-token") || hasHeader(headers, "x-clearintent-webhook-token"),
      authoritative: false,
      detail: "Agent-scoped webhook token validation is not configured for this request."
    },
    {
      id: "signature",
      status: "not_implemented",
      supplied: hasHeader(headers, "x-keeperhub-signature"),
      authoritative: false,
      detail: "Signature presence can be observed, but signature verification is not implemented in this stub."
    },
    {
      id: "timestamp_replay",
      status: "not_implemented",
      supplied: hasHeader(headers, "x-keeperhub-timestamp") || hasHeader(headers, "x-keeperhub-nonce"),
      authoritative: false,
      detail: "Timestamp or nonce presence can be observed, but replay protection is not implemented in this stub."
    },
    {
      id: "source_binding",
      status: "not_checked",
      supplied: hasHeader(headers, "x-keeperhub-workflow-id") || hasHeader(headers, "x-keeperhub-project-id"),
      authoritative: false,
      detail: "Source binding to the configured workflow/project is planned but not checked in this stub."
    }
  ];
}

function validateAgentWebhookToken(
  event: ClearIntentKeeperHubEvent,
  context: KeeperHubEventRequestContext
): { ok: true; configured: boolean } | { ok: false; configured: true; issue: KeeperHubEventIssue } {
  const secret = optionalNonEmptyString(context.webhookSecret);
  if (secret === undefined) {
    return { ok: true, configured: false };
  }

  const suppliedToken = readBearerToken(context.headers) ?? readHeader(context.headers, "x-clearintent-webhook-token");
  if (suppliedToken === undefined) {
    return {
      ok: false,
      configured: true,
      issue: {
        code: "missing_webhook_token",
        message: "ClearIntent KeeperHub event requires x-clearintent-webhook-token or bearer token when webhook verification is configured.",
        path: "headers.x-clearintent-webhook-token"
      }
    };
  }

  const expected = buildKeeperHubWebhookToken({
    secret,
    parentWallet: event.parentWallet,
    agentAccount: event.agentAccount,
    agentEnsName: event.agentEnsName
  });

  if (!constantTimeEqual(suppliedToken, expected)) {
    return {
      ok: false,
      configured: true,
      issue: {
        code: "invalid_webhook_token",
        message: "ClearIntent KeeperHub event token does not match the parent/agent binding.",
        path: "headers.x-clearintent-webhook-token"
      }
    };
  }

  return { ok: true, configured: true };
}

function updateTokenCheck(
  checks: KeeperHubEventBoundaryCheck[],
  validation: ReturnType<typeof validateAgentWebhookToken>
): KeeperHubEventBoundaryCheck[] {
  return checks.map((check) => {
    if (check.id !== "token") return check;
    if (!validation.configured) return check;
    return {
      ...check,
      status: validation.ok ? "pass" : "fail",
      detail: validation.ok
        ? "Agent-scoped webhook token matched the parent/agent binding."
        : validation.issue.message
    };
  });
}

function buildWebhookTokenMaterial(input: {
  parentWallet?: string;
  agentAccount?: string;
  agentEnsName?: string;
}): string {
  return [
    "clearintent-keeperhub-webhook-v1",
    input.parentWallet?.toLowerCase() ?? "parent-unbound",
    input.agentAccount?.toLowerCase() ?? "agent-account-unbound",
    input.agentEnsName?.toLowerCase() ?? "agent-ens-unbound"
  ].join(":");
}

function readBearerToken(headers: KeeperHubEventRequestContext["headers"]): string | undefined {
  const authorization = readHeader(headers, "authorization");
  if (authorization === undefined) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  return optionalNonEmptyString(match?.[1]);
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  if (leftBuffer.byteLength !== rightBuffer.byteLength) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function requireExactString(
  payload: Record<string, unknown>,
  key: string,
  expected: string,
  issues: KeeperHubEventIssue[]
): void {
  if (payload[key] !== expected) {
    issues.push({
      code: "unsupported_schema_version",
      message: `KeeperHub event schemaVersion must be ${expected}.`,
      path: key
    });
  }
}

function requireNonEmptyString(
  payload: Record<string, unknown>,
  key: string,
  code: KeeperHubEventIssueCode,
  message: string,
  issues: KeeperHubEventIssue[]
): void {
  if (optionalNonEmptyString(payload[key]) === undefined) {
    issues.push({ code, message, path: key });
  }
}

function requireHashLike(
  value: unknown,
  path: "transactionHash" | "intentHash" | "policyHash",
  code: KeeperHubEventIssueCode,
  issues: KeeperHubEventIssue[]
): void {
  const text = optionalNonEmptyString(value);
  requireHashText(text, path, code, issues);
}

function requireHashText(
  text: string | undefined,
  path: string,
  code: KeeperHubEventIssueCode,
  issues: KeeperHubEventIssue[]
): void {
  if (text !== undefined && text !== "none" && text !== "null" && !/^0x[a-fA-F0-9]{64}$/.test(text)) {
    issues.push({ code, message: `${path} must be a 32-byte hex string when provided.`, path });
  }
}

function parseSource(value: unknown): KeeperHubReportedEvent["source"] {
  if (!isRecord(value)) return undefined;
  const provider = value.provider === "keeperhub" ? "keeperhub" : undefined;
  const projectId = optionalNonEmptyString(value.projectId);
  const organizationId = optionalNonEmptyString(value.organizationId);
  const webhookId = optionalNonEmptyString(value.webhookId);

  if (provider === undefined && projectId === undefined && organizationId === undefined && webhookId === undefined) {
    return undefined;
  }

  return { provider, projectId, organizationId, webhookId };
}

function hasHeader(headers: KeeperHubEventRequestContext["headers"], key: string): boolean {
  return readHeader(headers, key) !== undefined;
}

function readHeader(headers: KeeperHubEventRequestContext["headers"], key: string): string | undefined {
  if (headers === undefined) return undefined;
  if (headers instanceof Headers) {
    return optionalNonEmptyString(headers.get(key));
  }
  const match = Object.entries(headers).find(([header]) => header.toLowerCase() === key.toLowerCase());
  return optionalNonEmptyString(match?.[1]);
}

function requireTemplateSafeString(
  payload: Record<string, unknown>,
  key: string,
  code: KeeperHubEventIssueCode,
  message: string,
  issues: KeeperHubEventIssue[]
): void {
  const value = optionalTemplateSafeString(payload[key], key, issues);
  if (value === undefined) {
    issues.push({ code, message, path: key });
  }
}

function optionalTemplateSafeString(value: unknown, path: string, issues: KeeperHubEventIssue[]): string | undefined {
  const text = optionalNonEmptyString(value);
  if (text === undefined || text === "null" || text === "undefined") return undefined;
  if (/\{\{.*\}\}/.test(text)) {
    issues.push({
      code: "unresolved_template_value",
      message: `${path} still contains an unresolved KeeperHub template value.`,
      path
    });
    return undefined;
  }
  return text;
}

function optionalBindingString(value: unknown, path: string, issues: KeeperHubEventIssue[]): string | undefined {
  const text = optionalTemplateSafeString(value, path, issues);
  if (text === undefined || text === "none") return undefined;
  return text;
}

function parseBooleanLike(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  const text = optionalNonEmptyString(value);
  if (text === "true") return true;
  if (text === "false") return false;
  return undefined;
}

function normalizeReportedStatus(status: string): KeeperHubReportedEventStatus {
  if (VALID_STATUSES.has(status as KeeperHubReportedEventStatus)) {
    return status as KeeperHubReportedEventStatus;
  }
  if (status === "completed" || status === "success") return "executed";
  if (status === "blocked") return "failed";
  return "degraded";
}

function buildIsolationKey(event: ClearIntentKeeperHubEvent): string {
  return event.agentAccount ?? event.agentEnsName ?? event.parentWallet ?? "unbound";
}

function buildClearIntentEventId(event: ClearIntentKeeperHubEvent, occurredAt: string): string {
  const material = [
    event.agentEnsName,
    event.agentAccount,
    event.intentHash,
    event.policyHash,
    event.transactionHash,
    event.status,
    occurredAt
  ].join(":");
  return `ci_kh_${simpleHash(material)}`;
}

function simpleHash(value: string): string {
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= BigInt(value.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, "0");
}

function disabledDelivery(): KeeperHubEventIngestReceipt["delivery"] {
  return {
    fanout: "disabled",
    userWebhookForwarding: false,
    detail: "Events are isolated by agent identity/account and are not forwarded to user webhooks until scoped registration exists."
  };
}

function optionalNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
