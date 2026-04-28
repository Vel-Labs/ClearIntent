import { stableStringify, type ResultIssue } from "../../core/src";
import type { CenterModule, ModuleDoctorResult } from "./modules";
import type { CenterMemoryStatus, MemoryCheckStatus } from "./memory-status";

export type CliCommandResult = {
  command: string;
  ok: boolean;
  commandOk?: boolean;
  authorityOk?: boolean;
  fixture?: string;
  mode?: "fixture-only" | "local-memory";
  fixtureSource?: string;
  liveProvider?: false;
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
