import type { KeeperHubEventIngestResult, KeeperHubReportedEvent } from "../../lib/events/keeperhub-event";

export type KeeperHubEventDisplayModel = {
  title: string;
  subtitle: string;
  trustLabel: "Reported / non-authoritative";
  severity: "info" | "warning" | "error";
  rows: { label: string; value: string }[];
  boundaryNotes: string[];
};

export function buildKeeperHubEventDisplayModel(input: KeeperHubEventIngestResult): KeeperHubEventDisplayModel {
  if (!input.ok) {
    return {
      title: "KeeperHub event rejected",
      subtitle: "Payload shape did not pass the reported-event boundary.",
      trustLabel: "Reported / non-authoritative",
      severity: "error",
      rows: input.issues.map((issue) => ({
        label: issue.code,
        value: issue.path === undefined ? issue.message : `${issue.path}: ${issue.message}`
      })),
      boundaryNotes: boundaryNotes()
    };
  }

  return {
    title: titleForEvent(input.event),
    subtitle: "Accepted for dashboard display only. This is not authority evidence.",
    trustLabel: "Reported / non-authoritative",
    severity: input.event.status === "failed" || input.event.status === "degraded" ? "warning" : "info",
    rows: eventRows(input.event),
    boundaryNotes: boundaryNotes()
  };
}

function titleForEvent(event: KeeperHubReportedEvent): string {
  return `KeeperHub ${event.status} event`;
}

function eventRows(event: KeeperHubReportedEvent): { label: string; value: string }[] {
  return [
    { label: "eventId", value: event.eventId },
    { label: "eventType", value: event.eventType },
    { label: "workflowId", value: event.workflowId },
    { label: "runId", value: event.runId ?? "missing" },
    { label: "executionId", value: event.executionId ?? "missing" },
    { label: "occurredAt", value: event.occurredAt },
    { label: "transactionHash", value: event.transactionHash ?? "not reported" }
  ];
}

function boundaryNotes(): string[] {
  return [
    "Token validation is not implemented.",
    "Signature verification is not implemented.",
    "Timestamp or nonce replay protection is not implemented.",
    "Source binding to a configured KeeperHub workflow/project is not implemented."
  ];
}
