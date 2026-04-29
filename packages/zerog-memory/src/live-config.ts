import type { CenterMemoryStatus, MemoryCheckStatus, StorageIssue } from "./types";

export type ZeroGStorageMode = "standard" | "turbo";

export type ZeroGLiveConfig = {
  providerMode: "live";
  evmRpcUrl: string;
  indexerRpcUrl: string;
  storageMode: ZeroGStorageMode;
  walletAddress?: string;
  hasPrivateKey: boolean;
  liveWritesEnabled: boolean;
};

export type ZeroGLiveReadiness = {
  config: ZeroGLiveConfig;
  issues: StorageIssue[];
};

const defaultEvmRpcUrl = "https://evmrpc-testnet.0g.ai";
const defaultIndexerRpcUrl = "https://indexer-storage-testnet-turbo.0g.ai";

export function loadZeroGLiveConfig(env: NodeJS.ProcessEnv = process.env): ZeroGLiveReadiness {
  const evmRpcUrl = nonEmpty(env.ZERO_G_EVM_RPC) ?? defaultEvmRpcUrl;
  const indexerRpcUrl = nonEmpty(env.ZERO_G_INDEXER_RPC) ?? defaultIndexerRpcUrl;
  const storageMode = parseStorageMode(env.ZERO_G_STORAGE_MODE);
  const walletAddress = nonEmpty(env.ZERO_G_WALLET_ADDRESS);
  const privateKey = nonEmpty(env.ZERO_G_PRIVATE_KEY);
  const liveWritesEnabled = parseBoolean(env.ZERO_G_ENABLE_LIVE_WRITES);

  const issues: StorageIssue[] = [];
  if (privateKey === undefined) {
    issues.push(issue("missing_credentials", "ZERO_G_PRIVATE_KEY is not set. Live upload/read smoke tests are blocked."));
  }
  if (walletAddress !== undefined && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    issues.push(issue("missing_credentials", "ZERO_G_WALLET_ADDRESS is set but is not a valid EVM address."));
  }
  if (!liveWritesEnabled) {
    issues.push(issue("live_writes_disabled", "ZERO_G_ENABLE_LIVE_WRITES is not true. Live upload calls remain disabled."));
  }

  return {
    config: {
      providerMode: "live",
      evmRpcUrl,
      indexerRpcUrl,
      storageMode,
      walletAddress,
      hasPrivateKey: privateKey !== undefined,
      liveWritesEnabled
    },
    issues
  };
}

export async function getZeroGLiveReadinessStatus(env: NodeJS.ProcessEnv = process.env): Promise<CenterMemoryStatus> {
  const readiness = loadZeroGLiveConfig(env);
  const sdkIssue = await sdkAvailable();
  const issues = sdkIssue === undefined ? readiness.issues : [...readiness.issues, sdkIssue];
  const blockedCodes = new Set(issues.map((item) => item.code));

  const degradedReasons = [
    ...issues.map((item) => item.code),
    "missing_tokens",
    "live_write_unverified"
  ].filter(unique);

  return {
    ok: false,
    providerMode: "live",
    claimLevel: "local-adapter",
    liveProvider: true,
    localOnly: false,
    summary:
      issues.length === 0
        ? "0G live mode is configured for a smoke test, but no live write/read has been claimed yet."
        : "0G live mode is not ready for upload/readback; missing readiness items are listed.",
    checks: [
      {
        id: "config",
        label: "Live config",
        status: "pass",
        detail: `RPC and indexer endpoints configured for ${readiness.config.storageMode} mode.`
      },
      {
        id: "sdk",
        label: "0G SDK",
        status: statusFromIssue(blockedCodes, "sdk_unavailable"),
        detail:
          sdkIssue === undefined
            ? "0G TypeScript SDK package can be imported."
            : "0G TypeScript SDK package is not importable."
      },
      {
        id: "wallet",
        label: "Wallet credentials",
        status: readiness.config.hasPrivateKey ? "pass" : "fail",
        detail: readiness.config.hasPrivateKey
          ? "ZERO_G_PRIVATE_KEY is present locally and was not printed."
          : "ZERO_G_PRIVATE_KEY is missing."
      },
      {
        id: "funds",
        label: "Testnet funds",
        status: "degraded",
        detail: "Token balance is not checked without an explicit live network probe. Fund the wallet before smoke testing."
      },
      {
        id: "write",
        label: "Live write",
        status: readiness.config.liveWritesEnabled ? "degraded" : "fail",
        detail: readiness.config.liveWritesEnabled
          ? "Live writes are enabled but no upload has been executed in readiness mode."
          : "Live writes are disabled by ZERO_G_ENABLE_LIVE_WRITES."
      },
      {
        id: "read",
        label: "Live read",
        status: "degraded",
        detail: "No live artifact readback has been executed yet."
      },
      {
        id: "proof",
        label: "Live proof",
        status: "degraded",
        detail: "No live 0G proof has been requested or verified yet."
      }
    ],
    degradedReasons
  };
}

function parseStorageMode(value: string | undefined): ZeroGStorageMode {
  return value === "standard" ? "standard" : "turbo";
}

function parseBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === "true";
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}

async function sdkAvailable(): Promise<StorageIssue | undefined> {
  try {
    await import("@0gfoundation/0g-ts-sdk");
    return undefined;
  } catch {
    return issue("sdk_unavailable", "The @0gfoundation/0g-ts-sdk package could not be imported.");
  }
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

function statusFromIssue(codes: Set<StorageIssue["code"]>, code: StorageIssue["code"]): MemoryCheckStatus {
  return codes.has(code) ? "fail" : "pass";
}

function unique(value: string, index: number, values: string[]): boolean {
  return values.indexOf(value) === index;
}
