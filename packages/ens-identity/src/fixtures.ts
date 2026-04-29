import { encodeAgentCard } from "./agent-card";
import { ENS_IDENTITY_RECORD_KEYS } from "./record-keys";
import type { AgentCard, EnsResolverRecord } from "./types";

export const localAgentCardFixture = {
  schemaVersion: "clearintent.agent-card.v1",
  ensName: "guardian.clearintent.eth",
  displayName: "Guardian Demo Agent",
  controllerAddress: "0x1111111111111111111111111111111111111111",
  capabilities: ["contract_call", "policy_bound_execution"],
  policy: {
    uri: "local://zerog-memory/policy/guardian-demo-policy",
    hash: "0x1111111111111111111111111111111111111111111111111111111111111111"
  },
  audit: {
    latest: "local://zerog-memory/audit-bundle/guardian-demo-audit"
  },
  clearintentVersion: "0.1.0",
  claimLevel: "ens-local-fixture"
} satisfies AgentCard;

export const localEnsIdentityFixture = {
  ensName: localAgentCardFixture.ensName,
  address: localAgentCardFixture.controllerAddress,
  textRecords: {
    [ENS_IDENTITY_RECORD_KEYS.agentCard]: "local://ens-agent-card/guardian-demo-agent-card",
    [ENS_IDENTITY_RECORD_KEYS.policyUri]: localAgentCardFixture.policy.uri,
    [ENS_IDENTITY_RECORD_KEYS.policyHash]: localAgentCardFixture.policy.hash,
    [ENS_IDENTITY_RECORD_KEYS.auditLatest]: localAgentCardFixture.audit.latest,
    [ENS_IDENTITY_RECORD_KEYS.clearintentVersion]: localAgentCardFixture.clearintentVersion
  },
  agentCards: {
    "local://ens-agent-card/guardian-demo-agent-card": localAgentCardFixture
  }
} satisfies EnsResolverRecord;

export function createEnsIdentityFixture(overrides: Partial<EnsResolverRecord> = {}): EnsResolverRecord {
  return {
    ...localEnsIdentityFixture,
    ...overrides,
    textRecords: {
      ...localEnsIdentityFixture.textRecords,
      ...overrides.textRecords
    },
    agentCards: {
      ...localEnsIdentityFixture.agentCards,
      ...overrides.agentCards
    }
  };
}
