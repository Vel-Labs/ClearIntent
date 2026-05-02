import { ENS_IDENTITY_RECORD_KEYS, REQUIRED_ENS_IDENTITY_RECORDS } from "./record-keys";
import type {
  EnsIdentityIssue,
  EnsIdentityResult,
  EnsLiveConfig,
  EnsLiveReadStatus,
  EnsResolverAdapter,
  EnsResolverLookup,
  EnsResolverRecord,
  EnsTextRecords
} from "./types";

type EnsTextResolver = {
  getAddress?: () => Promise<string | null>;
  getText: (key: string) => Promise<string | null>;
};

type EnsProvider = {
  getResolver: (name: string) => Promise<EnsTextResolver | null>;
};

export type LiveEnsResolverOptions = EnsLiveConfig & {
  provider?: EnsProvider;
};

const defaultChainId = 1;
const defaultNetworkName = "mainnet";

export class LiveEnsResolver implements EnsResolverAdapter {
  readonly providerMode = "live" as const;
  readonly claimLevel = "ens-live-read" as const;

  private readonly config: EnsLiveConfig;
  private readonly provider?: EnsProvider;

  constructor(options: LiveEnsResolverOptions) {
    this.config = {
      providerMode: "live",
      chainId: options.chainId,
      networkName: options.networkName,
      rpcUrl: options.rpcUrl,
      ensName: options.ensName,
      expectedPolicyHash: options.expectedPolicyHash
    };
    this.provider = options.provider;
  }

  async resolveName(input: EnsResolverLookup): Promise<EnsIdentityResult<EnsResolverRecord>> {
    const ensName = normalizeName(input.ensName);
    if (!ensName) {
      return blocked("missing_name", "ENS name is required.");
    }

    const providerResult = await this.getProvider();
    if (!providerResult.ok) {
      return {
        ok: false,
        state: "blocked",
        issues: providerResult.issues
      };
    }

    try {
      const resolver = await providerResult.value.getResolver(ensName);
      if (resolver === null) {
        return blocked("missing_resolver", `No resolver is available for live ENS name: ${ensName}.`, ensName);
      }

      const textRecords: EnsTextRecords = {};
      for (const key of REQUIRED_ENS_IDENTITY_RECORDS) {
        const value = await resolver.getText(key);
        if (value !== null && value.trim().length > 0) {
          textRecords[key] = value;
        }
      }

      return {
        ok: true,
        state: "resolved",
        value: {
          ensName,
          address: await safeAddress(resolver),
          textRecords
        },
        issues: []
      };
    } catch (error) {
      return blocked("live_lookup_failed", error instanceof Error ? error.message : String(error), ensName);
    }
  }

  private async getProvider(): Promise<
    | {
        ok: true;
        value: EnsProvider;
      }
    | {
        ok: false;
        issues: EnsIdentityIssue[];
      }
  > {
    if (this.provider !== undefined) {
      return {
        ok: true,
        value: this.provider
      };
    }

    if (this.config.rpcUrl === undefined) {
      return {
        ok: false,
        issues: [
          {
            code: "live_config_missing",
            message: "ENS_PROVIDER_RPC, ENS_EVM_RPC, or PRIVATE_EVM_RPC_URL is required for live ENS lookup."
          }
        ]
      };
    }

    const { ethers } = await import("ethers");
    return {
      ok: true,
      value: new ethers.JsonRpcProvider(this.config.rpcUrl, providerNetwork(this.config))
    };
  }
}

export function loadEnsLiveConfig(env: NodeJS.ProcessEnv = process.env): EnsLiveConfig {
  return {
    providerMode: "live",
    rpcUrl: nonEmpty(env.ENS_PROVIDER_RPC) ?? nonEmpty(env.ENS_EVM_RPC) ?? nonEmpty(env.PRIVATE_EVM_RPC_URL),
    chainId: parseInteger(env.ENS_CHAIN_ID) ?? defaultChainId,
    networkName: nonEmpty(env.ENS_NETWORK) ?? defaultNetworkName,
    ensName: nonEmpty(env.ENS_NAME) ?? nonEmpty(env.CLEARINTENT_ENS_NAME),
    expectedPolicyHash: nonEmpty(env.ENS_EXPECTED_POLICY_HASH) ?? nonEmpty(env.CLEARINTENT_EXPECTED_POLICY_HASH)
  };
}

export async function getEnsLiveReadStatus(
  env: NodeJS.ProcessEnv = process.env,
  provider?: EnsProvider
): Promise<EnsLiveReadStatus> {
  const config = loadEnsLiveConfig(env);
  const checks: EnsLiveReadStatus["checks"] = [];
  const degradedReasons: string[] = [];
  const blockingReasons: string[] = [];

  checks.push({
    id: "config",
    label: "Live ENS config",
    status: config.rpcUrl === undefined || config.ensName === undefined ? "blocking" : "pass",
    detail:
      config.rpcUrl === undefined
        ? "ENS_PROVIDER_RPC, ENS_EVM_RPC, or PRIVATE_EVM_RPC_URL is missing."
        : config.ensName === undefined
          ? "ENS_NAME is missing."
          : `ENS live lookup configured for ${config.ensName} on ${config.networkName} (${config.chainId}).`
  });
  if (config.rpcUrl === undefined || config.ensName === undefined) {
    blockingReasons.push("live_config_missing");
  }

  if (blockingReasons.length > 0 || config.ensName === undefined) {
    return status("ens-local-fixture", config.ensName, undefined, {}, checks, degradedReasons, blockingReasons);
  }

  const resolver = new LiveEnsResolver({ ...config, provider });
  const result = await resolver.resolveName({ ensName: config.ensName, network: config.networkName });
  if (!result.ok) {
    blockingReasons.push(...result.issues.map((issue) => issue.code));
    checks.push(issueCheck("resolver", "Live ENS resolver", result.issues));
    return status("ens-local-fixture", config.ensName, undefined, {}, checks, degradedReasons, blockingReasons);
  }

  checks.push({
    id: "resolver",
    label: "Live ENS resolver",
    status: "pass",
    detail: "Live ENS resolver lookup succeeded."
  });

  const missing = REQUIRED_ENS_IDENTITY_RECORDS.filter((key) => result.value.textRecords[key] === undefined);
  if (missing.length > 0) {
    degradedReasons.push(...missing.map((key) => `missing_${key}`));
    checks.push({
      id: "records",
      label: "Required text records",
      status: "degraded",
      detail: `Missing required ENS text records: ${missing.join(", ")}.`
    });
  } else {
    checks.push({
      id: "records",
      label: "Required text records",
      status: "pass",
      detail: "Required ClearIntent ENS text records are present."
    });
  }

  const policyHash = result.value.textRecords[ENS_IDENTITY_RECORD_KEYS.policyHash];
  if (config.expectedPolicyHash !== undefined && policyHash !== undefined && config.expectedPolicyHash !== policyHash) {
    blockingReasons.push("policy_hash_mismatch");
    checks.push({
      id: "policy-hash",
      label: "Policy hash binding",
      status: "blocking",
      detail: "ENS policy.hash does not match ENS_EXPECTED_POLICY_HASH."
    });
  } else if (config.expectedPolicyHash !== undefined && policyHash !== undefined) {
    checks.push({
      id: "policy-hash",
      label: "Policy hash binding",
      status: "pass",
      detail: "ENS policy.hash matches ENS_EXPECTED_POLICY_HASH."
    });
  } else {
    degradedReasons.push("policy_hash_not_bound");
    checks.push({
      id: "policy-hash",
      label: "Policy hash binding",
      status: "degraded",
      detail: "No expected policy hash was configured for live binding comparison."
    });
  }

  const claimLevel =
    blockingReasons.length === 0 && missing.length === 0 && !degradedReasons.includes("policy_hash_not_bound")
      ? "ens-live-bound"
      : "ens-live-read";
  return status(claimLevel, result.value.ensName, result.value.address, result.value.textRecords, checks, degradedReasons, blockingReasons);
}

function status(
  claimLevel: EnsLiveReadStatus["claimLevel"],
  ensName: string | undefined,
  address: string | undefined,
  records: EnsTextRecords,
  checks: EnsLiveReadStatus["checks"],
  degradedReasons: string[],
  blockingReasons: string[]
): EnsLiveReadStatus {
  return {
    ok: blockingReasons.length === 0,
    claimLevel,
    providerMode: "live",
    liveProvider: true,
    ensName,
    address,
    records,
    summary:
      blockingReasons.length > 0
        ? "Live ENS lookup is blocked."
        : claimLevel === "ens-live-bound"
          ? "Live ENS lookup and policy-hash binding succeeded."
          : "Live ENS lookup succeeded with degraded or unbound records.",
    checks,
    degradedReasons: unique(degradedReasons),
    blockingReasons: unique(blockingReasons)
  };
}

function issueCheck(id: string, label: string, issues: EnsIdentityIssue[]): EnsLiveReadStatus["checks"][number] {
  return {
    id,
    label,
    status: "blocking",
    detail: issues.map((issue) => `${issue.code}: ${issue.message}`).join("; ")
  };
}

function blocked(code: EnsIdentityIssue["code"], message: string, ensName?: string): EnsIdentityResult<EnsResolverRecord> {
  return {
    ok: false,
    state: "blocked",
    issues: [{ code, message, ensName }]
  };
}

async function safeAddress(resolver: EnsTextResolver): Promise<string | undefined> {
  try {
    return (await resolver.getAddress?.()) ?? undefined;
  } catch {
    return undefined;
  }
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}

function parseInteger(value: string | undefined): number | undefined {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function providerNetwork(config: EnsLiveConfig): string | { chainId: number; name: string } {
  if (config.chainId === defaultChainId) {
    return "mainnet";
  }

  return {
    chainId: config.chainId,
    name: config.networkName
  };
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
