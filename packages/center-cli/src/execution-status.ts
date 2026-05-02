export type CenterExecutionStatus = {
  ok: boolean;
  claimLevel: "keeperhub-local-fixture" | "keeperhub-live-readiness" | "keeperhub-live-submitted" | "keeperhub-live-executed";
  providerMode: "local" | "live";
  localFixtureAvailable: boolean;
  liveProvider: boolean;
  liveProviderDisabled: boolean;
  liveExecutionProven: boolean;
  authorityApprovalProvidedByKeeperHub: false;
  workflowId?: string;
  executionMode?: "workflow" | "direct";
  executorAddress?: string;
  clearIntentEnsName?: string;
  summary: string;
  checks: {
    id: string;
    label: string;
    status: "pass" | "degraded" | "blocking";
    detail: string;
  }[];
  blockingReasons?: string[];
  degradedReasons: string[];
  submission?: {
    executionId?: string;
    runId?: string;
    status?: string;
    transactionHash?: string;
  };
  receipt?: unknown;
};

type KeeperHubAdapterApi = {
  getCenterExecutionStatus?: () => CenterExecutionStatus | Promise<CenterExecutionStatus>;
  getKeeperHubLiveStatus?: () => CenterExecutionStatus | Promise<CenterExecutionStatus>;
  submitKeeperHubLiveWorkflow?: () => CenterExecutionStatus | Promise<CenterExecutionStatus>;
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
  if (status.providerMode === "live") {
    return {
      ...status,
      localFixtureAvailable: false,
      liveProviderDisabled: !status.liveProvider,
      authorityApprovalProvidedByKeeperHub: false
    };
  }
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

export async function getCenterKeeperHubLiveStatus(): Promise<CenterExecutionStatus> {
  try {
    const loaded = await importKeeperHubAdapter();
    const status = await loaded.getKeeperHubLiveStatus?.();
    if (isCenterExecutionStatus(status)) {
      return normalizeExecutionStatus(status);
    }
    return buildUnavailableLiveStatus("keeperhub_live_status_api_missing");
  } catch {
    return buildUnavailableLiveStatus("keeperhub_adapter_unavailable");
  }
}

export async function submitCenterKeeperHubLiveWorkflow(): Promise<CenterExecutionStatus> {
  try {
    const loaded = await importKeeperHubAdapter();
    const status = await loaded.submitKeeperHubLiveWorkflow?.();
    if (isCenterExecutionStatus(status)) {
      return normalizeExecutionStatus(status);
    }
    return buildUnavailableLiveStatus("keeperhub_live_submit_api_missing");
  } catch {
    return buildUnavailableLiveStatus("keeperhub_adapter_unavailable");
  }
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

function buildUnavailableLiveStatus(reasonCode: string): CenterExecutionStatus {
  return {
    ok: false,
    claimLevel: "keeperhub-live-readiness",
    providerMode: "live",
    localFixtureAvailable: false,
    liveProvider: false,
    liveProviderDisabled: true,
    liveExecutionProven: false,
    authorityApprovalProvidedByKeeperHub: false,
    summary: "KeeperHub live status is blocked because the live adapter API is not available. No live execution claim is made.",
    checks: [
      {
        id: "live-provider",
        label: "Live provider",
        status: "blocking",
        detail: "Live KeeperHub adapter status could not be loaded."
      }
    ],
    blockingReasons: [reasonCode],
    degradedReasons: []
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
    typeof candidate.claimLevel === "string" &&
    (candidate.providerMode === "local" || candidate.providerMode === "live") &&
    typeof candidate.localFixtureAvailable === "boolean" &&
    typeof candidate.liveProvider === "boolean" &&
    typeof candidate.liveProviderDisabled === "boolean" &&
    typeof candidate.liveExecutionProven === "boolean" &&
    candidate.authorityApprovalProvidedByKeeperHub === false &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.checks) &&
    Array.isArray(candidate.degradedReasons)
  );
}
