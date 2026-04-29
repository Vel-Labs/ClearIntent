import { describe, expect, it } from "vitest";
import validIntent from "../../contracts/examples/valid-agent-intent.json";
import { advanceIntentLifecycle, type AgentIntent } from "../../packages/core/src";
import {
  APPROVAL_FIELD_MAP,
  buildClearIntentTypedData,
  buildConditionalReviewPrompts,
  buildEthSignTypedDataV4Request,
  createFixtureSignatureEvidence,
  generateLocalErc7730Metadata,
  getInjectedWalletRequestStatus,
  mapInjectedWalletError,
  renderApprovalPreview,
  renderApprovalPreviewText,
  stableTypedDataJson,
  toCoreSignatureEvidence,
  typedDataHash,
  validateLocalErc7730Metadata
} from "../../packages/signer-adapter/src";

const intent = validIntent as AgentIntent;

describe("signer adapter local scaffold", () => {
  it("builds deterministic EIP-712 typed data from canonical AgentIntent", () => {
    const typedData = buildClearIntentTypedData(intent);
    const again = buildClearIntentTypedData(intent);

    expect(stableTypedDataJson(typedData)).toBe(stableTypedDataJson(again));
    expect(typedData.primaryType).toBe("ClearIntentAgentIntent");
    expect(typedData.domain).toMatchObject({
      name: "ClearIntent",
      version: "1",
      chainId: 11155111,
      verifyingContract: intent.authority.verifyingContract
    });
    expect(typedData.message).toMatchObject({
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
      valueLimit: "0",
      identity: intent.agentIdentity.ensName
    });
    expect(typedDataHash(typedData)).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it("renders a deterministic ClearIntent approval preview with required authority fields", () => {
    const preview = renderApprovalPreview(intent, { auditBundleUri: "0g://audit-bundle" });
    const text = renderApprovalPreviewText(preview);

    expect(preview.claimLevel).toBe("eip712-local-fixture");
    expect(preview.displayStatus).toBe("app_preview_only");
    expect(preview.fields.map((field) => field.key)).toEqual(APPROVAL_FIELD_MAP.map((field) => field.key));
    expect(text).toContain("Intent hash: 0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    expect(text).toContain(`Policy hash: ${intent.policy.policyHash}`);
    expect(text).toContain(`Signer: ${intent.authority.signer}`);
    expect(text).toContain(`Executor: ${intent.authority.executor}`);
    expect(text).toContain(`Chain ID: ${intent.action.chainId}`);
    expect(text).toContain("0g://audit-bundle");
    expect(preview.warnings).toEqual(expect.arrayContaining(["wallet_display_unverified", "vendor_clear_signing_not_approved"]));
  });

  it("creates deterministic fixture signature evidence compatible with core signature evidence", () => {
    const typedData = buildClearIntentTypedData(intent);
    const fixture = createFixtureSignatureEvidence(typedData);
    const again = createFixtureSignatureEvidence(typedData);
    const coreEvidence = toCoreSignatureEvidence(fixture);
    const lifecycle = advanceIntentLifecycle(intent, { signature: coreEvidence });

    expect(fixture).toEqual(again);
    expect(fixture.claimLevel).toBe("signer-local-fixture");
    expect(fixture.signature).toMatch(/^0x[a-f0-9]{130}$/);
    expect(coreEvidence).toEqual({
      signer: intent.authority.signer,
      signature: fixture.signature
    });
    expect(lifecycle.ok).toBe(true);
    if (lifecycle.ok) {
      expect(lifecycle.value.lifecycleState).toBe("signed");
    }
  });

  it("builds conditional review prompts for thresholded signer review", () => {
    const prompts = buildConditionalReviewPrompts({
      valueLimit: "50",
      valueThreshold: "10",
      riskSeverity: "high",
      executor: intent.authority.executor,
      knownExecutors: [],
      auditWriteStatus: "degraded",
      policyHash: intent.policy.policyHash,
      previousPolicyHash: "0x9999999999999999999999999999999999999999999999999999999999999999"
    });

    expect(prompts.map((prompt) => prompt.code)).toEqual([
      "value_threshold",
      "high_risk",
      "new_executor",
      "degraded_audit_write",
      "policy_change"
    ]);
  });

  it("generates and validates local ERC-7730 metadata from the preview field map", () => {
    const metadata = generateLocalErc7730Metadata(intent);
    const validation = validateLocalErc7730Metadata(metadata, intent);
    const again = generateLocalErc7730Metadata(intent);

    expect(metadata).toEqual(again);
    expect(metadata.claimLevel).toBe("erc7730-local-metadata");
    expect(metadata.metadataHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(metadata.display.fields.map((field) => field.path)).toEqual(APPROVAL_FIELD_MAP.map((field) => field.key));
    expect(metadata.limitations).toEqual(expect.arrayContaining(["No secure-device display evidence.", "No vendor-approved Clear Signing claim."]));
    expect(validation.ok).toBe(true);
  });

  it("prepares only eth_signTypedData_v4 request shape and typed provider issue codes for injected wallets", () => {
    const typedData = buildClearIntentTypedData(intent);
    const request = buildEthSignTypedDataV4Request(intent.authority.signer, typedData);
    const status = getInjectedWalletRequestStatus();

    expect(request.method).toBe("eth_signTypedData_v4");
    expect(request.params[0]).toBe(intent.authority.signer);
    expect(JSON.parse(request.params[1])).toMatchObject({ primaryType: "ClearIntentAgentIntent" });
    expect(status.readyForOperatorTest).toBe(true);
    expect(status.softwareWalletTested).toBe(false);
    expect(mapInjectedWalletError({ code: 4001 }).code).toBe("user_rejected");
    expect(mapInjectedWalletError({ code: 4100 }).code).toBe("unauthorized");
    expect(mapInjectedWalletError({ code: 4200 }).code).toBe("unsupported_method");
    expect(mapInjectedWalletError({ code: 4900 }).code).toBe("disconnected");
    expect(mapInjectedWalletError({ code: 4901 }).code).toBe("chain_disconnected");
  });
});
