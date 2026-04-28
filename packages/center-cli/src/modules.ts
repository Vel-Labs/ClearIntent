export type CenterModuleStatus = "ready" | "deferred";

export type CenterModule = {
  id: string;
  label: string;
  status: CenterModuleStatus;
  scope: "core" | "future-adapter" | "future-surface";
  reason: string;
};

export type ModuleDoctorResult = {
  ok: boolean;
  modules: CenterModule[];
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
    status: "deferred",
    scope: "future-adapter",
    reason: "Provider adapter work starts after the Center CLI skeleton."
  },
  {
    id: "zerog",
    label: "0G policy memory and audit",
    status: "deferred",
    scope: "future-adapter",
    reason: "Storage and compute integration remain out of Phase 1.5 scope."
  },
  {
    id: "keeperhub",
    label: "KeeperHub execution",
    status: "deferred",
    scope: "future-adapter",
    reason: "Execution adapter behavior is deferred until after Center CLI."
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

export function runModuleDoctor(): ModuleDoctorResult {
  const checked = listCenterModules();
  const issues = checked
    .filter((module) => module.status === "deferred")
    .map((module) => ({
      code: "module_deferred",
      message: module.reason,
      moduleId: module.id
    }));

  return {
    ok: true,
    modules: checked,
    issues
  };
}
