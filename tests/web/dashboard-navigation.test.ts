import { describe, expect, it } from "vitest";
import { buildNavItems, getDashboardAccessStage, pageAfterWalletConnect, resetStaleSetupStatus } from "../../apps/web/src/components/shell/dashboard-app";
import { buildBoundedEventRegistryContext } from "../../apps/web/src/lib/bounded-event-registry";
import type { AgentSetupDiscoveryRecord } from "../../apps/web/src/lib/setup-discovery";

describe("dashboard navigation gating", () => {
  it("shows only Overview before a parent wallet is connected", () => {
    const accessStage = getDashboardAccessStage(false, "not-started");

    expect(accessStage).toBe("public");
    expect(buildNavItems(accessStage).map((item) => item.id)).toEqual(["overview"]);
  });

  it("reveals the setup wizard after wallet connection", () => {
    const accessStage = getDashboardAccessStage(true, "in-progress");

    expect(accessStage).toBe("wallet-connected");
    expect(buildNavItems(accessStage).map((item) => item.id)).toEqual(["overview", "setup"]);
  });

  it("reveals operational pages only after setup completion", () => {
    const accessStage = getDashboardAccessStage(true, "complete");

    expect(accessStage).toBe("setup-complete");
    expect(buildNavItems(accessStage).map((item) => item.id)).toEqual([
      "overview",
      "setup",
      "provider-evidence",
      "intent-history",
      "human-intervention",
      "settings"
    ]);
  });

  it("returns completed operators to evidence after reconnecting a cached setup", () => {
    expect(pageAfterWalletConnect("complete")).toBe("provider-evidence");
    expect(pageAfterWalletConnect("in-progress")).toBe("setup");
  });

  it("does not keep stale complete status when a connected wallet has no matching setup", () => {
    expect(resetStaleSetupStatus("complete")).toBe("not-started");
    expect(pageAfterWalletConnect(resetStaleSetupStatus("complete"))).toBe("setup");
    expect(resetStaleSetupStatus("in-progress")).toBe("in-progress");
  });

  it("separates KeeperHub ingest from bounded user registry context", () => {
    const setup: AgentSetupDiscoveryRecord = {
      schemaVersion: 1,
      discoveryKey:
        "0xf7add17e99000000000000000000000000000000:0x8b1f1be3d0ab7c9b1180d66970fed3033b7ce720:vel2.agent.clearintent.eth",
      parentWallet: "0xf7add17e99000000000000000000000000000000",
      agentAccount: "0x8b1F1bE3D0ab7C9B1180d66970fed3033B7CE720",
      agentEnsName: "vel2.agent.clearintent.eth",
      status: "complete",
      policyHash: "0xpolicy",
      auditLatest: "0g://audit/latest",
      keeperHubRunId: "run-1",
      source: "browser-local",
      updatedAt: "2026-05-03T00:00:00.000Z"
    };

    const context = buildBoundedEventRegistryContext(undefined, setup);

    expect(context.ingest.endpoint).toBe("/api/events");
    expect(context.ingest.url).toBe("https://clearintent.xyz/api/events");
    expect(context.ingest.endpoint).not.toContain("0xf7add17e99");
    expect(context.registry.displayName).toBe("vel2-f7ad-8b1f");
    expect(context.registry.url).toBe("https://clearintent.xyz/api/events?registry=vel2-f7ad-8b1f");
    expect(context.registry.key).toBe(
      "0xf7add17e99000000000000000000000000000000:0x8b1f1be3d0ab7c9b1180d66970fed3033b7ce720:vel2.agent.clearintent.eth"
    );
    expect(context.delivery.userWebhookForwarding).toBe(false);
  });
});
