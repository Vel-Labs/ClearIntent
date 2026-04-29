import { sha256Hex, stableStringify, type AgentIntent } from "../../core/src";
import { APPROVAL_FIELD_MAP, ERC7730_LOCAL_METADATA_CLAIM, type ApprovalFieldKey, type SignerAuditRefs, type SignerIssue } from "./types";
import { approvalFieldValues } from "./preview";

export type LocalErc7730Field = {
  path: ApprovalFieldKey;
  label: string;
  required: boolean;
  value: string;
};

export type LocalErc7730Metadata = {
  schemaVersion: "clearintent.erc7730-local-metadata.v1";
  claimLevel: typeof ERC7730_LOCAL_METADATA_CLAIM;
  metadataHash: string;
  domain: {
    chainId: number;
    verifyingContract: string;
  };
  display: {
    title: "ClearIntent Agent Intent";
    description: string;
    fields: LocalErc7730Field[];
  };
  limitations: string[];
};

export function generateLocalErc7730Metadata(intent: AgentIntent, auditRefs: SignerAuditRefs = {}): LocalErc7730Metadata {
  const values = approvalFieldValues(intent, auditRefs);
  const metadataWithoutHash = {
    schemaVersion: "clearintent.erc7730-local-metadata.v1" as const,
    claimLevel: ERC7730_LOCAL_METADATA_CLAIM,
    metadataHash: "",
    domain: {
      chainId: intent.action.chainId,
      verifyingContract: intent.authority.verifyingContract
    },
    display: {
      title: "ClearIntent Agent Intent" as const,
      description: "Local ClearIntent metadata scaffold for readable signer display support.",
      fields: APPROVAL_FIELD_MAP.map((field) => ({
        path: field.key,
        label: field.label,
        required: field.required,
        value: values[field.key]
      }))
    },
    limitations: [
      "Local metadata only; no wallet-rendered preview evidence.",
      "No secure-device display evidence.",
      "No vendor-approved Clear Signing claim."
    ]
  };

  return {
    ...metadataWithoutHash,
    metadataHash: sha256Hex(metadataWithoutHash)
  };
}

export function validateLocalErc7730Metadata(metadata: LocalErc7730Metadata, intent: AgentIntent): { ok: true; issues: [] } | { ok: false; issues: SignerIssue[] } {
  const issues: SignerIssue[] = [];
  const expectedFields = APPROVAL_FIELD_MAP.map((field) => field.key);
  const actualFields = metadata.display.fields.map((field) => field.path);

  if (metadata.claimLevel !== ERC7730_LOCAL_METADATA_CLAIM) {
    issues.push({ code: "invalid_metadata", message: "Metadata claim level must remain erc7730-local-metadata.", path: "claimLevel" });
  }
  if (metadata.domain.chainId !== intent.action.chainId) {
    issues.push({ code: "invalid_metadata", message: "Metadata chainId does not match intent action chainId.", path: "domain.chainId" });
  }
  if (metadata.domain.verifyingContract !== intent.authority.verifyingContract) {
    issues.push({ code: "invalid_metadata", message: "Metadata verifyingContract does not match intent authority.", path: "domain.verifyingContract" });
  }
  if (stableStringify(actualFields) !== stableStringify(expectedFields)) {
    issues.push({ code: "invalid_metadata", message: "Metadata fields must match the ClearIntent approval field map.", path: "display.fields" });
  }

  return issues.length === 0 ? { ok: true, issues: [] } : { ok: false, issues };
}
