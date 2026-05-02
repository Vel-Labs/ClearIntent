import { stableStringify, type ResultIssue } from "../../core/src";
import type { CredentialSafetyStatus, CredentialCheckStatus } from "./credential-safety";
import type { CenterExecutionStatus } from "./execution-status";
import type { CenterIdentityBindingStatus, CenterIdentityStatus } from "./identity-status";
import type { CenterLocalTestSummary } from "./local-test";
import type { CenterModule, ModuleDoctorResult } from "./modules";
import type { CenterMemoryBindingsStatus, CenterMemoryStatus, MemoryCheckStatus } from "./memory-status";
import type { CenterSignerStatus } from "./signer-status";

export type CliCommandResult = {
  command: string;
  ok: boolean;
  commandOk?: boolean;
  authorityOk?: boolean;
  fixture?: string;
  mode?:
    | "fixture-only"
    | "local-memory"
    | "live-readiness"
    | "ens-local-fixture"
    | "ens-live-read"
    | "keeperhub-local-fixture"
    | "signer-local-fixture";
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

  if (isMemoryBindingsData(explicit.data)) {
    lines.push(...renderMemoryBindingsStatus(explicit.data.bindings));
  }

  if (isIdentityData(explicit.data)) {
    lines.push(...renderIdentityStatus(explicit.data.identity));
  }

  if (isIdentityBindingData(explicit.data)) {
    lines.push(...renderIdentityBindingStatus(explicit.data.binding));
  }

  if (isExecutionData(explicit.data)) {
    lines.push(...renderExecutionStatus(explicit.data.execution));
  }

  if (isSignerData(explicit.data)) {
    lines.push(...renderSignerStatus(explicit.data.signer));
  }

  if (isTestSummaryData(explicit.data)) {
    lines.push(...renderTestSummary(explicit.data.testSummary));
  }

  if (isCredentialSafetyData(explicit.data)) {
    lines.push(...renderCredentialSafety(explicit.data.credentials));
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

function isMemoryBindingsData(data: Record<string, unknown>): data is { bindings: CenterMemoryBindingsStatus } {
  return typeof data.bindings === "object" && data.bindings !== null;
}

function isIdentityData(data: Record<string, unknown>): data is { identity: CenterIdentityStatus } {
  return typeof data.identity === "object" && data.identity !== null;
}

function isIdentityBindingData(data: Record<string, unknown>): data is { binding: CenterIdentityBindingStatus } {
  return typeof data.binding === "object" && data.binding !== null;
}

function isExecutionData(data: Record<string, unknown>): data is { execution: CenterExecutionStatus } {
  return typeof data.execution === "object" && data.execution !== null;
}

function isSignerData(data: Record<string, unknown>): data is { signer: CenterSignerStatus } {
  return typeof data.signer === "object" && data.signer !== null;
}

function isTestSummaryData(data: Record<string, unknown>): data is { testSummary: CenterLocalTestSummary } {
  return typeof data.testSummary === "object" && data.testSummary !== null;
}

function isCredentialSafetyData(data: Record<string, unknown>): data is { credentials: CredentialSafetyStatus } {
  return typeof data.credentials === "object" && data.credentials !== null;
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

function renderMemoryBindingsStatus(bindings: CenterMemoryBindingsStatus): string[] {
  const lines = [
    `Binding provider mode: ${bindings.providerMode}`,
    `Binding claim level: ${bindings.claimLevel}`,
    `Binding live provider: ${bindings.liveProvider ? "enabled" : "disabled"}`,
    `Binding status: ${bindings.ok ? "[PASS] ok" : bindings.blockingReasons.length > 0 ? "[BLOCKED] blocked" : "[DEGRADED] degraded"}`,
    ...(bindings.ensName === undefined ? [] : [`Binding ENS name: ${bindings.ensName}`]),
    ...(bindings.controllerAddress === undefined ? [] : [`Binding controller address: ${bindings.controllerAddress}`]),
    `Binding summary: ${bindings.summary}`,
    ...bindings.checks.map((check) => `- ${check.label}: ${formatBindingCheckStatus(check.status)} - ${check.detail}`)
  ];

  if (bindings.records !== undefined) {
    lines.push("ENS records to set:");
    lines.push(`- agent.card = ${bindings.records.agentCard}`);
    lines.push(`- policy.uri = ${bindings.records.policyUri}`);
    lines.push(`- policy.hash = ${bindings.records.policyHash}`);
    lines.push(`- audit.latest = ${bindings.records.auditLatest}`);
    lines.push(`- clearintent.version = ${bindings.records.clearintentVersion}`);
  }

  if (bindings.artifacts.length > 0) {
    lines.push("0G artifacts:");
    for (const artifact of bindings.artifacts) {
      lines.push(`- ${artifact.name}: uri=${artifact.uri} txHash=${artifact.txHash}`);
    }
  }

  lines.push(`Binding blocking reasons: ${formatList(bindings.blockingReasons)}`);
  lines.push(`Binding degraded reasons: ${formatList(bindings.degradedReasons)}`);
  return lines;
}

function formatBindingCheckStatus(status: CenterMemoryBindingsStatus["checks"][number]["status"]): string {
  if (status === "pass") {
    return "[PASS] pass";
  }
  if (status === "fail") {
    return "[FAIL] fail";
  }
  return "[DEGRADED] degraded";
}

function renderIdentityStatus(identity: CenterIdentityStatus): string[] {
  return [
    `Identity claim level: ${identity.claimLevel}`,
    `Identity live provider: ${identity.liveProvider ? "enabled" : "disabled"}`,
    `Identity status: ${identity.ok ? "[PASS] ok" : "[BLOCKED] blocked"}`,
    "Identity authority approval: no",
    `Live ENS claim: ${identity.claimLevel === "ens-live-read" || identity.claimLevel === "ens-live-bound" ? "yes" : "no"}`,
    `Live 0G claim: ${identity.claimLevel === "ens-live-bound" ? "bound" : "no"}`,
    ...(identity.ensName === undefined ? [] : [`Identity ENS name: ${identity.ensName}`]),
    ...(identity.address === undefined ? [] : [`Identity address: ${identity.address}`]),
    `Identity summary: ${identity.summary}`,
    ...identity.checks.map((check) => `- ${check.label}: ${formatIdentityCheckStatus(check.status)} - ${check.detail}`),
    `Identity blocking reasons: ${formatList(identity.blockingReasons)}`,
    `Identity degraded reasons: ${formatList(identity.degradedReasons)}`
  ];
}

function renderIdentityBindingStatus(binding: CenterIdentityBindingStatus): string[] {
  const lines = [
    `ENS binding status: ${binding.ok ? "[PASS] prepared" : "[BLOCKED] blocked"}`,
    ...(binding.ensName === undefined ? [] : [`ENS binding name: ${binding.ensName}`]),
    ...(binding.resolverAddress === undefined ? [] : [`ENS resolver address: ${binding.resolverAddress}`]),
    `ENS binding summary: ${binding.summary}`,
    ...binding.checks.map((check) => `- ${check.label}: ${formatIdentityCheckStatus(check.status)} - ${check.detail}`)
  ];

  if (binding.tx !== undefined) {
    lines.push("Parent-wallet transaction:");
    lines.push(`- to = ${binding.tx.to}`);
    lines.push(`- value = ${binding.tx.value}`);
    lines.push(`- method = ${binding.tx.method}`);
    lines.push(`- data = ${binding.tx.data}`);
    lines.push("Records in multicall:");
    for (const record of binding.tx.records) {
      lines.push(`- ${record.key} = ${record.value}`);
    }
  }

  lines.push(`ENS binding blocking reasons: ${formatList(binding.blockingReasons)}`);
  lines.push(`ENS binding degraded reasons: ${formatList(binding.degradedReasons)}`);
  return lines;
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

function renderTestSummary(summary: CenterLocalTestSummary): string[] {
  const lines = [
    `Tested at: ${summary.testedAt}`,
    "",
    "Layer test summary"
  ];

  for (const item of summary.items) {
    lines.push("");
    lines.push("------------------------------------------------------------");
    lines.push(item.label);
    lines.push("------------------------------------------------------------");
    lines.push(
      `Local:        ${item.local.indicator} ${formatTestStatus(item.local.status)}${
        item.local.claimLevel === undefined ? "" : ` (${item.local.claimLevel})`
      }`
    );
    lines.push(`Onchain/live: ${item.onchain.indicator} ${formatTestStatus(item.onchain.status)}`);
    lines.push("");
    lines.push(`Local detail: ${item.local.detail}`);
    lines.push(`Live detail:  ${item.onchain.detail}`);
  }

  lines.push("");
  lines.push("------------------------------------------------------------");
  lines.push("Next actions:");
  for (const action of summary.nextActions) {
    lines.push(`- ${action}`);
  }

  return lines;
}

function formatTestStatus(status: CenterLocalTestSummary["items"][number]["local"]["status"]): string {
  if (status === "tested") {
    return "tested";
  }
  if (status === "not-needed") {
    return "not needed";
  }
  if (status === "blocked") {
    return "blocked";
  }
  return "not tested";
}

function renderCredentialSafety(credentials: CredentialSafetyStatus): string[] {
  const lines = [
    `Credential safety: ${credentials.ok ? "[PASS] pass" : "[BLOCKED] blocked"}`,
    `Live ready: ${credentials.liveReady ? "yes" : "no"}`,
    `Live writes enabled: ${credentials.liveWritesEnabled ? "yes" : "no"}`,
    "Secrets printed: no",
    "",
    "Environment files:",
    `- .env.example: ${credentials.envFiles.exampleExists ? "present" : "missing"}`,
    `- .env.local: ${credentials.envFiles.localExists ? "present" : "missing"}`,
    `- .env: ${credentials.envFiles.dotEnvExists ? "present" : "absent"}`,
    `- external operator secrets file: ${credentials.envFiles.operatorSecretsExists ? "present" : "missing"}`,
    `- repo-local secret keys with values: ${formatList(credentials.envFiles.repoLocalSecretKeys)}`,
    `- tracked sensitive env files: ${formatList(credentials.envFiles.trackedSensitiveEnvFiles)}`,
    "",
    "Configured values:",
    `- ZERO_G_PROVIDER_MODE: ${credentials.configured.zeroGProviderMode ?? "missing"}`,
    `- ZERO_G_EVM_RPC: ${credentials.configured.zeroGEvmRpc ? "present" : "missing"}`,
    `- ZERO_G_INDEXER_RPC: ${credentials.configured.zeroGIndexerRpc ? "present" : "missing"}`,
    `- ZERO_G_STORAGE_MODE: ${credentials.configured.zeroGStorageMode ?? "missing"}`,
    `- ZERO_G_WALLET_ADDRESS: ${credentials.configured.zeroGWalletAddress}`,
    `- ZERO_G_PRIVATE_KEY: ${credentials.configured.zeroGPrivateKey}`,
    `- ZERO_G_ENABLE_LIVE_WRITES: ${credentials.configured.zeroGLiveWrites ? "true" : "false"}`,
    `- ZERO_G_REQUIRE_PROOF: ${credentials.configured.zeroGRequireProof ? "true" : "false"}`,
    "",
    "Checks:"
  ];

  for (const check of credentials.checks) {
    lines.push(`- ${check.label}: ${formatCredentialCheckStatus(check.status)} - ${check.detail}`);
  }

  lines.push(`Blocking reasons: ${formatList(credentials.blockingReasons)}`);
  lines.push(`Warnings: ${formatList(credentials.warnings)}`);
  lines.push("Next actions:");
  for (const action of credentials.nextActions) {
    lines.push(`- ${action}`);
  }

  return lines;
}

function formatCredentialCheckStatus(status: CredentialCheckStatus): string {
  if (status === "pass") {
    return "[PASS] pass";
  }
  if (status === "fail") {
    return "[FAIL] fail";
  }
  return "[WARN] warn";
}
