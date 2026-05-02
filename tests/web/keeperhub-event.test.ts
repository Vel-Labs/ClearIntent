import { describe, expect, it } from "vitest";
import { POST } from "../../apps/web/src/app/api/keeperhub/events/route";
import { buildKeeperHubEventDisplayModel } from "../../apps/web/src/components/events/keeperhub-event-boundary";
import {
  KEEPERHUB_EVENT_AUTHORITY,
  KEEPERHUB_EVENT_SCHEMA_VERSION,
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
        expect.objectContaining({ id: "token", status: "not_implemented", supplied: true, authoritative: false }),
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
