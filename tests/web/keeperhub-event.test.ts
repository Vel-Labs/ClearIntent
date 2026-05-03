import { describe, expect, it } from "vitest";
import { POST } from "../../apps/web/src/app/api/keeperhub/events/route";
import { buildKeeperHubEventDisplayModel } from "../../apps/web/src/components/events/keeperhub-event-boundary";
import {
  CLEARINTENT_KEEPERHUB_EVENT_SCHEMA_VERSION,
  KEEPERHUB_EVENT_AUTHORITY,
  KEEPERHUB_EVENT_SCHEMA_VERSION,
  buildKeeperHubWebhookToken,
  ingestKeeperHubReportedEvent
} from "../../apps/web/src/lib/events/keeperhub-event";

const validEvent = {
  schemaVersion: KEEPERHUB_EVENT_SCHEMA_VERSION,
  eventId: "evt_keeperhub_001",
  eventType: "workflow.run.updated",
  workflowId: "r8hbrox9eorgvvlunk72b",
  runId: "089to8oqegw0r48i63vbj",
  status: "executed",
  occurredAt: "2026-05-02T18:30:00Z",
  intentHash: `0x${"a".repeat(64)}`,
  policyHash: `0x${"b".repeat(64)}`,
  source: {
    provider: "keeperhub",
    projectId: "project_demo"
  }
};

const validClearIntentEvent = {
  source: "keeperhub",
  project: "clearintent",
  schemaVersion: CLEARINTENT_KEEPERHUB_EVENT_SCHEMA_VERSION,
  eventType: "clearintent.execution.completed",
  status: "completed",
  error: "null",
  severity: "info",
  shouldExecute: "true",
  parentWallet: "0xF7aDD17E99F097f9D0A6150D093EC049B2698c60",
  agentAccount: "0x8b1F1bE3D0ab7C9B1180d66970fed3033B7CE720",
  agentEnsName: "vel2.agent.clearintent.eth",
  intentHash: `0x${"c".repeat(64)}`,
  verificationIntentHash: `0x${"c".repeat(64)}`,
  policyHash: `0x${"d".repeat(64)}`,
  verificationPolicyHash: `0x${"d".repeat(64)}`,
  auditLatest: "0g://example",
  actionType: "demo.transfer",
  target: "0x0000000000000000000000000000000000000000",
  chainId: "11155111",
  valueLimit: "0.001 ETH",
  executor: "keeperhub",
  signer: "0xF7aDD17E99F097f9D0A6150D093EC049B2698c60",
  transactionHash: "none"
};

describe("KeeperHub reported event boundary", () => {
  it("accepts valid KeeperHub-shaped events as reported and non-authoritative", () => {
    const result = ingestKeeperHubReportedEvent(validEvent, {
      headers: {
        authorization: "Bearer example",
        "x-keeperhub-signature": "sig_example",
        "x-keeperhub-timestamp": "2026-05-02T18:30:00Z",
        "x-keeperhub-workflow-id": "r8hbrox9eorgvvlunk72b"
      }
    });

    expect(result.ok).toBe(true);
    expect(result.authoritative).toBe(false);
    expect(result.boundary).toBe(KEEPERHUB_EVENT_AUTHORITY);
    expect(result.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "token", status: "not_configured", supplied: true, authoritative: false }),
        expect.objectContaining({ id: "signature", status: "not_implemented", supplied: true, authoritative: false }),
        expect.objectContaining({ id: "timestamp_replay", status: "not_implemented", supplied: true, authoritative: false }),
        expect.objectContaining({ id: "source_binding", status: "not_checked", supplied: true, authoritative: false })
      ])
    );
  });

  it("rejects malformed events with deterministic issues", () => {
    const result = ingestKeeperHubReportedEvent({
      schemaVersion: KEEPERHUB_EVENT_SCHEMA_VERSION,
      eventId: "evt_bad",
      workflowId: "r8hbrox9eorgvvlunk72b",
      status: "trusted",
      occurredAt: "not-a-date"
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues).toEqual([
      { code: "missing_event_type", message: "KeeperHub event requires eventType.", path: "eventType" },
      {
        code: "missing_run_or_execution_id",
        message: "KeeperHub event requires runId or executionId.",
        path: "runId"
      },
      {
        code: "invalid_status",
        message: "KeeperHub event status must be one of pending, running, submitted, executed, failed, or degraded.",
        path: "status"
      },
      {
        code: "invalid_occurred_at",
        message: "KeeperHub event requires occurredAt as an ISO-compatible timestamp.",
        path: "occurredAt"
      }
    ]);
  });

  it("accepts the ClearIntent KeeperHub webhook payload without forwarding user events", () => {
    const result = ingestKeeperHubReportedEvent(validClearIntentEvent, {
      headers: { "x-keeperhub-workflow-id": "r8hbrox9eorgvvlunk72b" }
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.event.workflowId).toBe("r8hbrox9eorgvvlunk72b");
    expect(result.event.status).toBe("executed");
    expect(result.clearintent?.agentEnsName).toBe("vel2.agent.clearintent.eth");
    expect(result.isolationKey).toBe("0x8b1F1bE3D0ab7C9B1180d66970fed3033B7CE720");
    expect(result.delivery.userWebhookForwarding).toBe(false);
  });

  it("accepts ClearIntent KeeperHub events with an agent-scoped webhook token", () => {
    const token = buildKeeperHubWebhookToken({
      secret: "demo_secret",
      parentWallet: validClearIntentEvent.parentWallet,
      agentAccount: validClearIntentEvent.agentAccount,
      agentEnsName: validClearIntentEvent.agentEnsName
    });

    const result = ingestKeeperHubReportedEvent(validClearIntentEvent, {
      webhookSecret: "demo_secret",
      headers: {
        "x-clearintent-webhook-token": token,
        "x-keeperhub-workflow-id": "r8hbrox9eorgvvlunk72b"
      }
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: "token",
        status: "pass",
        supplied: true,
        authoritative: false
      })
    );
  });

  it("rejects ClearIntent KeeperHub events when configured token verification fails", () => {
    const result = ingestKeeperHubReportedEvent(validClearIntentEvent, {
      webhookSecret: "demo_secret",
      headers: {
        "x-clearintent-webhook-token": "wrong-token",
        "x-keeperhub-workflow-id": "r8hbrox9eorgvvlunk72b"
      }
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "invalid_webhook_token", path: "headers.x-clearintent-webhook-token" })
    );
    expect(result.checks).toContainEqual(
      expect.objectContaining({
        id: "token",
        status: "fail",
        supplied: true,
        authoritative: false
      })
    );
  });

  it("rejects unresolved KeeperHub template values before event routing", () => {
    const result = ingestKeeperHubReportedEvent({
      ...validClearIntentEvent,
      agentEnsName: "{{Evaluate ClearIntent Gate.result.agentEnsName}}"
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "unresolved_template_value", path: "agentEnsName" })
    );
  });

  it("rejects placeholder none values as missing user isolation", () => {
    const result = ingestKeeperHubReportedEvent({
      ...validClearIntentEvent,
      parentWallet: "none",
      agentAccount: "none",
      agentEnsName: "none"
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "missing_agent_binding", path: "agentEnsName" })
    );
  });

  it("returns deterministic JSON from the ingest route", async () => {
    const request = new Request("http://localhost/api/keeperhub/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validEvent)
    });

    const first = await POST(request);
    const second = await POST(
      new Request("http://localhost/api/keeperhub/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validEvent)
      })
    );

    expect(first.status).toBe(202);
    expect(await first.text()).toBe(await second.text());
  });

  it("builds display copy that cannot be mistaken for trusted evidence", () => {
    const result = ingestKeeperHubReportedEvent(validEvent);
    const display = buildKeeperHubEventDisplayModel(result);

    expect(display.trustLabel).toBe("Reported / non-authoritative");
    expect(display.subtitle).toContain("not authority evidence");
    expect(display.boundaryNotes).toContain("Signature verification is not implemented.");
  });
});
