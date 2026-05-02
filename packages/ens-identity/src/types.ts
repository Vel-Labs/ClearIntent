import type { AgentIdentity } from "../../core/src";
import type { EnsIdentityRecordKey } from "./record-keys";

export type EnsIdentityClaimLevel = "ens-local-fixture" | "ens-live-read" | "ens-live-bound";
export type EnsProviderMode = "local" | "live";
export type EnsResolutionState = "resolved" | "blocked" | "degraded";

export type EnsIdentityIssueCode =
  | "missing_name"
  | "missing_resolver"
  | "missing_record"
  | "unsupported_network"
  | "policy_hash_mismatch"
  | "live_lookup_unavailable"
  | "live_config_missing"
  | "live_lookup_failed";

export type EnsIdentityIssue = {
  code: EnsIdentityIssueCode;
  message: string;
  recordKey?: EnsIdentityRecordKey;
  ensName?: string;
  expected?: string;
  actual?: string;
};

export type EnsIdentityResult<T> =
  | {
      ok: true;
      state: "resolved";
      value: T;
      issues: [];
    }
  | {
      ok: false;
      state: "blocked" | "degraded";
      issues: EnsIdentityIssue[];
      value?: T;
    };

export type AgentCard = {
  schemaVersion: "clearintent.agent-card.v1";
  ensName: string;
  displayName: string;
  controllerAddress: string;
  capabilities: string[];
  policy: {
    uri: string;
    hash: string;
  };
  audit: {
    latest: string;
  };
  clearintentVersion: string;
  claimLevel: EnsIdentityClaimLevel;
};

export type EnsTextRecords = Partial<Record<EnsIdentityRecordKey, string>>;

export type EnsResolverRecord = {
  ensName: string;
  address?: string;
  textRecords: EnsTextRecords;
  agentCards?: Record<string, AgentCard>;
};

export type EnsResolverLookup = {
  ensName: string;
  network?: string;
};

export interface EnsResolverAdapter {
  readonly providerMode: EnsProviderMode;
  readonly claimLevel: EnsIdentityClaimLevel;
  resolveName(input: EnsResolverLookup): Promise<EnsIdentityResult<EnsResolverRecord>>;
}

export type ResolvedEnsIdentity = {
  claimLevel: EnsIdentityClaimLevel;
  providerMode: EnsProviderMode;
  liveProvider: boolean;
  agentIdentity: AgentIdentity;
  agentCard: AgentCard;
  records: {
    agentCardUri: string;
    policyUri: string;
    policyHash: string;
    auditLatest: string;
    clearintentVersion: string;
  };
};

export type EnsLiveConfig = {
  providerMode: "live";
  rpcUrl?: string;
  chainId: number;
  networkName: string;
  ensName?: string;
  expectedPolicyHash?: string;
};

export type EnsLiveReadStatus = {
  ok: boolean;
  claimLevel: "ens-local-fixture" | "ens-live-read" | "ens-live-bound";
  providerMode: "live";
  liveProvider: true;
  ensName?: string;
  address?: string;
  records: EnsTextRecords;
  summary: string;
  checks: {
    id: string;
    label: string;
    status: "pass" | "blocking" | "degraded";
    detail: string;
  }[];
  degradedReasons: string[];
  blockingReasons: string[];
};
