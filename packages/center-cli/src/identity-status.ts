export type CenterIdentityStatus = {
  ok: boolean;
  claimLevel: "ens-local-fixture";
  liveProvider: false;
  ensName?: string;
  providerMode?: string;
  records?: Record<string, string>;
  summary: string;
  checks: {
    id: string;
    label: string;
    status: "pass" | "blocking" | "degraded";
    detail: string;
  }[];
  degradedReasons: string[];
  blockingReasons: string[];
};

type EnsResolutionIssue = {
  code: string;
  message: string;
};

type EnsResolutionResult = {
  ok: boolean;
  value?: {
    providerMode?: string;
    agentIdentity?: {
      ensName?: string;
    };
    records?: Record<string, string>;
  };
  issues?: EnsResolutionIssue[];
};

type EnsIdentityApi = {
  getCenterIdentityStatus?: () => CenterIdentityStatus | Promise<CenterIdentityStatus>;
  getEnsIdentityStatus?: () => CenterIdentityStatus | Promise<CenterIdentityStatus>;
  resolveLocalEnsIdentityStatus?: () => CenterIdentityStatus | Promise<CenterIdentityStatus>;
  LocalEnsResolver?: new (options: { records: unknown[] }) => unknown;
  createLocalEnsResolver?: (options: { records: unknown[] }) => unknown;
  localEnsIdentityFixture?: { ensName: string };
  localAgentCardFixture?: { policy?: { hash?: string } };
  resolveEnsIdentity?: (resolver: unknown, input: { ensName: string; expectedPolicyHash?: string }) => Promise<EnsResolutionResult>;
};

export async function getCenterIdentityStatus(): Promise<CenterIdentityStatus> {
  const api = await loadEnsIdentityApi();
  const readStatus =
    api?.getCenterIdentityStatus ?? api?.getEnsIdentityStatus ?? api?.resolveLocalEnsIdentityStatus;

  if (readStatus === undefined) {
    return resolveIdentityFromPublicApi(api);
  }

  try {
    return normalizeIdentityStatus(await readStatus());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return unavailableIdentityStatus("ens_identity_fixture_failed", message);
  }
}

async function resolveIdentityFromPublicApi(api: EnsIdentityApi | undefined): Promise<CenterIdentityStatus> {
  if (
    api?.resolveEnsIdentity === undefined ||
    api.localEnsIdentityFixture === undefined ||
    (api.LocalEnsResolver === undefined && api.createLocalEnsResolver === undefined)
  ) {
    return unavailableIdentityStatus("ens_identity_api_unavailable", "packages/ens-identity public status API is not available in this worktree.");
  }

  try {
    const resolver =
      api.createLocalEnsResolver?.({ records: [api.localEnsIdentityFixture] }) ??
      new (api.LocalEnsResolver as NonNullable<EnsIdentityApi["LocalEnsResolver"]>)({ records: [api.localEnsIdentityFixture] });
    const result = await api.resolveEnsIdentity(resolver, {
      ensName: api.localEnsIdentityFixture.ensName,
      expectedPolicyHash: api.localAgentCardFixture?.policy?.hash
    });

    if (result.ok && result.value !== undefined) {
      return {
        ok: true,
        claimLevel: "ens-local-fixture",
        liveProvider: false,
        ensName: result.value.agentIdentity?.ensName,
        providerMode: result.value.providerMode,
        records: result.value.records,
        summary: "Local ENS identity fixture resolved through packages/ens-identity. Identity discovery is not authority approval.",
        checks: [
          {
            id: "fixture",
            label: "Local ENS fixture",
            status: "pass",
            detail: "Resolved local ENS agent identity fixture through the public ENS identity API."
          },
          {
            id: "live-ens",
            label: "Live ENS lookup",
            status: "degraded",
            detail: "Live ENS provider is disabled for Phase 3A."
          },
          {
            id: "live-0g",
            label: "Live 0G binding",
            status: "degraded",
            detail: "Live 0G binding is not claimed by the identity status route."
          }
        ],
        degradedReasons: ["live_ens_disabled", "live_0g_not_claimed"],
        blockingReasons: []
      };
    }

    return unavailableIdentityStatus(
      "ens_identity_fixture_failed",
      formatEnsIssues(result.issues) || "packages/ens-identity fixture resolution failed."
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return unavailableIdentityStatus("ens_identity_fixture_failed", message);
  }
}

async function loadEnsIdentityApi(): Promise<EnsIdentityApi | undefined> {
  const modulePath = "../../ens-identity/src";
  try {
    return (await import(modulePath)) as EnsIdentityApi;
  } catch {
    return undefined;
  }
}

function normalizeIdentityStatus(status: CenterIdentityStatus): CenterIdentityStatus {
  return {
    ...status,
    claimLevel: "ens-local-fixture",
    liveProvider: false,
    ok: status.ok === true && status.blockingReasons.length === 0
  };
}

function formatEnsIssues(issues: EnsResolutionIssue[] | undefined): string {
  if (issues === undefined || issues.length === 0) {
    return "";
  }
  return issues.map((issue) => `${issue.code}: ${issue.message}`).join("; ");
}

function unavailableIdentityStatus(
  code = "ens_identity_api_unavailable",
  detail = "packages/ens-identity public status API is not available yet."
): CenterIdentityStatus {
  return {
    ok: false,
    claimLevel: "ens-local-fixture",
    liveProvider: false,
    summary: "ENS identity status is blocked because the local fixture API is not available. No live ENS or 0G claim is made.",
    checks: [
      {
        id: "fixture",
        label: "Local ENS fixture",
        status: "blocking",
        detail
      },
      {
        id: "live-ens",
        label: "Live ENS lookup",
        status: "degraded",
        detail: "Live ENS provider is disabled for Phase 3A."
      },
      {
        id: "live-0g",
        label: "Live 0G binding",
        status: "degraded",
        detail: "Live 0G binding is not claimed by the identity status route."
      }
    ],
    degradedReasons: ["live_ens_disabled", "live_0g_not_claimed"],
    blockingReasons: [code]
  };
}
