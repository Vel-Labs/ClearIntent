import { describe, expect, it } from "vitest";
import {
  createEnsIdentityFixture,
  ENS_IDENTITY_RECORD_KEYS,
  LiveLookupUnavailableResolver,
  LocalEnsResolver,
  LiveEnsResolver,
  getEnsBindingPreparationStatus,
  getEnsLiveReadStatus,
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

  it("reads live ENS-shaped records through the live resolver interface", async () => {
    const resolver = new LiveEnsResolver({
      providerMode: "live",
      chainId: 1,
      networkName: "mainnet",
      rpcUrl: "mock://ens",
      provider: fakeProvider({
        address: localAgentCardFixture.controllerAddress,
        textRecords: localEnsIdentityFixture.textRecords
      })
    });

    const result = await resolver.resolveName({ ensName: "guardian.agent.clearintent.eth" });

    expect(result.ok).toBe(true);
    expect(result.value?.ensName).toBe("guardian.agent.clearintent.eth");
    expect(result.value?.address).toBe(localAgentCardFixture.controllerAddress);
    expect(result.value?.textRecords[ENS_IDENTITY_RECORD_KEYS.policyHash]).toBe(localAgentCardFixture.policy.hash);
  });

  it("reports ens-live-bound when live records and expected policy hash match", async () => {
    const status = await getEnsLiveReadStatus(
      {
        ENS_PROVIDER_RPC: "mock://ens",
        ENS_NAME: "guardian.agent.clearintent.eth",
        ENS_EXPECTED_POLICY_HASH: localAgentCardFixture.policy.hash
      },
      fakeProvider({
        address: localAgentCardFixture.controllerAddress,
        textRecords: localEnsIdentityFixture.textRecords
      })
    );

    expect(status.ok).toBe(true);
    expect(status.claimLevel).toBe("ens-live-bound");
    expect(status.liveProvider).toBe(true);
    expect(status.records[ENS_IDENTITY_RECORD_KEYS.policyUri]).toBe(localAgentCardFixture.policy.uri);
    expect(status.degradedReasons).toEqual([]);
  });

  it("accepts legacy ClearIntent ENS env aliases for local operator config", async () => {
    const status = await getEnsLiveReadStatus(
      {
        ENS_EVM_RPC: "mock://ens",
        CLEARINTENT_ENS_NAME: "guardian.agent.clearintent.eth",
        CLEARINTENT_EXPECTED_POLICY_HASH: localAgentCardFixture.policy.hash
      },
      fakeProvider({
        address: localAgentCardFixture.controllerAddress,
        textRecords: localEnsIdentityFixture.textRecords
      })
    );

    expect(status.ok).toBe(true);
    expect(status.claimLevel).toBe("ens-live-bound");
    expect(status.ensName).toBe("guardian.agent.clearintent.eth");
  });

  it("degrades live read when records exist but policy hash is not bound", async () => {
    const status = await getEnsLiveReadStatus(
      {
        ENS_PROVIDER_RPC: "mock://ens",
        ENS_NAME: "guardian.agent.clearintent.eth"
      },
      fakeProvider({
        address: localAgentCardFixture.controllerAddress,
        textRecords: localEnsIdentityFixture.textRecords
      })
    );

    expect(status.ok).toBe(true);
    expect(status.claimLevel).toBe("ens-live-read");
    expect(status.degradedReasons).toContain("policy_hash_not_bound");
  });

  it("blocks live read until ENS provider and name config exist", async () => {
    const status = await getEnsLiveReadStatus({});

    expect(status.ok).toBe(false);
    expect(status.claimLevel).toBe("ens-local-fixture");
    expect(status.blockingReasons).toContain("live_config_missing");
  });

  it("prepares one resolver multicall for ClearIntent text-record binding", async () => {
    const status = await getEnsBindingPreparationStatus(
      {
        ENS_NAME: "guardian.agent.clearintent.eth",
        CLEARINTENT_AGENT_CARD_URI: "0g://agent-card",
        CLEARINTENT_POLICY_URI: "0g://policy",
        CLEARINTENT_POLICY_HASH: localAgentCardFixture.policy.hash,
        CLEARINTENT_AUDIT_LATEST: "0g://audit",
        CLEARINTENT_VERSION: "0.1.0"
      },
      fakeProvider({
        resolverAddress: "0x4444444444444444444444444444444444444444",
        address: localAgentCardFixture.controllerAddress,
        textRecords: localEnsIdentityFixture.textRecords
      })
    );

    expect(status.ok).toBe(true);
    expect(status.tx?.to).toBe("0x4444444444444444444444444444444444444444");
    expect(status.tx?.method).toBe("multicall(bytes[])");
    expect(status.tx?.records.map((record) => record.key)).toEqual([
      "agent.card",
      "policy.uri",
      "policy.hash",
      "audit.latest",
      "clearintent.version"
    ]);
    expect(status.tx?.data.startsWith("0xac9650d8")).toBe(true);
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

function fakeProvider(record: { resolverAddress?: string; address?: string; textRecords: EnsResolverRecord["textRecords"] }) {
  return {
    async getResolver() {
      return {
        address: record.resolverAddress,
        async getAddress() {
          return record.address ?? "0x0000000000000000000000000000000000000000";
        },
        async getText(key: string) {
          return record.textRecords[key as keyof typeof record.textRecords] ?? null;
        }
      };
    }
  };
}
