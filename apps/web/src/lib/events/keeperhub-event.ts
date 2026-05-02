export const KEEPERHUB_EVENT_SCHEMA_VERSION = "clearintent.keeperhub.reported-event.v1" as const;
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

export type KeeperHubEventIssueCode =
  | "invalid_payload"
  | "unsupported_schema_version"
  | "missing_event_id"
  | "missing_event_type"
  | "missing_workflow_id"
  | "missing_run_or_execution_id"
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
  status: "not_implemented" | "not_checked";
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
    checks,
    warnings: [
      "KeeperHub event shape was accepted for display only.",
      "Token, signature, timestamp/replay, and source-binding checks are planned but not implemented."
    ]
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
      status: "not_implemented",
      supplied: hasHeader(headers, "authorization") || hasHeader(headers, "x-keeperhub-token"),
      authoritative: false,
      detail: "Token presence can be observed, but token validation is not implemented in this stub."
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
  if (text !== undefined && !/^0x[a-fA-F0-9]{64}$/.test(text)) {
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
  if (headers === undefined) return false;
  if (headers instanceof Headers) {
    return optionalNonEmptyString(headers.get(key)) !== undefined;
  }
  const match = Object.entries(headers).find(([header]) => header.toLowerCase() === key.toLowerCase());
  return optionalNonEmptyString(match?.[1]) !== undefined;
}

function optionalNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
