import { describe, expect, it } from "vitest";
import {
  createEnsIdentityFixture,
  ENS_IDENTITY_RECORD_KEYS,
  LiveLookupUnavailableResolver,
  LocalEnsResolver,
  localAgentCardFixture,
  localEnsIdentityFixture,
  resolveEnsIdentity,
  type EnsResolverRecord
} from "../../packages/ens-identity/src";

describe("ENS identity local scaffold", () => {
  it("resolves a fixture-backed ClearIntent ENS identity", async () => {
    const result = await resolveValidFixture();

    expect(result.ok).toBe(true);
    expect(result.value?.claimLevel).toBe("ens-local-fixture");
    expect(result.value?.providerMode).toBe("local");
    expect(result.value?.liveProvider).toBe(false);
    expect(result.value?.agentIdentity.ensName).toBe("guardian.clearintent.eth");
    expect(result.value?.agentIdentity.controllerAddress).toBe(localAgentCardFixture.controllerAddress);
  });

  it("resolves agent.card into the typed agent card shape", async () => {
    const result = await resolveValidFixture();

    expect(result.ok).toBe(true);
    expect(result.value?.agentCard).toEqual(localAgentCardFixture);
    expect(result.value?.records.agentCardUri).toBe(localEnsIdentityFixture.textRecords[ENS_IDENTITY_RECORD_KEYS.agentCard]);
    expect(result.value?.agentIdentity.agentCardUri).toBe(localEnsIdentityFixture.textRecords[ENS_IDENTITY_RECORD_KEYS.agentCard]);
  });

  it("extracts policy URI and policy hash text records", async () => {
    const result = await resolveValidFixture();

    expect(result.ok).toBe(true);
    expect(result.value?.records.policyUri).toBe(localAgentCardFixture.policy.uri);
    expect(result.value?.records.policyHash).toBe(localAgentCardFixture.policy.hash);
  });

  it("extracts audit.latest text record", async () => {
    const result = await resolveValidFixture();

    expect(result.ok).toBe(true);
    expect(result.value?.records.auditLatest).toBe(localAgentCardFixture.audit.latest);
  });

  it("extracts clearintent.version text record", async () => {
    const result = await resolveValidFixture();

    expect(result.ok).toBe(true);
    expect(result.value?.records.clearintentVersion).toBe(localAgentCardFixture.clearintentVersion);
  });

  it("blocks missing required record behavior with explicit missing_record issue", async () => {
    const fixture = withoutRecord(ENS_IDENTITY_RECORD_KEYS.policyHash);
    const resolver = new LocalEnsResolver({ records: [fixture] });

    const result = await resolveEnsIdentity(resolver, { ensName: fixture.ensName });

    expect(result.ok).toBe(false);
    expect(result.state).toBe("blocked");
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_record",
          recordKey: ENS_IDENTITY_RECORD_KEYS.policyHash
        })
      ])
    );
  });

  it("blocks policy hash mismatch against an expected contract hash", async () => {
    const resolver = new LocalEnsResolver({ records: [localEnsIdentityFixture] });

    const result = await resolveEnsIdentity(resolver, {
      ensName: localEnsIdentityFixture.ensName,
      expectedPolicyHash: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    });

    expect(result.ok).toBe(false);
    expect(result.state).toBe("blocked");
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "policy_hash_mismatch",
          recordKey: ENS_IDENTITY_RECORD_KEYS.policyHash,
          actual: localAgentCardFixture.policy.hash
        })
      ])
    );
  });

  it("does not make a live ENS claim from Phase 3A fixtures", async () => {
    const localResult = await resolveValidFixture();
    const liveResult = await resolveEnsIdentity(new LiveLookupUnavailableResolver(), {
      ensName: localEnsIdentityFixture.ensName
    });

    expect(localResult.ok).toBe(true);
    expect(localResult.value?.claimLevel).toBe("ens-local-fixture");
    expect(localResult.value?.liveProvider).toBe(false);
    expect(liveResult.ok).toBe(false);
    expect(liveResult.issues.map((issue) => issue.code)).toContain("live_lookup_unavailable");
  });

  it("reports missing name, missing resolver, and unsupported network explicitly", async () => {
    const resolver = new LocalEnsResolver({
      records: [localEnsIdentityFixture],
      namesWithoutResolver: ["no-resolver.clearintent.eth"]
    });

    const missingName = await resolveEnsIdentity(resolver, { ensName: "missing.clearintent.eth" });
    const missingResolver = await resolveEnsIdentity(resolver, { ensName: "no-resolver.clearintent.eth" });
    const unsupportedNetwork = await resolveEnsIdentity(resolver, {
      ensName: localEnsIdentityFixture.ensName,
      network: "mainnet"
    });

    expect(missingName.issues.map((issue) => issue.code)).toContain("missing_name");
    expect(missingResolver.issues.map((issue) => issue.code)).toContain("missing_resolver");
    expect(unsupportedNetwork.issues.map((issue) => issue.code)).toContain("unsupported_network");
  });
});

async function resolveValidFixture() {
  const resolver = new LocalEnsResolver({ records: [localEnsIdentityFixture] });
  return resolveEnsIdentity(resolver, {
    ensName: localEnsIdentityFixture.ensName,
    expectedPolicyHash: localAgentCardFixture.policy.hash
  });
}

function withoutRecord(recordKey: keyof EnsResolverRecord["textRecords"]): EnsResolverRecord {
  const fixture = createEnsIdentityFixture();
  const textRecords = { ...fixture.textRecords };
  delete textRecords[recordKey];
  return {
    ...fixture,
    textRecords
  };
}
