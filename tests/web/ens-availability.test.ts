import { describe, expect, it } from "vitest";
import { isUsableAgentLabel, normalizeAgentLabel, toAgentEnsName } from "../../apps/web/src/lib/ens/names";
import { getEnsAvailabilityRpcUrl, getEnsAvailabilityRpcUrls } from "../../apps/web/src/lib/ens/availability";

describe("web ENS availability helpers", () => {
  it("normalizes agent labels before availability checks", () => {
    expect(normalizeAgentLabel(" Vel Crafting!! ")).toBe("velcrafting");
    expect(normalizeAgentLabel("--Agent-01--")).toBe("agent-01");
  });

  it("requires usable ENS labels before enabling checks", () => {
    expect(isUsableAgentLabel("ve")).toBe(false);
    expect(isUsableAgentLabel("velcrafting")).toBe(true);
    expect(isUsableAgentLabel("vel-crafting")).toBe(true);
    expect(isUsableAgentLabel("-velcrafting")).toBe(false);
  });

  it("builds ClearIntent agent subnames under the governed parent", () => {
    expect(toAgentEnsName("VelCrafting")).toBe("velcrafting.agent.clearintent.eth");
    expect(toAgentEnsName("")).toBe("agent.clearintent.eth");
  });

  it("prefers private server RPC configuration before public fallback", () => {
    expect(getEnsAvailabilityRpcUrl({ ENS_PROVIDER_RPC: "https://ens.example", PRIVATE_EVM_RPC_URL: "https://private.example" })).toBe(
      "https://ens.example"
    );
    expect(getEnsAvailabilityRpcUrl({ PRIVATE_EVM_RPC_URL: "https://private.example" })).toBe("https://private.example");
    expect(getEnsAvailabilityRpcUrls({ ENS_PROVIDER_RPC: "https://ens.example" })).toEqual(
      expect.arrayContaining(["https://ens.example", "https://ethereum-rpc.publicnode.com"])
    );
  });
});
