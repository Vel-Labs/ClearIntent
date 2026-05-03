import { loadSetupWizardResume } from "./setup-resume";

export type AgentSetupDiscoveryStatus = "in-progress" | "complete";

export type AgentSetupDiscoveryRecord = {
  schemaVersion: 1;
  discoveryKey: string;
  parentWallet: string;
  agentAccount: string;
  agentEnsName: string;
  status: AgentSetupDiscoveryStatus;
  policyUri?: string;
  policyHash?: string;
  auditLatest?: string;
  keeperHubRunId?: string;
  source: "browser-local";
  updatedAt: string;
};

type DiscoveryRegistry = {
  schemaVersion: 1;
  records: AgentSetupDiscoveryRecord[];
};

const discoveryRegistryKey = "clearintent.agent-discovery.v1";

export function discoverAgentSetups(parentWallet: string | undefined): AgentSetupDiscoveryRecord[] {
  if (parentWallet === undefined) return [];
  const normalizedParentWallet = normalizeAddress(parentWallet);
  const records = [...loadDiscoveryRegistry().records, ...migrateSetupWizardResume()];
  return dedupeDiscoveryRecords(records)
    .filter((record) => normalizeAddress(record.parentWallet) === normalizedParentWallet)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function upsertAgentSetupDiscovery(
  input: Omit<AgentSetupDiscoveryRecord, "schemaVersion" | "discoveryKey" | "source" | "updatedAt">
): AgentSetupDiscoveryRecord {
  const registry = loadDiscoveryRegistry();
  const record: AgentSetupDiscoveryRecord = {
    schemaVersion: 1,
    discoveryKey: discoveryKey(input.parentWallet, input.agentAccount, input.agentEnsName),
    source: "browser-local",
    updatedAt: new Date().toISOString(),
    ...input
  };
  const nextRecords = dedupeDiscoveryRecords([
    record,
    ...registry.records.filter((existing) => existing.discoveryKey !== record.discoveryKey)
  ]);
  saveDiscoveryRegistry({ schemaVersion: 1, records: nextRecords });
  return record;
}

export function hasCompleteAgentSetup(records: AgentSetupDiscoveryRecord[]): boolean {
  return records.some((record) => record.status === "complete");
}

function migrateSetupWizardResume(): AgentSetupDiscoveryRecord[] {
  const resume = loadSetupWizardResume();
  if (resume === undefined || !isRecord(resume.accountStep) || !isRecord(resume.accountStep.evidence)) return [];

  const evidence = resume.accountStep.evidence;
  if (
    typeof evidence.parentAddress !== "string" ||
    typeof evidence.accountAddress !== "string" ||
    typeof resume.agentName !== "string" ||
    resume.agentName.trim().length === 0
  ) {
    return [];
  }

  const zeroGRecords = readZeroGRecords(resume.zeroGStep);
  const keeperHubRunId = runIdFromEvidence(resume.keeperHubStep);
  return [
    {
      schemaVersion: 1,
      discoveryKey: discoveryKey(evidence.parentAddress, evidence.accountAddress, resume.agentName),
      parentWallet: evidence.parentAddress,
      agentAccount: evidence.accountAddress,
      agentEnsName: resume.agentName.includes(".") ? resume.agentName : `${resume.agentName}.agent.clearintent.eth`,
      status: isCompleteResume(resume) ? "complete" : "in-progress",
      policyUri: zeroGRecords?.policyUri,
      policyHash: zeroGRecords?.policyHash,
      auditLatest: zeroGRecords?.auditLatest,
      keeperHubRunId,
      source: "browser-local",
      updatedAt: resume.updatedAt
    }
  ];
}

function isCompleteResume(resume: unknown): boolean {
  if (!isRecord(resume)) return false;
  return readyOperation(resume.recordsStep) && readyOperation(resume.keeperHubStep);
}

function readyOperation(value: unknown): boolean {
  return isRecord(value) && value.status === "ready";
}

function readZeroGRecords(value: unknown): { policyUri?: string; policyHash?: string; auditLatest?: string } | undefined {
  if (!isRecord(value) || !isRecord(value.evidence) || !isRecord(value.evidence.records)) return undefined;
  return {
    policyUri: stringValue(value.evidence.records.policyUri),
    policyHash: stringValue(value.evidence.records.policyHash),
    auditLatest: stringValue(value.evidence.records.auditLatest)
  };
}

function runIdFromEvidence(value: unknown): string | undefined {
  if (!isRecord(value) || !isRecord(value.evidence)) return undefined;
  return stringValue(value.evidence.runId) ?? stringValue(value.evidence.executionId) ?? stringValue(value.evidence.id);
}

function loadDiscoveryRegistry(): DiscoveryRegistry {
  const raw = storage()?.getItem(discoveryRegistryKey);
  if (raw === undefined || raw === null) return { schemaVersion: 1, records: [] };

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.schemaVersion !== 1 || !Array.isArray(parsed.records)) {
      return { schemaVersion: 1, records: [] };
    }
    return {
      schemaVersion: 1,
      records: parsed.records.filter(isDiscoveryRecord)
    };
  } catch {
    return { schemaVersion: 1, records: [] };
  }
}

function saveDiscoveryRegistry(registry: DiscoveryRegistry): void {
  try {
    storage()?.setItem(discoveryRegistryKey, JSON.stringify(registry));
  } catch {
    // Discovery records are a local UX index, not authority truth.
  }
}

function dedupeDiscoveryRecords(records: AgentSetupDiscoveryRecord[]): AgentSetupDiscoveryRecord[] {
  const byKey = new Map<string, AgentSetupDiscoveryRecord>();
  for (const record of records) {
    const existing = byKey.get(record.discoveryKey);
    if (existing === undefined || record.updatedAt > existing.updatedAt) {
      byKey.set(record.discoveryKey, record);
    }
  }
  return [...byKey.values()];
}

function isDiscoveryRecord(value: unknown): value is AgentSetupDiscoveryRecord {
  return (
    isRecord(value) &&
    value.schemaVersion === 1 &&
    typeof value.discoveryKey === "string" &&
    typeof value.parentWallet === "string" &&
    typeof value.agentAccount === "string" &&
    typeof value.agentEnsName === "string" &&
    (value.status === "in-progress" || value.status === "complete") &&
    value.source === "browser-local" &&
    typeof value.updatedAt === "string"
  );
}

function discoveryKey(parentWallet: string, agentAccount: string, agentEnsName: string): string {
  return `${normalizeAddress(parentWallet)}:${normalizeAddress(agentAccount)}:${agentEnsName.toLowerCase()}`;
}

function normalizeAddress(value: string): string {
  return value.toLowerCase();
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function storage(): Storage | undefined {
  return typeof window === "undefined" ? undefined : window.localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
