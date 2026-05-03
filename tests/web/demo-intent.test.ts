import { describe, expect, it } from "vitest";
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

describe("demo intent previews", () => {
  it("renders a meaningful transfer preview without submitting a transaction", () => {
    const intent = buildDemoIntent({
      setup,
      destination: "0x0000000000000000000000000000000000000abc",
      renderCount: 1
    });

    expect(intent.actionType).toBe("demo-native-transfer");
    expect(intent.mode).toBe("simulation-only");
    expect(intent.transfer.from).toBe(setup.agentAccount);
    expect(intent.transfer.to).toBe("0x0000000000000000000000000000000000000abc");
    expect(intent.transfer.amount).toMatch(/^0\.00[0-9]{4}$/);
    expect(BigInt(intent.transfer.valueWei)).toBeGreaterThan(0n);
    expect(intent.controls.transactionSubmitted).toBe(false);
    expect(intent.eventPayload.transactionHash).toBe("none");
    expect(intent.humanSummary).toContain("send");
  });

  it("changes amount and nonce for each generated preview", () => {
    const first = buildDemoIntent({ setup, destination: "0x0000000000000000000000000000000000000abc", renderCount: 1 });
    const second = buildDemoIntent({ setup, destination: "0x0000000000000000000000000000000000000abc", renderCount: 2 });

    expect(first.transfer.amount).not.toBe(second.transfer.amount);
    expect(first.controls.nonce).toBe("demo-0001");
    expect(second.controls.nonce).toBe("demo-0002");
  });

  it("alternates simulated pass and fail event payloads for webhook testing", () => {
    const pass = buildDemoIntent({ setup, destination: "0x0000000000000000000000000000000000000abc", renderCount: 1 });
    const fail = buildDemoIntent({ setup, destination: "0x0000000000000000000000000000000000000abc", renderCount: 2 });

    expect(pass.evaluation.status).toBe("pass");
    expect(pass.eventPayload.shouldExecute).toBe(true);
    expect(pass.eventPayload.status).toBe("executed");
    expect(pass.eventPayload.eventType).toBe("clearintent.demo.execution.allowed");

    expect(fail.evaluation.status).toBe("fail");
    expect(fail.eventPayload.shouldExecute).toBe(false);
    expect(fail.eventPayload.status).toBe("failed");
    expect(fail.eventPayload.eventType).toBe("clearintent.demo.execution.blocked");
  });
});
