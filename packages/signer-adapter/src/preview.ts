import type { AgentIntent } from "../../core/src";
import { APPROVAL_FIELD_MAP, EIP712_LOCAL_FIXTURE_CLAIM, type ApprovalPreview, type SignerAuditRefs } from "./types";
import { formatAuditRefs } from "./eip712";
import { defaultDisplayWarnings } from "./display-status";

export function renderApprovalPreview(intent: AgentIntent, auditRefs: SignerAuditRefs = {}): ApprovalPreview {
  const values = approvalFieldValues(intent, auditRefs);
  const fields = APPROVAL_FIELD_MAP.map((field) => ({
    ...field,
    value: values[field.key]
  }));

  return {
    claimLevel: EIP712_LOCAL_FIXTURE_CLAIM,
    displayStatus: "app_preview_only",
    title: "ClearIntent Approval Preview",
    summary: `${intent.agentIdentity.ensName} requests ${intent.action.actionType} on chain ${intent.action.chainId}.`,
    fields,
    warnings: defaultDisplayWarnings("app_preview_only")
  };
}

export function renderApprovalPreviewText(preview: ApprovalPreview): string {
  const lines = [preview.title, preview.summary, ...preview.fields.map((field) => `${field.label}: ${field.value}`)];
  if (preview.warnings.length > 0) {
    lines.push(`Warnings: ${preview.warnings.join(", ")}`);
  }
  return lines.join("\n");
}

export function approvalFieldValues(intent: AgentIntent, auditRefs: SignerAuditRefs = {}): Record<string, string> {
  return {
    intentId: intent.intentId,
    intentHash: intent.hashes.intentHash,
    policyHash: intent.policy.policyHash,
    actionHash: intent.hashes.actionHash,
    signer: intent.authority.signer,
    executor: intent.authority.executor,
    nonce: intent.authority.nonce,
    deadline: intent.authority.deadline,
    chainId: String(intent.action.chainId),
    verifyingContract: intent.authority.verifyingContract,
    valueLimit: intent.action.valueLimit ?? "0",
    identity: `${intent.agentIdentity.ensName} (${intent.agentIdentity.controllerAddress})`,
    auditRefs: formatAuditRefs(intent, auditRefs)
  };
}
