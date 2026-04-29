import { parseAgentCard } from "./agent-card";
import { ENS_IDENTITY_RECORD_KEYS } from "./record-keys";
import type {
  AgentCard,
  EnsIdentityIssue,
  EnsIdentityResult,
  EnsResolverAdapter,
  EnsResolverRecord,
  ResolvedEnsIdentity
} from "./types";

export type ResolveEnsIdentityInput = {
  ensName: string;
  network?: string;
  expectedPolicyHash?: string;
};

export async function resolveEnsIdentity(
  resolver: EnsResolverAdapter,
  input: ResolveEnsIdentityInput
): Promise<EnsIdentityResult<ResolvedEnsIdentity>> {
  const lookup = await resolver.resolveName(input);
  if (!lookup.ok) {
    return {
      ok: false,
      state: lookup.state,
      issues: lookup.issues
    };
  }

  const records = lookup.value.textRecords;
  const missing = requiredRecordIssues(lookup.value);
  if (missing.length > 0) {
    return {
      ok: false,
      state: "blocked",
      issues: missing
    };
  }

  const agentCardUri = records[ENS_IDENTITY_RECORD_KEYS.agentCard] as string;
  const agentCardRaw = resolveAgentCardRecord(lookup.value, agentCardUri);
  if (agentCardRaw === undefined) {
    return {
      ok: false,
      state: "blocked",
      issues: [
        {
          code: "missing_record",
          message: `agent.card pointer did not resolve to a local agent card fixture: ${agentCardUri}.`,
          recordKey: ENS_IDENTITY_RECORD_KEYS.agentCard,
          ensName: lookup.value.ensName
        }
      ]
    };
  }

  const cardResult = parseAgentCard(agentCardRaw);
  if (!cardResult.ok) {
    return {
      ok: false,
      state: cardResult.state,
      issues: cardResult.issues
    };
  }

  const policyHash = records[ENS_IDENTITY_RECORD_KEYS.policyHash] as string;
  if (input.expectedPolicyHash && input.expectedPolicyHash !== policyHash) {
    return {
      ok: false,
      state: "blocked",
      issues: [
        {
          code: "policy_hash_mismatch",
          message: "Resolved ENS policy.hash did not match the expected policy hash.",
          recordKey: ENS_IDENTITY_RECORD_KEYS.policyHash,
          ensName: lookup.value.ensName,
          expected: input.expectedPolicyHash,
          actual: policyHash
        }
      ]
    };
  }

  return resolvedIdentity(resolver, lookup.value, cardResult.value, agentCardUri);
}

function requiredRecordIssues(record: EnsResolverRecord): EnsIdentityIssue[] {
  return Object.values(ENS_IDENTITY_RECORD_KEYS)
    .filter((key) => !record.textRecords[key])
    .map((recordKey) => ({
      code: "missing_record" as const,
      message: `Required ENS text record is missing: ${recordKey}.`,
      recordKey,
      ensName: record.ensName
    }));
}

function resolvedIdentity(
  resolver: EnsResolverAdapter,
  record: EnsResolverRecord,
  agentCard: AgentCard,
  agentCardUri: string
): EnsIdentityResult<ResolvedEnsIdentity> {
  const text = record.textRecords;

  return {
    ok: true,
    state: "resolved",
    value: {
      claimLevel: resolver.claimLevel,
      providerMode: resolver.providerMode,
      liveProvider: false,
      agentIdentity: {
        ensName: record.ensName,
        controllerAddress: agentCard.controllerAddress,
        agentCardUri,
        role: undefined
      },
      agentCard,
      records: {
        agentCardUri,
        policyUri: text[ENS_IDENTITY_RECORD_KEYS.policyUri] as string,
        policyHash: text[ENS_IDENTITY_RECORD_KEYS.policyHash] as string,
        auditLatest: text[ENS_IDENTITY_RECORD_KEYS.auditLatest] as string,
        clearintentVersion: text[ENS_IDENTITY_RECORD_KEYS.clearintentVersion] as string
      }
    },
    issues: []
  };
}

function resolveAgentCardRecord(record: EnsResolverRecord, agentCardUri: string): string | undefined {
  if (agentCardUri.trim().startsWith("{")) {
    return agentCardUri;
  }

  const card = record.agentCards?.[agentCardUri];
  if (card === undefined) {
    return undefined;
  }

  return JSON.stringify(card);
}
