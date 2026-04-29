export const ENS_IDENTITY_RECORD_KEYS = {
  agentCard: "agent.card",
  policyUri: "policy.uri",
  policyHash: "policy.hash",
  auditLatest: "audit.latest",
  clearintentVersion: "clearintent.version"
} as const;

export type EnsIdentityRecordKey = (typeof ENS_IDENTITY_RECORD_KEYS)[keyof typeof ENS_IDENTITY_RECORD_KEYS];

export const REQUIRED_ENS_IDENTITY_RECORDS = Object.values(ENS_IDENTITY_RECORD_KEYS);
