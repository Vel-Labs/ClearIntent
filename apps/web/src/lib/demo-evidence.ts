import { deriveCoreStateSnapshot, type AgentIntent } from "../../../../packages/core/src";
import type { ClearIntentTypedData } from "../../../../packages/signer-adapter/src";
import type { AuthorityEvidenceSet } from "./evidence-model";
import { demoEvidence, missingEvidence, presentEvidence } from "./evidence-model";

const demoIntent = {
  schemaVersion: "clearintent.agent-intent.v1",
  intentId: "demo-intent-001",
  lifecycleState: "proposed",
  createdAt: "2026-05-02T00:00:00.000Z",
  agentIdentity: {
    ensName: "demo.agent.clearintent.eth",
    controllerAddress: "0x1111111111111111111111111111111111111111",
    agentCardUri: "0g://demo/agent-card.json",
    role: "demo-agent"
  },
  policy: {
    policyUri: "0g://demo/policy.json",
    policyHash: "0x2222222222222222222222222222222222222222222222222222222222222222"
  },
  action: {
    actionType: "demo.transfer",
    target: "0x3333333333333333333333333333333333333333",
    chainId: 11155111,
    valueLimit: "0",
    description: "Demo-only bounded action preview."
  },
  authority: {
    signer: "0x4444444444444444444444444444444444444444",
    executor: "0x5555555555555555555555555555555555555555",
    nonce: "demo-nonce-001",
    deadline: "2026-05-03T00:00:00.000Z",
    verifyingContract: "0x6666666666666666666666666666666666666666"
  },
  hashes: {
    actionHash: "0x7777777777777777777777777777777777777777777777777777777777777777",
    intentHash: "0x8888888888888888888888888888888888888888888888888888888888888888"
  }
} satisfies AgentIntent;

export function buildMissingAuthorityEvidence(): AuthorityEvidenceSet {
  return {
    wallet: missingEvidence("wallet", "Parent wallet", "No parent wallet session is connected."),
    ens: missingEvidence("ens", "ENS identity", "No ENS identity evidence has been loaded."),
    zerog: missingEvidence("zerog", "0G memory", "No 0G policy, audit, or artifact references are configured."),
    keeperhub: missingEvidence("keeperhub", "KeeperHub", "No KeeperHub workflow or run evidence is configured."),
    signer: missingEvidence("signer", "Signer readiness", "No EIP-712 signer readiness evidence is available."),
    payload: missingEvidence("payload", "ClearIntent payload", "No canonical ClearIntent payload is selected."),
    alchemy: missingEvidence("alchemy", "Alchemy Account Kit", "No Account Kit readiness evidence is configured.")
  };
}

export function buildDemoAuthorityEvidence(): AuthorityEvidenceSet {
  const typedData = buildTypedData(demoIntent);
  return {
    wallet: demoEvidence("wallet", "Parent wallet", "Demo wallet address for walkthrough rendering only.", {
      address: demoIntent.authority.signer,
      chainId: demoIntent.action.chainId,
      connector: "unknown"
    }),
    ens: demoEvidence("ens", "ENS identity", "Demo ENS record set; not resolved from a live provider.", {
      claimLevel: "ens-local-fixture",
      identity: undefined,
      liveStatus: undefined
    }),
    zerog: demoEvidence("zerog", "0G memory", "Demo 0G references; not read back from 0G Storage.", {
      providerMode: "local",
      claimLevel: "local-fixture",
      refs: []
    }),
    keeperhub: demoEvidence("keeperhub", "KeeperHub", "Demo workflow/run identifiers; no execution claim.", {
      claimLevel: "keeperhub-local-fixture",
      workflowId: "demo-workflow",
      runId: "demo-run",
      authorityApprovalProvidedByKeeperHub: false
    }),
    signer: demoEvidence("signer", "Signer readiness", "Demo signer readiness; no wallet-rendered preview is proven.", {
      walletClass: "software",
      capabilityLevel: "request_shape_only",
      claimLevel: "request-shape-only",
      displayStatus: "app_preview_only",
      walletRenderedPreviewProven: false
    }),
    payload: demoEvidence("payload", "ClearIntent payload", "Demo canonical payload fixture for UI wiring only.", {
      intent: demoIntent,
      typedData,
      coreSnapshot: deriveCoreStateSnapshot({ intent: demoIntent })
    }),
    alchemy: demoEvidence("alchemy", "Alchemy Account Kit", "Demo Account Kit readiness; no smart-account enforcement proof.", {
      configured: false,
      accountKitReady: false,
      apiKeyPresent: false,
      sessionKeyPolicyProven: false
    })
  };
}

export function buildConfiguredAuthorityEvidence(input: {
  parentWalletAddress: string;
  chainId?: number;
  intent?: AgentIntent;
  alchemyApiKeyPresent?: boolean;
}): AuthorityEvidenceSet {
  const intent = input.intent ?? demoIntent;
  const typedData = buildTypedData(intent);
  return {
    wallet: presentEvidence("wallet", "Parent wallet", "Connected parent wallet session reported by the wallet provider.", "wallet-provider", {
      address: input.parentWalletAddress,
      chainId: input.chainId,
      connector: "eip1193"
    }),
    ens: presentEvidence("ens", "ENS identity", "ENS evidence is configured for display from adapter-provided data.", "adapter", {
      claimLevel: "ens-live-bound"
    }),
    zerog: presentEvidence("zerog", "0G memory", "0G policy and audit references are configured for display.", "adapter", {
      providerMode: "live",
      claimLevel: "0g-write-read-verified",
      refs: []
    }),
    keeperhub: presentEvidence("keeperhub", "KeeperHub", "KeeperHub workflow evidence is configured; KeeperHub is not authority approval.", "adapter", {
      claimLevel: "keeperhub-live-submitted",
      authorityApprovalProvidedByKeeperHub: false
    }),
    signer: presentEvidence("signer", "Signer readiness", "Software-wallet EIP-712 request shape is ready; wallet display proof is separate evidence.", "adapter", {
      walletClass: "software",
      capabilityLevel: "request_shape_only",
      claimLevel: "request-shape-only",
      displayStatus: "app_preview_only",
      walletRenderedPreviewProven: false
    }),
    payload: presentEvidence("payload", "ClearIntent payload", "Canonical payload is available for preview and wallet request construction.", "core", {
      intent,
      typedData,
      coreSnapshot: deriveCoreStateSnapshot({ intent })
    }),
    alchemy: presentEvidence("alchemy", "Alchemy Account Kit", "Account Kit configuration readiness is displayed without claiming session-key enforcement.", "operator-config", {
      configured: input.alchemyApiKeyPresent === true,
      accountKitReady: input.alchemyApiKeyPresent === true,
      apiKeyPresent: input.alchemyApiKeyPresent === true,
      sessionKeyPolicyProven: false
    })
  };
}

function buildTypedData(intent: AgentIntent): ClearIntentTypedData {
  return {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ],
      ClearIntentAgentIntent: [
        { name: "intentId", type: "string" },
        { name: "intentHash", type: "bytes32" },
        { name: "policyHash", type: "bytes32" },
        { name: "actionHash", type: "bytes32" },
        { name: "signer", type: "address" },
        { name: "executor", type: "address" },
        { name: "nonce", type: "string" },
        { name: "deadline", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "actionType", type: "string" },
        { name: "target", type: "address" },
        { name: "valueLimit", type: "string" },
        { name: "identity", type: "string" },
        { name: "auditRefs", type: "string" }
      ]
    },
    primaryType: "ClearIntentAgentIntent",
    domain: {
      name: "ClearIntent",
      version: "1",
      chainId: intent.action.chainId,
      verifyingContract: intent.authority.verifyingContract
    },
    message: {
      intentId: intent.intentId,
      intentHash: intent.hashes.intentHash,
      policyHash: intent.policy.policyHash,
      actionHash: intent.hashes.actionHash,
      signer: intent.authority.signer,
      executor: intent.authority.executor,
      nonce: intent.authority.nonce,
      deadline: intent.authority.deadline,
      chainId: intent.action.chainId,
      verifyingContract: intent.authority.verifyingContract,
      actionType: intent.action.actionType,
      target: intent.action.target,
      valueLimit: intent.action.valueLimit ?? "0",
      identity: intent.agentIdentity.ensName,
      auditRefs: intent.agentIdentity.agentCardUri ?? ""
    }
  };
}
