export type MemoryCheckStatus = "pass" | "fail" | "degraded" | "local-only";

export type CenterMemoryCheck = {
  id: "write" | "read" | "hash" | "audit-bundle" | "proof";
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

type ZerogMemoryModule = {
  getCenterMemoryStatus?: () => CenterMemoryStatus | Promise<CenterMemoryStatus>;
  getLocalMemoryStatus?: () => CenterMemoryStatus | Promise<CenterMemoryStatus>;
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
    liveProvider: false,
    localOnly: status.providerMode === "local" ? true : status.localOnly,
    summary: status.summary,
    checks: status.checks.map((check) => ({ ...check })),
    degradedReasons: [...status.degradedReasons]
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
    candidate.providerMode === "local" &&
    typeof candidate.claimLevel === "string" &&
    candidate.liveProvider === false &&
    typeof candidate.localOnly === "boolean" &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.checks) &&
    Array.isArray(candidate.degradedReasons)
  );
}
