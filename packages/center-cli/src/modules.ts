import { getCenterMemoryStatus, type CenterMemoryStatus } from "./memory-status";

export type CenterModuleStatus = "ready" | "deferred";

export type CenterModule = {
  id: string;
  label: string;
  status: CenterModuleStatus;
  scope: "core" | "local-adapter" | "future-adapter" | "future-surface";
  reason: string;
};

export type ModuleDoctorResult = {
  ok: boolean;
  modules: CenterModule[];
  memory: CenterMemoryStatus;
  issues: {
    code: string;
    message: string;
    moduleId: string;
  }[];
};

const modules: CenterModule[] = [
  {
    id: "core",
    label: "Core authority kernel",
    status: "ready",
    scope: "core",
    reason: "Consumes packages/core public primitives."
  },
  {
    id: "ens",
    label: "ENS identity",
    status: "ready",
    scope: "local-adapter",
    reason: "Phase 3A local ENS identity fixture is ready at ens-local-fixture claim level; live ENS remains deferred to Phase 3B."
  },
  {
    id: "zerog",
    label: "0G policy memory and audit",
    status: "ready",
    scope: "local-adapter",
    reason: "Local memory and audit adapter is ready at local-adapter claim level; live 0G Storage remains deferred to Phase 2B."
  },
  {
    id: "keeperhub",
    label: "KeeperHub execution",
    status: "ready",
    scope: "local-adapter",
    reason: "Phase 4A local KeeperHub execution fixture is ready at keeperhub-local-fixture claim level; live KeeperHub/onchain execution remains deferred to Phase 4B."
  },
  {
    id: "signer",
    label: "Wallet and hardware signer",
    status: "deferred",
    scope: "future-adapter",
    reason: "Live signer behavior and clear-signing claims are not implemented here."
  },
  {
    id: "notifications",
    label: "Notifications",
    status: "deferred",
    scope: "future-surface",
    reason: "Webhook and OS notification delivery are deferred surfaces."
  }
];

export function listCenterModules(): CenterModule[] {
  return modules.map((module) => ({ ...module }));
}

export async function runModuleDoctor(): Promise<ModuleDoctorResult> {
  return buildModuleDoctorResult(await getCenterMemoryStatus());
}

export function buildModuleDoctorResult(memory: CenterMemoryStatus): ModuleDoctorResult {
  const checked = listCenterModules();
  const moduleIssues = checked
    .filter((module) => module.status === "deferred")
    .map((module) => ({
      code: "module_deferred",
      message: module.reason,
      moduleId: module.id
    }));
  const memoryIssues = memory.degradedReasons.map((reason) => ({
    code: "memory_degraded",
    message: reason,
    moduleId: "zerog"
  }));

  return {
    ok: memory.ok,
    modules: checked,
    memory,
    issues: [...moduleIssues, ...memoryIssues]
  };
}
