export type CenterIdentityStatus = {
  ok: boolean;
  claimLevel: "ens-local-fixture" | "ens-live-read" | "ens-live-bound";
  liveProvider: boolean;
  ensName?: string;
  address?: string;
  providerMode?: string;
  records?: Record<string, string | undefined>;
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

export type CenterIdentityBindingStatus = {
  ok: boolean;
  ensName?: string;
  resolverAddress?: string;
  tx?: {
    ensName: string;
    node: string;
    resolverAddress: string;
    records: { key: string; value: string }[];
    to: string;
    value: "0";
    data: string;
    method: "multicall(bytes[])";
    summary: string;
  };
  transactionHash?: string;
  blockNumber?: number;
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
    records?: Record<string, string | undefined>;
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
  getEnsLiveReadStatus?: (env?: NodeJS.ProcessEnv) => CenterIdentityStatus | Promise<CenterIdentityStatus>;
  getEnsBindingPreparationStatus?: (env?: NodeJS.ProcessEnv) => CenterIdentityBindingStatus | Promise<CenterIdentityBindingStatus>;
  sendEnsBindingRecords?: (env?: NodeJS.ProcessEnv) => CenterIdentityBindingStatus | Promise<CenterIdentityBindingStatus>;
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

export async function getCenterLiveIdentityStatus(env: NodeJS.ProcessEnv = process.env): Promise<CenterIdentityStatus> {
  const api = await loadEnsIdentityApi();
  if (api?.getEnsLiveReadStatus === undefined) {
    return {
      ok: false,
      claimLevel: "ens-local-fixture",
      liveProvider: true,
      providerMode: "live",
      summary: "ENS live status is blocked because the live resolver API is not available.",
      checks: [
        {
          id: "live-api",
          label: "Live ENS API",
          status: "blocking",
          detail: "packages/ens-identity does not expose getEnsLiveReadStatus."
        }
      ],
      degradedReasons: [],
      blockingReasons: ["ens_live_api_unavailable"]
    };
  }

  try {
    return normalizeLiveIdentityStatus(await api.getEnsLiveReadStatus(env));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      claimLevel: "ens-local-fixture",
      liveProvider: true,
      providerMode: "live",
      summary: "ENS live lookup failed before producing a claim.",
      checks: [
        {
          id: "live-lookup",
          label: "Live ENS lookup",
          status: "blocking",
          detail: message
        }
      ],
      degradedReasons: [],
      blockingReasons: ["live_lookup_failed"]
    };
  }
}

export async function getCenterIdentityBindingStatus(env: NodeJS.ProcessEnv = process.env): Promise<CenterIdentityBindingStatus> {
  const api = await loadEnsIdentityApi();
  if (api?.getEnsBindingPreparationStatus === undefined) {
    return unavailableIdentityBindingStatus("ens_binding_api_unavailable", "packages/ens-identity does not expose getEnsBindingPreparationStatus.");
  }

  try {
    return normalizeIdentityBindingStatus(await api.getEnsBindingPreparationStatus(env));
  } catch (error) {
    return unavailableIdentityBindingStatus("ens_binding_prepare_failed", error instanceof Error ? error.message : String(error));
  }
}

export async function sendCenterIdentityBindingRecords(env: NodeJS.ProcessEnv = process.env): Promise<CenterIdentityBindingStatus> {
  const api = await loadEnsIdentityApi();
  if (api?.sendEnsBindingRecords === undefined) {
    return unavailableIdentityBindingStatus("ens_binding_send_api_unavailable", "packages/ens-identity does not expose sendEnsBindingRecords.");
  }

  try {
    return normalizeIdentityBindingStatus(await api.sendEnsBindingRecords(env));
  } catch (error) {
    return unavailableIdentityBindingStatus("ens_binding_send_failed", error instanceof Error ? error.message : String(error));
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

function normalizeLiveIdentityStatus(status: CenterIdentityStatus): CenterIdentityStatus {
  return {
    ...status,
    liveProvider: true,
    providerMode: "live",
    ok: status.ok === true && status.blockingReasons.length === 0
  };
}

function normalizeIdentityBindingStatus(status: CenterIdentityBindingStatus): CenterIdentityBindingStatus {
  return {
    ...status,
    ok: status.ok === true && status.blockingReasons.length === 0,
    checks: status.checks.map((check) => ({ ...check })),
    degradedReasons: [...status.degradedReasons],
    blockingReasons: [...status.blockingReasons],
    records: status.records === undefined ? undefined : { ...status.records },
    tx:
      status.tx === undefined
        ? undefined
        : {
            ...status.tx,
            records: status.tx.records.map((record) => ({ ...record }))
          }
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

function unavailableIdentityBindingStatus(code: string, detail: string): CenterIdentityBindingStatus {
  return {
    ok: false,
    summary: "ENS text-record multicall preparation is blocked.",
    checks: [
      {
        id: "binding-api",
        label: "ENS binding API",
        status: "blocking",
        detail
      }
    ],
    degradedReasons: [],
    blockingReasons: [code]
  };
}
