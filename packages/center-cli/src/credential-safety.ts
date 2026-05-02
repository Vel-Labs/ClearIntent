import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getOperatorSecretsFilePath } from "./env";

export type CredentialCheckStatus = "pass" | "warn" | "fail";

export type CredentialSafetyCheck = {
  id: string;
  label: string;
  status: CredentialCheckStatus;
  detail: string;
};

export type CredentialSafetyStatus = {
  ok: boolean;
  liveReady: boolean;
  liveWritesEnabled: boolean;
  secretsPrinted: false;
  envFiles: {
    exampleExists: boolean;
    localExists: boolean;
    dotEnvExists: boolean;
    operatorSecretsConfigured: boolean;
    operatorSecretsExists: boolean;
    repoLocalSecretKeys: string[];
    trackedSensitiveEnvFiles: string[];
  };
  configured: {
    zeroGProviderMode?: string;
    zeroGEvmRpc: boolean;
    zeroGIndexerRpc: boolean;
    zeroGStorageMode?: string;
    zeroGWalletAddress: "present" | "missing" | "invalid";
    zeroGPrivateKey: "present" | "missing" | "invalid";
    zeroGLiveWrites: boolean;
    zeroGRequireProof: boolean;
  };
  checks: CredentialSafetyCheck[];
  blockingReasons: string[];
  warnings: string[];
  nextActions: string[];
};

const envKeys = {
  providerMode: "ZERO_G_PROVIDER_MODE",
  evmRpc: "ZERO_G_EVM_RPC",
  indexerRpc: "ZERO_G_INDEXER_RPC",
  storageMode: "ZERO_G_STORAGE_MODE",
  walletAddress: "ZERO_G_WALLET_ADDRESS",
  privateKey: "ZERO_G_PRIVATE_KEY",
  liveWrites: "ZERO_G_ENABLE_LIVE_WRITES",
  requireProof: "ZERO_G_REQUIRE_PROOF"
} as const;

const repoLocalSecretKeys = ["ZERO_G_PRIVATE_KEY", "KEEPERHUB_API_TOKEN", "PRIVATE_EVM_RPC_URL"] as const;

export function getCredentialSafetyStatus(cwd = process.cwd(), env: NodeJS.ProcessEnv = process.env): CredentialSafetyStatus {
  const dotEnvExists = existsSync(path.join(cwd, ".env"));
  const localExists = existsSync(path.join(cwd, ".env.local"));
  const exampleExists = existsSync(path.join(cwd, ".env.example"));
  const operatorSecretsPath = getOperatorSecretsFilePath(cwd, env);
  const operatorSecretsExists = operatorSecretsPath !== undefined && existsSync(operatorSecretsPath);
  const gitignore = readFileIfExists(path.join(cwd, ".gitignore"));
  const repoLocalSecretAssignments = findRepoLocalSecretAssignments(cwd);
  const trackedSensitiveEnvFiles = trackedEnvFiles(cwd);
  const configured = buildConfigured(env);

  const checks: CredentialSafetyCheck[] = [
    {
      id: "env-example",
      label: ".env.example",
      status: exampleExists ? "pass" : "fail",
      detail: exampleExists ? ".env.example exists as the tracked template." : ".env.example is missing."
    },
    {
      id: "env-local",
      label: ".env.local",
      status: localExists ? "pass" : "warn",
      detail: localExists
        ? ".env.local exists locally for runtime config. Secret values are not printed."
        : ".env.local is missing. Copy .env.example to .env.local for runtime config if needed."
    },
    {
      id: "operator-secrets-file",
      label: "operator secrets file",
      status: operatorSecretsExists ? "pass" : "warn",
      detail: operatorSecretsExists
        ? "External operator secrets file exists. Secret values are not printed."
        : "External operator secrets file is missing; live secret-backed checks are not ready."
    },
    {
      id: "repo-local-secrets",
      label: "repo-local secret values",
      status: repoLocalSecretAssignments.length === 0 ? "pass" : "fail",
      detail:
        repoLocalSecretAssignments.length === 0
          ? "No non-empty secret keys were found in repo-local env files."
          : `Move these secret keys out of repo-local env files: ${repoLocalSecretAssignments.join(", ")}.`
    },
    {
      id: "gitignore-env",
      label: "env gitignore",
      status: gitignoreIgnoresEnv(gitignore) ? "pass" : "fail",
      detail: gitignoreIgnoresEnv(gitignore)
        ? ".gitignore ignores .env and .env.* while allowing .env.example."
        : ".gitignore does not clearly protect local env files."
    },
    {
      id: "tracked-env",
      label: "tracked env files",
      status: trackedSensitiveEnvFiles.length === 0 ? "pass" : "fail",
      detail:
        trackedSensitiveEnvFiles.length === 0
          ? "No sensitive env files are tracked by git."
          : `Sensitive env files are tracked: ${trackedSensitiveEnvFiles.join(", ")}.`
    },
    {
      id: "dot-env",
      label: ".env usage",
      status: dotEnvExists ? "warn" : "pass",
      detail: dotEnvExists
        ? ".env exists. Prefer .env.local for machine-specific secrets."
        : ".env is absent; .env.local remains the preferred local secret file."
    },
    {
      id: "zerog-private-key",
      label: "0G private key",
      status: configured.zeroGPrivateKey === "invalid" ? "fail" : configured.zeroGPrivateKey === "present" ? "pass" : "warn",
      detail:
        configured.zeroGPrivateKey === "present"
          ? "ZERO_G_PRIVATE_KEY is present and was not printed."
          : configured.zeroGPrivateKey === "invalid"
            ? "ZERO_G_PRIVATE_KEY is present but does not look like a 32-byte hex key."
            : "ZERO_G_PRIVATE_KEY is missing; live 0G smoke is blocked."
    },
    {
      id: "zerog-wallet",
      label: "0G wallet address",
      status: configured.zeroGWalletAddress === "invalid" ? "fail" : configured.zeroGWalletAddress === "present" ? "pass" : "warn",
      detail:
        configured.zeroGWalletAddress === "present"
          ? "ZERO_G_WALLET_ADDRESS is present and was not printed."
          : configured.zeroGWalletAddress === "invalid"
            ? "ZERO_G_WALLET_ADDRESS is present but invalid."
            : "ZERO_G_WALLET_ADDRESS is missing; add it for audit clarity before live smoke."
    },
    {
      id: "zerog-rpc",
      label: "0G endpoints",
      status: configured.zeroGEvmRpc && configured.zeroGIndexerRpc ? "pass" : "warn",
      detail:
        configured.zeroGEvmRpc && configured.zeroGIndexerRpc
          ? "0G EVM RPC and indexer RPC are configured."
          : "ZERO_G_EVM_RPC or ZERO_G_INDEXER_RPC is missing; live 0G smoke is not ready."
    },
    {
      id: "live-writes",
      label: "live write gate",
      status: configured.zeroGLiveWrites ? "warn" : "pass",
      detail: configured.zeroGLiveWrites
        ? "ZERO_G_ENABLE_LIVE_WRITES=true. Only proceed if the operator intends to run live/testnet uploads."
        : "ZERO_G_ENABLE_LIVE_WRITES is false; live uploads remain gated."
    }
  ];

  const blockingReasons = checks.filter((check) => check.status === "fail").map((check) => check.id);
  const warnings = checks.filter((check) => check.status === "warn").map((check) => check.id);
  const liveReady =
    blockingReasons.length === 0 &&
    configured.zeroGPrivateKey === "present" &&
    configured.zeroGWalletAddress === "present" &&
    configured.zeroGEvmRpc &&
    configured.zeroGIndexerRpc;

  return {
    ok: blockingReasons.length === 0,
    liveReady,
    liveWritesEnabled: configured.zeroGLiveWrites,
    secretsPrinted: false,
    envFiles: {
      exampleExists,
      localExists,
      dotEnvExists,
      operatorSecretsConfigured: operatorSecretsPath !== undefined,
      operatorSecretsExists,
      repoLocalSecretKeys: repoLocalSecretAssignments,
      trackedSensitiveEnvFiles
    },
    configured,
    checks,
    blockingReasons,
    warnings,
    nextActions: nextActions(liveReady, configured.zeroGLiveWrites)
  };
}

function buildConfigured(env: NodeJS.ProcessEnv): CredentialSafetyStatus["configured"] {
  const privateKey = nonEmpty(env[envKeys.privateKey]);
  const walletAddress = nonEmpty(env[envKeys.walletAddress]);
  return {
    zeroGProviderMode: nonEmpty(env[envKeys.providerMode]),
    zeroGEvmRpc: nonEmpty(env[envKeys.evmRpc]) !== undefined,
    zeroGIndexerRpc: nonEmpty(env[envKeys.indexerRpc]) !== undefined,
    zeroGStorageMode: nonEmpty(env[envKeys.storageMode]),
    zeroGWalletAddress:
      walletAddress === undefined ? "missing" : /^0x[a-fA-F0-9]{40}$/.test(walletAddress) ? "present" : "invalid",
    zeroGPrivateKey:
      privateKey === undefined ? "missing" : isEvmPrivateKey(privateKey) ? "present" : "invalid",
    zeroGLiveWrites: parseBoolean(env[envKeys.liveWrites]),
    zeroGRequireProof: parseBoolean(env[envKeys.requireProof])
  };
}

function isEvmPrivateKey(value: string): boolean {
  return /^(0x)?[a-fA-F0-9]{64}$/.test(value);
}

function nextActions(liveReady: boolean, liveWritesEnabled: boolean): string[] {
  if (!liveReady) {
    return [
      "Copy .env.example to .env.local if needed.",
      "Create ~/.clearintent/clearintent.secrets.env from operator-secrets/clearintent.secrets.env.example.",
      "Add the 0G testnet wallet address and private key only to the external operator secrets file.",
      "Fund the 0G testnet wallet before live smoke.",
      "Keep ZERO_G_ENABLE_LIVE_WRITES=false until ready to upload."
    ];
  }
  if (!liveWritesEnabled) {
    return [
      "Run memory live-status to confirm readiness.",
      "Set ZERO_G_ENABLE_LIVE_WRITES=true only when intentionally running memory live-smoke.",
      "Run memory live-smoke and record rootHash/txHash without printing secrets."
    ];
  }
  return [
    "Live writes are enabled. Run memory live-smoke only if intentional.",
    "After smoke, set ZERO_G_ENABLE_LIVE_WRITES=false again unless continuing live tests.",
    "Record rootHash/txHash and update the relevant audit."
  ];
}

function readFileIfExists(absolutePath: string): string {
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
}

function gitignoreIgnoresEnv(content: string): boolean {
  return content.includes(".env") && content.includes(".env.*") && content.includes("!.env.example");
}

function trackedEnvFiles(cwd: string): string[] {
  try {
    const stdout = execFileSync("git", ["ls-files", "--", ".env", ".env.local", ".env.*", "operator-secrets/*.env"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line !== ".env.example" && !line.endsWith(".example"));
  } catch {
    return [];
  }
}

function findRepoLocalSecretAssignments(cwd: string): string[] {
  const keys = new Set<string>();
  for (const file of [".env", ".env.local"]) {
    const content = readFileIfExists(path.join(cwd, file));
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith("#")) {
        continue;
      }
      const separator = trimmed.indexOf("=");
      if (separator === -1) {
        continue;
      }
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (repoLocalSecretKeys.includes(key as (typeof repoLocalSecretKeys)[number]) && value.length > 0) {
        keys.add(key);
      }
    }
  }
  return Array.from(keys).sort();
}

function parseBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === "true";
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}
