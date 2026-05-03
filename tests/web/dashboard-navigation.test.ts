import { describe, expect, it } from "vitest";
import { buildNavItems, getDashboardAccessStage, pageAfterWalletConnect } from "../../apps/web/src/components/shell/dashboard-app";

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
});
