export type CenterExecutionStatus = {
  ok: boolean;
  claimLevel: "keeperhub-local-fixture";
  providerMode: "local";
  localFixtureAvailable: boolean;
  liveProvider: false;
  liveProviderDisabled: true;
  liveExecutionProven: false;
  authorityApprovalProvidedByKeeperHub: false;
  summary: string;
  checks: {
    id: string;
    label: string;
    status: "pass" | "degraded";
    detail: string;
  }[];
  degradedReasons: string[];
};

type KeeperHubAdapterApi = {
  getCenterExecutionStatus?: () => CenterExecutionStatus | Promise<CenterExecutionStatus>;
};

export async function getCenterExecutionStatus(): Promise<CenterExecutionStatus> {
  try {
    const loaded = await importKeeperHubAdapter();
    const status = await loaded.getCenterExecutionStatus?.();
    if (isCenterExecutionStatus(status)) {
      return normalizeExecutionStatus(status);
    }
    return buildUnavailableExecutionStatus("keeperhub_status_api_missing");
  } catch {
    return buildUnavailableExecutionStatus("keeperhub_adapter_unavailable");
  }
}

function normalizeExecutionStatus(status: CenterExecutionStatus): CenterExecutionStatus {
  return {
    ...status,
    claimLevel: "keeperhub-local-fixture",
    providerMode: "local",
    liveProvider: false,
    liveProviderDisabled: true,
    liveExecutionProven: false,
    authorityApprovalProvidedByKeeperHub: false,
    ok: status.localFixtureAvailable
  };
}

function buildUnavailableExecutionStatus(reasonCode: string): CenterExecutionStatus {
  return {
    ok: false,
    claimLevel: "keeperhub-local-fixture",
    providerMode: "local",
    localFixtureAvailable: false,
    liveProvider: false,
    liveProviderDisabled: true,
    liveExecutionProven: false,
    authorityApprovalProvidedByKeeperHub: false,
    summary: "KeeperHub local execution status is blocked because the local adapter API is not available. No live claim is made.",
    checks: [
      {
        id: "local-fixture",
        label: "Local fixture",
        status: "degraded",
        detail: "Local KeeperHub adapter status could not be loaded."
      },
      {
        id: "live-provider",
        label: "Live provider",
        status: "degraded",
        detail: "Live KeeperHub provider is disabled for Phase 4A."
      }
    ],
    degradedReasons: [reasonCode, "live_provider_unavailable"]
  };
}

async function importKeeperHubAdapter(): Promise<KeeperHubAdapterApi> {
  const modulePath = "../../keeperhub-adapter/src/index.ts";
  return (await import(modulePath)) as KeeperHubAdapterApi;
}

function isCenterExecutionStatus(value: unknown): value is CenterExecutionStatus {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<CenterExecutionStatus>;
  return (
    typeof candidate.ok === "boolean" &&
    candidate.claimLevel === "keeperhub-local-fixture" &&
    candidate.providerMode === "local" &&
    typeof candidate.localFixtureAvailable === "boolean" &&
    candidate.liveProvider === false &&
    candidate.liveProviderDisabled === true &&
    candidate.liveExecutionProven === false &&
    candidate.authorityApprovalProvidedByKeeperHub === false &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.checks) &&
    Array.isArray(candidate.degradedReasons)
  );
}
