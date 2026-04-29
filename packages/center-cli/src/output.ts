import { stableStringify, type ResultIssue } from "../../core/src";
import type { CenterExecutionStatus } from "./execution-status";
import type { CenterIdentityStatus } from "./identity-status";
import type { CenterModule, ModuleDoctorResult } from "./modules";
import type { CenterMemoryStatus, MemoryCheckStatus } from "./memory-status";
import type { CenterSignerStatus } from "./signer-status";

export type CliCommandResult = {
  command: string;
  ok: boolean;
  commandOk?: boolean;
  authorityOk?: boolean;
  fixture?: string;
  mode?: "fixture-only" | "local-memory" | "live-readiness" | "ens-local-fixture" | "keeperhub-local-fixture" | "signer-local-fixture";
  fixtureSource?: string;
  liveProvider?: boolean;
  summary: string;
  data: Record<string, unknown>;
  issues: ResultIssue[];
};

export function renderJson(result: CliCommandResult): string {
  return stableStringify(withExplicitOkFields(result));
}

export function renderHuman(result: CliCommandResult): string {
  const explicit = withExplicitOkFields(result);
  const lines = [
    `ClearIntent ${explicit.command}`,
    `Command: ${explicit.commandOk ? "ok" : "error"}`,
    `Authority: ${explicit.authorityOk ? "ok" : "blocked"}`,
    ...(explicit.mode === undefined ? [] : [`Mode: ${explicit.mode}`]),
    ...(explicit.fixtureSource === undefined ? [] : [`Fixture source: ${explicit.fixtureSource}`]),
    ...(explicit.liveProvider === undefined ? [] : [`Live provider: ${explicit.liveProvider ? "enabled" : "disabled"}`]),
    ...(explicit.fixture === undefined ? [] : [`Fixture: ${explicit.fixture}`]),
    `Summary: ${explicit.summary}`
  ];

  if (isSnapshotData(explicit.data)) {
    lines.push(`Intent: ${explicit.data.snapshot.intentId}`);
    lines.push(`Lifecycle: ${explicit.data.snapshot.currentState}`);
    lines.push(`Execution blocked: ${String(explicit.data.snapshot.executionBlocked)}`);
    lines.push(`Next action: ${explicit.data.snapshot.nextAction?.code ?? "none"}`);
    lines.push(`Missing evidence: ${formatList(explicit.data.snapshot.missingEvidence)}`);
    lines.push(`Degraded signals: ${formatList(explicit.data.snapshot.degradedSignals)}`);
  }

  if (isModuleData(explicit.data)) {
    for (const module of explicit.data.modules) {
      lines.push(`- ${module.id}: ${module.status} (${module.scope})`);
    }
  }

  if (isDoctorData(explicit.data)) {
    for (const module of explicit.data.doctor.modules) {
      lines.push(`- ${module.id}: ${module.status} - ${module.reason}`);
    }
    lines.push(...renderMemoryStatus(explicit.data.doctor.memory));
  }

  if (isMemoryData(explicit.data)) {
    lines.push(...renderMemoryStatus(explicit.data.memory));
  }

  if (isIdentityData(explicit.data)) {
    lines.push(...renderIdentityStatus(explicit.data.identity));
  }

  if (isExecutionData(explicit.data)) {
    lines.push(...renderExecutionStatus(explicit.data.execution));
  }

  if (isSignerData(explicit.data)) {
    lines.push(...renderSignerStatus(explicit.data.signer));
  }

  if (explicit.issues.length > 0) {
    lines.push("Issues:");
    for (const issue of explicit.issues) {
      lines.push(`- ${issue.code}${issue.path === undefined ? "" : ` [${issue.path}]`}: ${issue.message}`);
    }
  }

  return lines.join("\n");
}

function withExplicitOkFields(result: CliCommandResult): CliCommandResult & { commandOk: boolean; authorityOk: boolean } {
  const commandOk = result.commandOk ?? result.command !== "unknown";
  const authorityOk = result.authorityOk ?? result.ok;
  return {
    ...result,
    commandOk,
    authorityOk
  };
}

function formatList(values: readonly string[] | undefined): string {
  if (values === undefined || values.length === 0) {
    return "none";
  }
  return values.join(", ");
}

function isSnapshotData(data: Record<string, unknown>): data is {
  snapshot: {
    intentId: string;
    currentState: string;
    executionBlocked: boolean;
    nextAction?: { code: string };
    missingEvidence: string[];
    degradedSignals: string[];
  };
} {
  return typeof data.snapshot === "object" && data.snapshot !== null;
}

function isModuleData(data: Record<string, unknown>): data is { modules: CenterModule[] } {
  return Array.isArray(data.modules);
}

function isDoctorData(data: Record<string, unknown>): data is { doctor: ModuleDoctorResult } {
  return typeof data.doctor === "object" && data.doctor !== null;
}

function isMemoryData(data: Record<string, unknown>): data is { memory: CenterMemoryStatus } {
  return typeof data.memory === "object" && data.memory !== null;
}

function isIdentityData(data: Record<string, unknown>): data is { identity: CenterIdentityStatus } {
  return typeof data.identity === "object" && data.identity !== null;
}

function isExecutionData(data: Record<string, unknown>): data is { execution: CenterExecutionStatus } {
  return typeof data.execution === "object" && data.execution !== null;
}

function isSignerData(data: Record<string, unknown>): data is { signer: CenterSignerStatus } {
  return typeof data.signer === "object" && data.signer !== null;
}

function renderMemoryStatus(memory: CenterMemoryStatus): string[] {
  return [
    `Memory provider mode: ${memory.providerMode}`,
    `Memory claim level: ${memory.claimLevel}`,
    `Memory live provider: ${memory.liveProvider ? "enabled" : "disabled"}`,
    `Memory local marker: ${memory.localOnly ? "[LOCAL-ONLY] local-only" : "[PASS] live-capable"}`,
    `Memory status: ${memory.ok ? "[PASS] ok" : "[DEGRADED] degraded"}`,
    `Memory summary: ${memory.summary}`,
    ...memory.checks.map((check) => `- ${check.label}: ${formatCheckStatus(check.status)} - ${check.detail}`),
    `Memory degraded reasons: ${formatList(memory.degradedReasons)}`
  ];
}

function formatCheckStatus(status: MemoryCheckStatus): string {
  if (status === "pass") {
    return "[PASS] pass";
  }
  if (status === "fail") {
    return "[FAIL] fail";
  }
  if (status === "local-only") {
    return "[LOCAL-ONLY] local-only";
  }
  return "[DEGRADED] degraded";
}

function renderIdentityStatus(identity: CenterIdentityStatus): string[] {
  return [
    `Identity claim level: ${identity.claimLevel}`,
    `Identity live provider: ${identity.liveProvider ? "enabled" : "disabled"}`,
    `Identity status: ${identity.ok ? "[PASS] ok" : "[BLOCKED] blocked"}`,
    "Identity authority approval: no",
    "Live ENS claim: no",
    "Live 0G claim: no",
    `Identity summary: ${identity.summary}`,
    ...identity.checks.map((check) => `- ${check.label}: ${formatIdentityCheckStatus(check.status)} - ${check.detail}`),
    `Identity blocking reasons: ${formatList(identity.blockingReasons)}`,
    `Identity degraded reasons: ${formatList(identity.degradedReasons)}`
  ];
}

function formatIdentityCheckStatus(status: CenterIdentityStatus["checks"][number]["status"]): string {
  if (status === "pass") {
    return "[PASS] pass";
  }
  if (status === "blocking") {
    return "[BLOCKED] blocking";
  }
  return "[DEGRADED] degraded";
}

function renderExecutionStatus(execution: CenterExecutionStatus): string[] {
  return [
    `Execution claim level: ${execution.claimLevel}`,
    `Execution local fixture: ${execution.localFixtureAvailable ? "available" : "unavailable"}`,
    `Execution live provider: ${execution.liveProvider ? "enabled" : "disabled"}`,
    `Execution live proof: ${execution.liveExecutionProven ? "yes" : "no"}`,
    `KeeperHub authority approval: ${execution.authorityApprovalProvidedByKeeperHub ? "yes" : "no"}`,
    `Execution summary: ${execution.summary}`,
    ...execution.checks.map((check) => `- ${check.label}: ${formatExecutionCheckStatus(check.status)} - ${check.detail}`),
    `Execution degraded reasons: ${formatList(execution.degradedReasons)}`
  ];
}

function formatExecutionCheckStatus(status: CenterExecutionStatus["checks"][number]["status"]): string {
  if (status === "pass") {
    return "[PASS] pass";
  }
  return "[DEGRADED] degraded";
}

function renderSignerStatus(signer: CenterSignerStatus): string[] {
  return [
    `Signer route: ${signer.route}`,
    `Signer claim levels: ${formatList(signer.claimLevels)}`,
    `Signer live provider: ${signer.liveProvider ? "enabled" : "disabled"}`,
    `Signer fixture only: ${signer.fixtureOnly ? "yes" : "no"}`,
    `Software wallet validation: ${signer.softwareWalletValidationStatus}`,
    `Wallet-rendered preview proven: ${signer.walletRenderedPreviewProven ? "yes" : "no"}`,
    `Secure-device display proven: ${signer.secureDeviceDisplayProven ? "yes" : "no"}`,
    `Vendor-approved Clear Signing: ${signer.vendorApprovedClearSigning ? "yes" : "no"}`,
    `Signer summary: ${signer.summary}`,
    ...signer.checks.map((check) => `- ${check.label}: ${formatSignerCheckStatus(check.status)} - ${check.detail}`),
    `Signer degraded reasons: ${formatList(signer.degradedReasons)}`
  ];
}

function formatSignerCheckStatus(status: CenterSignerStatus["checks"][number]["status"]): string {
  if (status === "pass") {
    return "[PASS] pass";
  }
  if (status === "blocking") {
    return "[BLOCKED] blocking";
  }
  if (status === "planned") {
    return "[PLANNED] planned";
  }
  return "[DEGRADED] degraded";
}
