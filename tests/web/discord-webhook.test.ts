import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../apps/web/src/app/api/integrations/discord/webhook/route";
import { buildDemoIntent } from "../../apps/web/src/lib/demo-intent";
import type { AgentSetupDiscoveryRecord } from "../../apps/web/src/lib/setup-discovery";

const setup: AgentSetupDiscoveryRecord = {
  schemaVersion: 1,
  discoveryKey: "0xparent:0xagent:vel2.agent.clearintent.eth",
  parentWallet: "0xf7add17e99000000000000000000000000000000",
  agentAccount: "0x8b1F1bE3D0ab7C9B1180d66970fed3033B7CE720",
  agentEnsName: "vel2.agent.clearintent.eth",
  status: "complete",
  policyHash: `0x${"d".repeat(64)}`,
  auditLatest: "0g://audit/latest",
  source: "browser-local",
  updatedAt: "2026-05-03T00:00:00.000Z"
};

describe("Discord webhook forwarding", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts a simulation-only demo event to an operator-provided Discord webhook", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const event = buildDemoIntent({ setup, destination: "0x0000000000000000000000000000000000000abc", renderCount: 1 }).eventPayload;

    const response = await POST(
      new Request("http://localhost/api/integrations/discord/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          webhookUrl: "https://discord.com/api/webhooks/123456789/demo_token",
          registryName: "vel2-f7ad-8b1f",
          event
        })
      })
    );
    const body = (await response.json()) as { delivered?: boolean; redactedWebhook?: string };

    expect(response.status).toBe(202);
    expect(body.delivered).toBe(true);
    expect(body.redactedWebhook).toBe("https://discord.com/api/webhooks/123456789/...");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://discord.com/api/webhooks/123456789/demo_token",
      expect.objectContaining({ method: "POST" })
    );
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(init.body)).toContain("simulation-only");
    expect(String(init.body)).not.toContain("demo_token");
  });

  it("rejects non-Discord webhook URLs before forwarding", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const event = buildDemoIntent({ setup, destination: "0x0000000000000000000000000000000000000abc", renderCount: 1 }).eventPayload;

    const response = await POST(
      new Request("http://localhost/api/integrations/discord/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          webhookUrl: "https://example.com/hook",
          registryName: "vel2-f7ad-8b1f",
          event
        })
      })
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
