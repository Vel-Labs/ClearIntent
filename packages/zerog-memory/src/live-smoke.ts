import { stableStringify } from "../../core/src";
import type { CenterMemoryStatus, StorageIssue } from "./types";
import { loadZeroGLiveConfig } from "./live-config";

export async function getZeroGLiveSmokeStatus(env: NodeJS.ProcessEnv = process.env): Promise<CenterMemoryStatus> {
  const readiness = loadZeroGLiveConfig(env);
  if (readiness.issues.length > 0) {
    return blockedSmokeStatus(readiness.issues);
  }

  const privateKey = normalizePrivateKey(env.ZERO_G_PRIVATE_KEY);
  if (privateKey === undefined || privateKey.length === 0) {
    return blockedSmokeStatus([issue("missing_credentials", "ZERO_G_PRIVATE_KEY is not set.")]);
  }

  try {
    const [{ Indexer, MemData }, { ethers }] = await Promise.all([import("@0gfoundation/0g-ts-sdk"), import("ethers")]);
    const provider = new ethers.JsonRpcProvider(readiness.config.evmRpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(signer.address);

    if (balance === 0n) {
      return blockedSmokeStatus([issue("missing_tokens", "0G testnet wallet has zero balance.")]);
    }

    const payload = stableStringify({
      schemaVersion: "clearintent.zerog-live-smoke.v1",
      createdAt: new Date().toISOString(),
      purpose: "Phase 2B readiness upload/readback smoke test"
    });
    const bytes = Uint8Array.from(Buffer.from(payload, "utf8"));
    const file = new MemData(bytes);
    const [tree, treeError] = await file.merkleTree();
    if (treeError !== null || tree === null) {
      return blockedSmokeStatus([issue("live_upload_failed", treeError?.message ?? "Could not compute 0G file root.")]);
    }

    const indexer = new Indexer(readiness.config.indexerRpcUrl);
    const [upload, uploadError] = await indexer.upload(file, readiness.config.evmRpcUrl, signer);
    if (uploadError !== null) {
      return blockedSmokeStatus([issue("live_upload_failed", uploadError.message)]);
    }

    const rootHash = "rootHash" in upload ? upload.rootHash : upload.rootHashes[0];
    const txHash = "txHash" in upload ? upload.txHash : upload.txHashes[0];
    if (rootHash === undefined || txHash === undefined) {
      return blockedSmokeStatus([issue("live_upload_failed", "0G upload did not return rootHash and txHash.")]);
    }

    const proof = env.ZERO_G_REQUIRE_PROOF?.toLowerCase() === "true";
    const [blob, readError] = await indexer.downloadToBlob(rootHash, { proof });
    if (readError !== null) {
      return blockedSmokeStatus([issue("live_readback_failed", readError.message)]);
    }
    const downloaded = Buffer.from(await blob.arrayBuffer()).toString("utf8");
    if (downloaded !== payload) {
      return blockedSmokeStatus([issue("mismatched_hash", "Downloaded 0G payload did not match uploaded payload.")]);
    }

    return {
      ok: true,
      providerMode: "live",
      claimLevel: proof ? "0g-write-read-verified" : "0g-write-read",
      liveProvider: true,
      localOnly: false,
      summary: `0G live smoke succeeded. rootHash=${rootHash} txHash=${txHash}`,
      checks: [
        { id: "config", label: "Live config", status: "pass", detail: "0G live endpoints configured." },
        { id: "wallet", label: "Wallet credentials", status: "pass", detail: "Wallet signer loaded without printing secrets." },
        { id: "funds", label: "Testnet funds", status: "pass", detail: "Wallet balance is nonzero." },
        { id: "write", label: "Live write", status: "pass", detail: `Uploaded smoke artifact txHash=${txHash}.` },
        { id: "read", label: "Live read", status: "pass", detail: `Read back smoke artifact rootHash=${rootHash}.` },
        {
          id: "hash",
          label: "Hash validation",
          status: "pass",
          detail: "Downloaded payload matched uploaded payload."
        },
        {
          id: "proof",
          label: "Live proof",
          status: proof ? "pass" : "degraded",
          detail: proof ? "Proof-enabled download was requested." : "Proof was not requested; set ZERO_G_REQUIRE_PROOF=true to test proof."
        }
      ],
      degradedReasons: proof ? [] : ["missing_proof"]
    };
  } catch (error) {
    return blockedSmokeStatus([issue("live_upload_failed", error instanceof Error ? error.message : String(error))]);
  }
}

function blockedSmokeStatus(issues: StorageIssue[]): CenterMemoryStatus {
  return {
    ok: false,
    providerMode: "live",
    claimLevel: "local-adapter",
    liveProvider: true,
    localOnly: false,
    summary: "0G live smoke is blocked or failed. No stronger live claim is made.",
    checks: [
      { id: "config", label: "Live config", status: "degraded", detail: "See degraded reasons." },
      { id: "write", label: "Live write", status: "fail", detail: "No successful live upload is recorded." },
      { id: "read", label: "Live read", status: "degraded", detail: "No successful live readback is recorded." },
      { id: "proof", label: "Live proof", status: "degraded", detail: "No live proof is recorded." }
    ],
    degradedReasons: issues.map((item) => item.code)
  };
}

function issue(code: StorageIssue["code"], message: string): StorageIssue {
  return {
    code,
    message,
    artifact: {
      family: "audit-bundle"
    }
  };
}

function normalizePrivateKey(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (trimmed === undefined || trimmed.length === 0) {
    return undefined;
  }
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}
