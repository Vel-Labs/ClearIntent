import type { AgentCard, EnsIdentityIssue, EnsIdentityResult } from "./types";

export function parseAgentCard(raw: string): EnsIdentityResult<AgentCard> {
  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    return blocked("missing_record", "agent.card must contain parseable JSON.", "agent.card");
  }

  if (!isAgentCard(value)) {
    return blocked("missing_record", "agent.card did not match clearintent.agent-card.v1.", "agent.card");
  }

  if (value.claimLevel !== "ens-local-fixture") {
    return blocked("live_lookup_unavailable", "Phase 3A only supports ens-local-fixture agent cards.", "agent.card");
  }

  return {
    ok: true,
    state: "resolved",
    value,
    issues: []
  };
}

export function encodeAgentCard(card: AgentCard): string {
  return JSON.stringify(card);
}

function isAgentCard(value: unknown): value is AgentCard {
  if (!value || typeof value !== "object") {
    return false;
  }

  const card = value as AgentCard;
  return (
    card.schemaVersion === "clearintent.agent-card.v1" &&
    typeof card.ensName === "string" &&
    typeof card.displayName === "string" &&
    typeof card.controllerAddress === "string" &&
    Array.isArray(card.capabilities) &&
    card.capabilities.every((capability) => typeof capability === "string") &&
    typeof card.policy?.uri === "string" &&
    typeof card.policy?.hash === "string" &&
    typeof card.audit?.latest === "string" &&
    typeof card.clearintentVersion === "string" &&
    card.claimLevel === "ens-local-fixture"
  );
}

function blocked(
  code: EnsIdentityIssue["code"],
  message: string,
  recordKey?: EnsIdentityIssue["recordKey"]
): EnsIdentityResult<AgentCard> {
  return {
    ok: false,
    state: "blocked",
    issues: [{ code, message, recordKey }]
  };
}
