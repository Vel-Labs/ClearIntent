import { describe, expect, it } from "vitest";
import validIntent from "../../contracts/examples/valid-agent-intent.json";
import { type AgentIntent } from "../../packages/core/src";
import { buildClearIntentTypedData } from "../../packages/signer-adapter/src";
import { getAlchemyReadiness } from "../../apps/web/src/lib/alchemy";
import {
  connectEip1193Wallet,
  prepareClearIntentTypedDataRequest,
  readEip1193WalletState,
  requestClearIntentTypedDataSignature,
  type Eip1193Provider
} from "../../apps/web/src/lib/wallet";
import { buildPayloadPreviewViewModel } from "../../apps/web/src/components/payload-preview";
import { buildWalletStatusViewModel } from "../../apps/web/src/components/wallet";

const intent = validIntent as AgentIntent;

function providerFor(responses: Record<string, unknown>): Eip1193Provider & { requests: Array<{ method: string; params?: unknown }> } {
  const requests: Array<{ method: string; params?: unknown }> = [];
  return {
    isMetaMask: true,
    requests,
    async request(args) {
      requests.push({ method: args.method, params: args.params });
      const response = responses[args.method];
      if (response instanceof Error) {
        throw response;
      }
      return response;
    }
  };
}

describe("web wallet adapter boundary", () => {
  it("connects through eth_requestAccounts and reads account/chain state", async () => {
    const provider = providerFor({
      eth_requestAccounts: [intent.authority.signer],
      eth_chainId: "0xaa36a7"
    });

    const state = await connectEip1193Wallet(provider);

    expect(provider.requests.map((request) => request.method)).toEqual(["eth_requestAccounts", "eth_chainId"]);
    expect(state.status).toBe("connected");
    expect(state.providerLabel).toBe("metamask");
    expect(state.account).toBe(intent.authority.signer);
    expect(state.chainId).toBe(11155111);
  });

  it("reads existing wallet state without requesting account access", async () => {
    const provider = providerFor({
      eth_accounts: [],
      eth_chainId: "0x1"
    });

    const state = await readEip1193WalletState(provider);

    expect(provider.requests.map((request) => request.method)).toEqual(["eth_accounts", "eth_chainId"]);
    expect(state.status).toBe("unconnected");
    expect(state.chainId).toBe(1);
  });

  it("prepares eth_signTypedData_v4 params from signer typed data without claiming wallet rendering", () => {
    const typedData = buildClearIntentTypedData(intent);
    const prepared = prepareClearIntentTypedDataRequest(typedData, intent.authority.signer, intent.action.chainId);

    expect(prepared.request.method).toBe("eth_signTypedData_v4");
    expect(prepared.request.params[0]).toBe(intent.authority.signer);
    expect(JSON.parse(prepared.request.params[1])).toMatchObject({ primaryType: "ClearIntentAgentIntent" });
    expect(prepared.evidence.evidenceKind).toBe("wallet-request-only");
    expect(prepared.evidence.walletRenderedPreviewProven).toBe(false);
    expect(prepared.evidence.signatureCaptured).toBe(false);
    expect(prepared.evidence.typedDataHash).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it("captures a request-only signature result and maps provider rejection", async () => {
    const typedData = buildClearIntentTypedData(intent);
    const provider = providerFor({
      eth_signTypedData_v4: "0x" + "1".repeat(130)
    });

    const result = await requestClearIntentTypedDataSignature(provider, typedData, intent.authority.signer, intent.action.chainId);

    expect(result.ok).toBe(true);
    expect(provider.requests[0]).toMatchObject({ method: "eth_signTypedData_v4" });
    if (result.ok) {
      expect(result.evidence.signatureCaptured).toBe(true);
      expect(result.evidence.walletRenderedPreviewProven).toBe(false);
    }
  });

  it("reports absent Alchemy configuration without throwing", () => {
    const readiness = getAlchemyReadiness({});

    expect(readiness.status).toBe("not-configured");
    expect(readiness.configured).toBe(false);
    expect(readiness.accountKitReady).toBe(false);
    expect(readiness.missing).toEqual(["chain", "apiKey"]);
  });

  it("builds wallet and payload preview view models with explicit proof boundaries", () => {
    const typedData = buildClearIntentTypedData(intent);
    const prepared = prepareClearIntentTypedDataRequest(typedData, intent.authority.signer, intent.action.chainId);
    const wallet = buildWalletStatusViewModel(
      {
        status: "connected",
        accounts: [intent.authority.signer],
        account: intent.authority.signer,
        chainId: intent.action.chainId,
        chainIdHex: "0xaa36a7",
        providerLabel: "metamask",
        issues: []
      },
      prepared.evidence
    );
    const preview = buildPayloadPreviewViewModel(typedData);

    expect(wallet.evidenceLabel).toContain("wallet-rendered preview unproven");
    expect(preview.typedDataJson).toContain("ClearIntentAgentIntent");
    expect(preview.warnings).toEqual(expect.arrayContaining(["Wallet-rendered field visibility requires operator-run evidence."]));
  });
});
