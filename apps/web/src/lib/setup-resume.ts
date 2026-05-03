export type SetupResumeStatus = "not-started" | "in-progress" | "complete";

export type DashboardResumeSnapshot = {
  schemaVersion: 1;
  setupStatus: SetupResumeStatus;
  activeSetupStep: number;
  updatedAt: string;
};

export type SetupWizardResumeSnapshot = {
  schemaVersion: 1;
  updatedAt: string;
  parentWallet?: string;
  agentName: string;
  nameCheck?: unknown;
  accountStep?: unknown;
  accountFunding?: unknown;
  ensStep?: unknown;
  zeroGStep?: unknown;
  recordsStep?: unknown;
  keeperHubStep?: unknown;
};

const dashboardResumeKey = "clearintent.dashboard.resume.v1";
const setupWizardResumeKey = "clearintent.setup-wizard.resume.v1";

export function loadDashboardResume(): DashboardResumeSnapshot | undefined {
  return loadSnapshot(dashboardResumeKey, isDashboardResumeSnapshot);
}

export function saveDashboardResume(snapshot: Omit<DashboardResumeSnapshot, "schemaVersion" | "updatedAt">): void {
  saveSnapshot(dashboardResumeKey, {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    ...snapshot
  });
}

export function loadSetupWizardResume(): SetupWizardResumeSnapshot | undefined {
  return loadSnapshot(setupWizardResumeKey, isSetupWizardResumeSnapshot);
}

export function saveSetupWizardResume(snapshot: Omit<SetupWizardResumeSnapshot, "schemaVersion" | "updatedAt">): void {
  saveSnapshot(setupWizardResumeKey, {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    ...snapshot
  });
}

export function resumeMatchesWallet(resume: SetupWizardResumeSnapshot, parentWallet: string | undefined): boolean {
  if (resume.parentWallet === undefined || parentWallet === undefined) return false;
  return resume.parentWallet.toLowerCase() === parentWallet.toLowerCase();
}

export function clearSetupResume(): void {
  storage()?.removeItem(dashboardResumeKey);
  storage()?.removeItem(setupWizardResumeKey);
}

function loadSnapshot<T>(key: string, guard: (value: unknown) => value is T): T | undefined {
  const raw = storage()?.getItem(key);
  if (raw === undefined || raw === null) return undefined;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return guard(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function saveSnapshot(key: string, snapshot: unknown): void {
  try {
    storage()?.setItem(key, JSON.stringify(snapshot));
  } catch {
    // Browser storage is a resume aid only; authority evidence still lives in signed/provider artifacts.
  }
}

function storage(): Storage | undefined {
  return typeof window === "undefined" ? undefined : window.localStorage;
}

function isDashboardResumeSnapshot(value: unknown): value is DashboardResumeSnapshot {
  if (!isRecord(value) || value.schemaVersion !== 1) return false;
  return isSetupStatus(value.setupStatus) && typeof value.activeSetupStep === "number" && typeof value.updatedAt === "string";
}

function isSetupWizardResumeSnapshot(value: unknown): value is SetupWizardResumeSnapshot {
  return (
    isRecord(value) &&
    value.schemaVersion === 1 &&
    typeof value.updatedAt === "string" &&
    typeof value.agentName === "string"
  );
}

function isSetupStatus(value: unknown): value is SetupResumeStatus {
  return value === "not-started" || value === "in-progress" || value === "complete";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
