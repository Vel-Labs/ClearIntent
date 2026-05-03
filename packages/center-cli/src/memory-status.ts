export type MemoryCheckStatus = "pass" | "fail" | "degraded" | "local-only";

export type CenterMemoryCheck = {
  id: "config" | "sdk" | "wallet" | "funds" | "write" | "read" | "hash" | "audit-bundle" | "proof";
  label: string;
  status: MemoryCheckStatus;
  detail: string;
};

export type CenterMemoryStatus = {
  ok: boolean;
  providerMode: "local" | "live";
  claimLevel: "local-fixture" | "local-adapter" | "0g-write-only" | "0g-write-read" | "0g-write-read-verified";
  liveProvider: boolean;
  localOnly: boolean;
  summary: string;
  checks: CenterMemoryCheck[];
  degradedReasons: string[];
};

export type CenterMemoryBindingsStatus = {
  ok: boolean;
  providerMode: "live";
  claimLevel: "local-adapter" | "0g-write-submitted" | "0g-write-read" | "0g-write-read-verified";
  liveProvider: true;
  summary: string;
  ensName?: string;
  controllerAddress?: string;
  records?: {
    agentCard: string;
    policyUri: string;
    policyHash: string;
    auditLatest: string;
    clearintentVersion: string;
  };
  artifacts: {
    name: string;
    uri: string;
    hash: string;
    rootHash: string;
    txHash: string;
  }[];
  checks: {
    id: string;
    label: string;
    status: "pass" | "fail" | "degraded";
    detail: string;
  }[];
  blockingReasons: string[];
  degradedReasons: string[];
};

type ZerogMemoryModule = {
  getCenterMemoryStatus?: () => CenterMemoryStatus | Promise<CenterMemoryStatus>;
  getLocalMemoryStatus?: () => CenterMemoryStatus | Promise<CenterMemoryStatus>;
  getZeroGLiveReadinessStatus?: () => CenterMemoryStatus | Promise<CenterMemoryStatus>;
  getZeroGLiveSmokeStatus?: () => CenterMemoryStatus | Promise<CenterMemoryStatus>;
  getZeroGLiveBindingsStatus?: () => CenterMemoryBindingsStatus | Promise<CenterMemoryBindingsStatus>;
  runLocalMemoryDoctor?: () => CenterMemoryStatus | Promise<CenterMemoryStatus>;
};

export async function getCenterMemoryStatus(): Promise<CenterMemoryStatus> {
  try {
    const loaded = await importZerogMemoryModule();
    const status =
      (await loaded.getCenterMemoryStatus?.()) ??
      (await loaded.getLocalMemoryStatus?.()) ??
      (await loaded.runLocalMemoryDoctor?.());

    if (isCenterMemoryStatus(status)) {
      return normalizeMemoryStatus(status);
    }

    return buildUnavailableMemoryStatus("zerog_memory_status_api_missing");
  } catch {
    return buildUnavailableMemoryStatus("zerog_memory_package_unavailable");
  }
}

export async function getZeroGLiveReadinessStatus(): Promise<CenterMemoryStatus> {
  try {
    const loaded = await importZerogMemoryModule();
    const status = await loaded.getZeroGLiveReadinessStatus?.();

    if (isCenterMemoryStatus(status)) {
      return normalizeMemoryStatus(status);
    }

    return buildUnavailableLiveStatus("zerog_live_status_api_missing");
  } catch {
    return buildUnavailableLiveStatus("zerog_memory_package_unavailable");
  }
}

export async function getZeroGLiveSmokeStatus(): Promise<CenterMemoryStatus> {
  try {
    const loaded = await importZerogMemoryModule();
    const status = await loaded.getZeroGLiveSmokeStatus?.();

    if (isCenterMemoryStatus(status)) {
      return normalizeMemoryStatus(status);
    }

    return buildUnavailableLiveStatus("zerog_live_status_api_missing");
  } catch {
    return buildUnavailableLiveStatus("zerog_memory_package_unavailable");
  }
}

export async function getZeroGLiveBindingsStatus(): Promise<CenterMemoryBindingsStatus> {
  try {
    const loaded = await importZerogMemoryModule();
    const status = await loaded.getZeroGLiveBindingsStatus?.();

    if (isCenterMemoryBindingsStatus(status)) {
      return normalizeMemoryBindingsStatus(status);
    }

    return buildUnavailableBindingsStatus("zerog_live_bindings_api_missing");
  } catch {
    return buildUnavailableBindingsStatus("zerog_memory_package_unavailable");
  }
}

export function buildUnavailableMemoryStatus(reasonCode: string): CenterMemoryStatus {
  const detail = "Local memory adapter package is not available in this checkout yet.";
  return {
    ok: false,
    providerMode: "local",
    claimLevel: "local-adapter",
    liveProvider: false,
    localOnly: true,
    summary: "0G policy memory is wired as a local-only Center CLI integration point, but the local adapter is degraded.",
    checks: [
      { id: "write", label: "Write check", status: "degraded", detail },
      { id: "read", label: "Read check", status: "degraded", detail },
      { id: "hash", label: "Hash validation", status: "degraded", detail },
      { id: "audit-bundle", label: "Audit bundle", status: "degraded", detail }
    ],
    degradedReasons: [reasonCode, "live_provider_disabled"]
  };
}

export function normalizeMemoryStatus(status: CenterMemoryStatus): CenterMemoryStatus {
  return {
    ok: status.ok,
    providerMode: status.providerMode,
    claimLevel: status.claimLevel,
    liveProvider: status.liveProvider,
    localOnly: status.providerMode === "local" ? true : status.localOnly,
    summary: status.summary,
    checks: status.checks.map((check) => ({ ...check })),
    degradedReasons: [...status.degradedReasons]
  };
}

function buildUnavailableLiveStatus(reasonCode: string): CenterMemoryStatus {
  return {
    ok: false,
    providerMode: "live",
    claimLevel: "local-adapter",
    liveProvider: true,
    localOnly: false,
    summary: "0G live readiness could not be checked.",
    checks: [
      { id: "sdk", label: "0G SDK", status: "fail", detail: "0G live readiness API is unavailable." },
      { id: "wallet", label: "Wallet credentials", status: "fail", detail: "Live credentials were not checked." },
      { id: "funds", label: "Testnet funds", status: "degraded", detail: "Token balance was not checked." }
    ],
    degradedReasons: [reasonCode, "live_write_unverified"]
  };
}

function buildUnavailableBindingsStatus(reasonCode: string): CenterMemoryBindingsStatus {
  return {
    ok: false,
    providerMode: "live",
    claimLevel: "local-adapter",
    liveProvider: true,
    summary: "0G ENS binding artifact upload could not be checked.",
    artifacts: [],
    checks: [
      { id: "policy", label: "Policy artifact", status: "fail", detail: "0G live bindings API is unavailable." },
      { id: "audit", label: "Audit pointer artifact", status: "degraded", detail: "No audit artifact was uploaded." },
      { id: "agent-card", label: "Agent card artifact", status: "degraded", detail: "No agent-card artifact was uploaded." }
    ],
    blockingReasons: [reasonCode],
    degradedReasons: [reasonCode]
  };
}

async function importZerogMemoryModule(): Promise<ZerogMemoryModule> {
  const modulePath = "../../zerog-memory/src/index.ts";
  return (await import(modulePath)) as ZerogMemoryModule;
}

function isCenterMemoryStatus(value: unknown): value is CenterMemoryStatus {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<CenterMemoryStatus>;
  return (
    typeof candidate.ok === "boolean" &&
    (candidate.providerMode === "local" || candidate.providerMode === "live") &&
    typeof candidate.claimLevel === "string" &&
    typeof candidate.liveProvider === "boolean" &&
    typeof candidate.localOnly === "boolean" &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.checks) &&
    Array.isArray(candidate.degradedReasons)
  );
}

function isCenterMemoryBindingsStatus(value: unknown): value is CenterMemoryBindingsStatus {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<CenterMemoryBindingsStatus>;
  return (
    typeof candidate.ok === "boolean" &&
    candidate.providerMode === "live" &&
    typeof candidate.claimLevel === "string" &&
    candidate.liveProvider === true &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.artifacts) &&
    Array.isArray(candidate.checks) &&
    Array.isArray(candidate.blockingReasons) &&
    Array.isArray(candidate.degradedReasons)
  );
}

function normalizeMemoryBindingsStatus(status: CenterMemoryBindingsStatus): CenterMemoryBindingsStatus {
  return {
    ok: status.ok,
    providerMode: status.providerMode,
    claimLevel: status.claimLevel,
    liveProvider: status.liveProvider,
    summary: status.summary,
    ensName: status.ensName,
    controllerAddress: status.controllerAddress,
    records: status.records === undefined ? undefined : { ...status.records },
    artifacts: status.artifacts.map((artifact) => ({ ...artifact })),
    checks: status.checks.map((check) => ({ ...check })),
    blockingReasons: [...status.blockingReasons],
    degradedReasons: [...status.degradedReasons]
  };
}
