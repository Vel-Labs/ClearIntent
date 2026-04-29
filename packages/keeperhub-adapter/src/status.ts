import { createLocalKeeperHubExecutionAdapter } from "./local-execution-adapter";
import type { ExecutionAdapterStatus } from "./types";

export type CenterExecutionStatus = {
  ok: boolean;
  claimLevel: "keeperhub-local-fixture";
  providerMode: "local";
  localFixtureAvailable: boolean;
  liveProvider: false;
  liveProviderDisabled: true;
  liveExecutionProven: false;
  authorityApprovalProvidedByKeeperHub: false;
  summary: string;
  checks: {
    id: "local-fixture" | "live-provider" | "live-execution" | "authority-approval";
    label: string;
    status: "pass" | "degraded";
    detail: string;
  }[];
  degradedReasons: string[];
};

export function getCenterExecutionStatus(): CenterExecutionStatus {
  return buildCenterExecutionStatus(createLocalKeeperHubExecutionAdapter().status());
}

export function buildCenterExecutionStatus(status: ExecutionAdapterStatus): CenterExecutionStatus {
  return {
    ok: status.localFixtureAvailable,
    claimLevel: status.claimLevel,
    providerMode: status.providerMode,
    localFixtureAvailable: status.localFixtureAvailable,
    liveProvider: status.liveProvider,
    liveProviderDisabled: status.liveProviderDisabled,
    liveExecutionProven: status.liveExecutionProven,
    authorityApprovalProvidedByKeeperHub: status.authorityApprovalProvidedByKeeperHub,
    summary: status.summary,
    checks: [
      {
        id: "local-fixture",
        label: "Local fixture",
        status: status.localFixtureAvailable ? "pass" : "degraded",
        detail: "Local workflow mapping, submit, monitor, and receipt conversion are available without live KeeperHub."
      },
      {
        id: "live-provider",
        label: "Live provider",
        status: "degraded",
        detail: "Live KeeperHub provider is disabled for Phase 4A."
      },
      {
        id: "live-execution",
        label: "Live execution",
        status: "degraded",
        detail: "No live KeeperHub run or onchain transaction is proven by local fixtures."
      },
      {
        id: "authority-approval",
        label: "Authority approval",
        status: "degraded",
        detail: "KeeperHub does not provide ClearIntent authority approval; it executes only after ClearIntent verification."
      }
    ],
    degradedReasons: status.issues.map((issue) => issue.code)
  };
}
