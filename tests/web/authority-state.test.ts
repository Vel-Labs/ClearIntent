import { describe, expect, it } from "vitest";
import { deriveAuthorityState } from "../../apps/web/src/lib/clearintent-state";
import {
  buildConfiguredAuthorityEvidence,
  buildDemoAuthorityEvidence,
  buildMissingAuthorityEvidence
} from "../../apps/web/src/lib/demo-evidence";
import { presentEvidence } from "../../apps/web/src/lib/evidence-model";

describe("Phase 6 authority dashboard state model", () => {
  it("derives unconnected when no parent wallet session exists", () => {
    const summary = deriveAuthorityState(buildMissingAuthorityEvidence());

    expect(summary.state).toBe("unconnected");
    expect(summary.connected).toBe(false);
    expect(summary.missingKinds).toContain("wallet");
  });

  it("derives configured without claiming frontend authority truth", () => {
    const evidence = buildConfiguredAuthorityEvidence({
      parentWalletAddress: "0x9999999999999999999999999999999999999999",
      chainId: 11155111,
      alchemyProjectIdPresent: true
    });
    const summary = deriveAuthorityState(evidence);

    expect(summary.state).toBe("configured");
    expect(summary.connected).toBe(true);
    expect(evidence.signer.data?.walletRenderedPreviewProven).toBe(false);
    expect(evidence.keeperhub.data?.authorityApprovalProvidedByKeeperHub).toBe(false);
    expect(Object.values(evidence).every((entry) => entry.frontendAuthority === false)).toBe(true);
  });

  it("derives demo only when every evidence entry is explicitly demo", () => {
    const evidence = buildDemoAuthorityEvidence();
    const summary = deriveAuthorityState(evidence);

    expect(summary.state).toBe("demo");
    expect(summary.demoKinds).toEqual(["wallet", "ens", "zerog", "keeperhub", "signer", "payload", "alchemy"]);
    expect(Object.values(evidence).every((entry) => entry.source === "demo-fixture")).toBe(true);
  });

  it("derives connected-unconfigured when only the parent wallet is present", () => {
    const evidence = buildMissingAuthorityEvidence();
    evidence.wallet = presentEvidence(
      "wallet",
      "Parent wallet",
      "Connected parent wallet session reported by the wallet provider.",
      "wallet-provider",
      { address: "0x9999999999999999999999999999999999999999", chainId: 11155111, connector: "eip1193" }
    );

    const summary = deriveAuthorityState(evidence);

    expect(summary.state).toBe("connected-unconfigured");
    expect(summary.connected).toBe(true);
  });

  it("derives degraded when a configured evidence source reports degraded reasons", () => {
    const evidence = buildConfiguredAuthorityEvidence({
      parentWalletAddress: "0x9999999999999999999999999999999999999999",
      chainId: 11155111,
      alchemyProjectIdPresent: true
    });
    evidence.keeperhub = presentEvidence(
      "keeperhub",
      "KeeperHub",
      "KeeperHub workflow evidence is degraded until transaction evidence appears.",
      "adapter",
      { claimLevel: "keeperhub-live-submitted", authorityApprovalProvidedByKeeperHub: false },
      ["missing_transaction_evidence"]
    );

    const summary = deriveAuthorityState(evidence);

    expect(summary.state).toBe("degraded");
    expect(summary.degradedKinds).toEqual(["keeperhub"]);
  });
});
