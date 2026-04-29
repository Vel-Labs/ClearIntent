import { sha256Hex, stableStringify, type AgentIntent } from "../../core/src";
import type { ClearIntentTypedData, ClearIntentTypedDataMessage, SignerAuditRefs } from "./types";

export function buildClearIntentTypedData(intent: AgentIntent, auditRefs: SignerAuditRefs = {}): ClearIntentTypedData {
  assertEthereumSigningContext(intent);

  const message: ClearIntentTypedDataMessage = {
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
    auditRefs: formatAuditRefs(intent, auditRefs)
  };

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
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "actionType", type: "string" },
        { name: "target", type: "address" },
        { name: "valueLimit", type: "uint256" },
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
    message
  };
}

export function typedDataHash(typedData: ClearIntentTypedData): string {
  return sha256Hex(typedData);
}

export function stableTypedDataJson(typedData: ClearIntentTypedData): string {
  return stableStringify(typedData);
}

export function formatAuditRefs(intent: AgentIntent, auditRefs: SignerAuditRefs = {}): string {
  const refs = {
    agentCardUri: auditRefs.agentCardUri ?? intent.agentIdentity.agentCardUri ?? "",
    policyUri: auditRefs.policyUri ?? intent.policy.policyUri,
    auditBundleUri: auditRefs.auditBundleUri ?? "",
    riskReportUri: auditRefs.riskReportUri ?? "",
    humanReviewUri: auditRefs.humanReviewUri ?? ""
  };

  return stableStringify(refs);
}

function assertEthereumSigningContext(intent: AgentIntent): void {
  if (!Number.isInteger(intent.action.chainId) || intent.action.chainId < 1) {
    throw new Error("ClearIntent EIP-712 typed data requires an explicit Ethereum chainId.");
  }

  if (intent.authority.verifyingContract.length === 0) {
    throw new Error("ClearIntent EIP-712 typed data requires an explicit verifyingContract.");
  }
}
