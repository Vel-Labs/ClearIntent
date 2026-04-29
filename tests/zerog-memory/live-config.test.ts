import { describe, expect, it } from "vitest";
import { getZeroGLiveReadinessStatus, loadZeroGLiveConfig } from "../../packages/zerog-memory/src";

describe("0G live readiness config", () => {
  it("defaults to Galileo testnet endpoints without exposing credentials", () => {
    const readiness = loadZeroGLiveConfig({});

    expect(readiness.config).toMatchObject({
      providerMode: "live",
      evmRpcUrl: "https://evmrpc-testnet.0g.ai",
      indexerRpcUrl: "https://indexer-storage-testnet-turbo.0g.ai",
      storageMode: "turbo",
      hasPrivateKey: false,
      liveWritesEnabled: false
    });
    expect(readiness.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["missing_credentials", "live_writes_disabled"])
    );
    expect(JSON.stringify(readiness)).not.toContain("1111111111111111111111111111111111111111111111111111111111111111");
  });

  it("accepts local env configuration but keeps live claim level unadvanced", async () => {
    const status = await getZeroGLiveReadinessStatus({
      ZERO_G_PRIVATE_KEY: "0x1111111111111111111111111111111111111111111111111111111111111111",
      ZERO_G_WALLET_ADDRESS: "0x1111111111111111111111111111111111111111",
      ZERO_G_ENABLE_LIVE_WRITES: "true"
    });

    expect(status.providerMode).toBe("live");
    expect(status.claimLevel).toBe("local-adapter");
    expect(status.liveProvider).toBe(true);
    expect(status.localOnly).toBe(false);
    expect(status.degradedReasons).toEqual(expect.arrayContaining(["missing_tokens", "live_write_unverified"]));
  });
});
