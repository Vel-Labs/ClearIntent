import { createContractValidator, deriveCoreStateSnapshot } from "../../core/src";
import { getCenterExecutionStatus } from "./execution-status";
import { loadFixture } from "./fixtures";
import { getCenterIdentityStatus } from "./identity-status";
import { getCenterMemoryStatus } from "./memory-status";
import { getCenterSignerStatus } from "./signer-status";

export type TestEvidenceStatus = "tested" | "not-tested" | "not-needed" | "blocked";

export type CenterTestDimension = {
  status: TestEvidenceStatus;
  indicator: string;
  claimLevel?: string;
  detail: string;
};

export type CenterTestItem = {
  id: string;
  label: string;
  local: CenterTestDimension;
  onchain: CenterTestDimension;
};

export type CenterLocalTestSummary = {
  ok: boolean;
  testedAt: string;
  items: CenterTestItem[];
  summary: string;
  nextActions: string[];
};

export async function runCenterLocalTestSummary(now = new Date()): Promise<CenterLocalTestSummary> {
  const [contracts, core, memory, identity, execution, signerStatus, signerPreview, signerTypedData, signerMetadata] = await Promise.all([
    testContracts(),
    testCoreLifecycle(),
    getCenterMemoryStatus(),
    getCenterIdentityStatus(),
    getCenterExecutionStatus(),
    getCenterSignerStatus("status"),
    getCenterSignerStatus("preview"),
    getCenterSignerStatus("typed-data"),
    getCenterSignerStatus("metadata")
  ]);

  const signerPayloadOk = signerStatus.ok && signerPreview.ok && signerTypedData.ok;
  const signerMetadataOk = signerMetadata.ok && signerMetadata.claimLevels.includes("erc7730-local-metadata");
  const crossLayerOk = memory.ok && identity.ok && execution.ok && signerPayloadOk && signerMetadataOk;

  const items: CenterTestItem[] = [
    {
      id: "contracts",
      label: "Contracts tested",
      local: contracts,
      onchain: notNeeded("Contracts are local canonical schemas; onchain proof is not part of this test.")
    },
    {
      id: "core",
      label: "Core lifecycle tested",
      local: core,
      onchain: notNeeded("Core lifecycle is local authority logic; onchain proof is provided by provider layers.")
    },
    {
      id: "zerog",
      label: "0G tested",
      local: memory.ok
        ? tested(memory.claimLevel, "Local memory write/read/hash/audit-bundle checks passed.")
        : blocked(memory.claimLevel, memory.summary),
      onchain: notTested("Run memory live-status and memory live-smoke with funded 0G testnet credentials for 2B.")
    },
    {
      id: "ens",
      label: "ENS tested",
      local: identity.ok
        ? tested(identity.claimLevel, `Local ENS fixture resolved ${identity.ensName ?? "the configured fixture"}.`)
        : blocked(identity.claimLevel, identity.summary),
      onchain: notTested("Run Phase 3B live ENS binding after Phase 2B live 0G artifact evidence exists.")
    },
    {
      id: "keeperhub",
      label: "KeeperHub tested",
      local: execution.ok
        ? tested(execution.claimLevel, "Local KeeperHub workflow mapping, submit, monitor, and receipt conversion are available.")
        : blocked(execution.claimLevel, execution.summary),
      onchain: notTested("Run Phase 4B live KeeperHub/onchain execution only after authority and live evidence gates are ready.")
    },
    {
      id: "signer-payload",
      label: "Signer payload tested",
      local: signerPayloadOk
        ? tested("signer-local-fixture, eip712-local-fixture", "Local signer status, preview, and typed-data routes passed.")
        : blocked("signer-local-fixture", "Signer status, preview, or typed-data route is blocked."),
      onchain: notTested("Run Phase 5C MetaMask/software-wallet signing before claiming software-wallet-tested.")
    },
    {
      id: "metadata",
      label: "Metadata tested",
      local: signerMetadataOk
        ? tested("erc7730-local-metadata", "Local ERC-7730/Clear Signing metadata route passed.")
        : blocked("erc7730-local-metadata", "Signer metadata route is blocked."),
      onchain: notTested("Wallet/vendor metadata acceptance is not tested by local metadata generation.")
    },
    {
      id: "cross-layer",
      label: "End to End / Cross Layer tested",
      local: crossLayerOk
        ? tested("local stack", "Memory, identity, execution, signer payload, and metadata local routes are coherent.")
        : blocked("local stack", "One or more local layer routes is blocked."),
      onchain: notTested("End-to-end live proof requires 2B, 3B, 4B, and 5C evidence.")
    }
  ];

  return {
    ok: items.every((item) => item.local.status === "tested"),
    testedAt: now.toISOString(),
    items,
    summary: "Completed local ClearIntent layer test. Live/onchain columns are intentionally not promoted from local evidence.",
    nextActions: [
      "Run memory live-status before enabling live writes.",
      "Run memory live-smoke only with funded 0G testnet credentials and explicit live-write opt-in.",
      "Run Phase 5C MetaMask/software-wallet signer-only validation with operator wallet evidence.",
      "Return to 3B live ENS binding and 4B live KeeperHub/onchain execution after 2B evidence exists."
    ]
  };
}

async function testContracts(): Promise<CenterTestDimension> {
  const fixture = loadFixture("valid");
  const validator = await createContractValidator();
  const intent = validator.validateContract("AgentIntent", fixture.intent);
  const policy = fixture.policy === undefined ? { ok: true } : validator.validateContract("AgentPolicy", fixture.policy);
  return intent.ok && policy.ok
    ? tested("canonical schemas", "Valid AgentIntent and AgentPolicy fixtures passed canonical schema validation.")
    : blocked("canonical schemas", "Canonical contract fixture validation failed.");
}

function testCoreLifecycle(): CenterTestDimension {
  const fixture = loadFixture("valid");
  const snapshot = deriveCoreStateSnapshot({ intent: fixture.intent, evidence: fixture.evidence });
  return snapshot.intentId === fixture.intent.intentId
    ? tested("fixture-only", `Core snapshot rendered next action ${snapshot.nextAction?.code ?? "none"}.`)
    : blocked("fixture-only", "Core snapshot did not bind to the fixture intent.");
}

function tested(claimLevel: string | undefined, detail: string): CenterTestDimension {
  return {
    status: "tested",
    indicator: "✅",
    claimLevel,
    detail
  };
}

function notTested(detail: string): CenterTestDimension {
  return {
    status: "not-tested",
    indicator: "[ ]",
    detail
  };
}

function notNeeded(detail: string): CenterTestDimension {
  return {
    status: "not-needed",
    indicator: "[-]",
    detail
  };
}

function blocked(claimLevel: string | undefined, detail: string): CenterTestDimension {
  return {
    status: "blocked",
    indicator: "[!]",
    claimLevel,
    detail
  };
}
