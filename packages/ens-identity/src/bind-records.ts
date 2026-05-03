import { ENS_IDENTITY_RECORD_KEYS } from "./record-keys";
import { loadEnsLiveConfig } from "./live-resolver";
import type { EnsIdentityRecordKey } from "./record-keys";
import type { ContractRunner } from "ethers";

export type EnsBindingRecordValues = Record<EnsIdentityRecordKey, string>;

export type EnsTextRecordWrite = {
  key: EnsIdentityRecordKey;
  value: string;
};

export type EnsResolverMulticall = {
  ensName: string;
  node: string;
  resolverAddress: string;
  records: EnsTextRecordWrite[];
  to: string;
  value: "0";
  data: string;
  method: "multicall(bytes[])";
  summary: string;
};

export type EnsBindingPreparationStatus = {
  ok: boolean;
  ensName?: string;
  resolverAddress?: string;
  tx?: EnsResolverMulticall;
  records?: EnsBindingRecordValues;
  blockingReasons: string[];
  degradedReasons: string[];
  summary: string;
  checks: {
    id: "config" | "resolver" | "records" | "multicall" | "authorization";
    label: string;
    status: "pass" | "blocking" | "degraded";
    detail: string;
  }[];
};

export type EnsBindingSubmitStatus = EnsBindingPreparationStatus & {
  transactionHash?: string;
  blockNumber?: number;
};

type EnsResolverWithAddress = {
  address?: string;
};

type EnsProvider = {
  getResolver: (name: string) => Promise<EnsResolverWithAddress | null>;
};

export async function getEnsBindingPreparationStatus(
  env: NodeJS.ProcessEnv = process.env,
  provider?: EnsProvider
): Promise<EnsBindingPreparationStatus> {
  const config = loadEnsLiveConfig(env);
  const ensName = config.ensName;
  const records = loadBindingRecords(env);
  const blockingReasons: string[] = [];
  const checks: EnsBindingPreparationStatus["checks"] = [];

  checks.push({
    id: "config",
    label: "ENS binding config",
    status: ensName === undefined ? "blocking" : "pass",
    detail: ensName === undefined ? "ENS_NAME or CLEARINTENT_ENS_NAME is missing." : `Preparing ENS binding for ${ensName}.`
  });
  if (ensName === undefined) {
    blockingReasons.push("missing_ens_name");
  }

  const missingRecords = missingBindingRecords(records);
  checks.push({
    id: "records",
    label: "ENS binding records",
    status: missingRecords.length > 0 ? "blocking" : "pass",
    detail:
      missingRecords.length > 0
        ? `Missing ENS binding record values: ${missingRecords.join(", ")}.`
        : "All ClearIntent ENS binding record values are configured."
  });
  blockingReasons.push(...missingRecords.map((record) => `missing_${record}`));

  if (blockingReasons.length > 0 || ensName === undefined || records === undefined) {
    return blockedStatus(ensName, undefined, records, checks, blockingReasons);
  }

  const resolverAddress = nonEmpty(env.ENS_RESOLVER_ADDRESS) ?? (await resolveResolverAddress(config.rpcUrl, ensName, provider));
  checks.push({
    id: "resolver",
    label: "ENS resolver",
    status: resolverAddress === undefined ? "blocking" : "pass",
    detail:
      resolverAddress === undefined
        ? "ENS resolver address is missing; set ENS_RESOLVER_ADDRESS or configure a live ENS RPC."
        : `Resolver address available: ${resolverAddress}.`
  });
  if (resolverAddress === undefined) {
    return blockedStatus(ensName, undefined, records, checks, ["missing_resolver"]);
  }

  const tx = await prepareEnsTextRecordMulticall({ ensName, resolverAddress, records });
  checks.push({
    id: "multicall",
    label: "Resolver multicall",
    status: "pass",
    detail: `Prepared one resolver multicall for ${tx.records.length} ClearIntent text records.`
  });

  return {
    ok: true,
    ensName,
    resolverAddress,
    tx,
    records,
    blockingReasons: [],
    degradedReasons: [],
    summary: "ENS text-record multicall is prepared for parent-wallet signature.",
    checks
  };
}

export async function sendEnsBindingRecords(env: NodeJS.ProcessEnv = process.env): Promise<EnsBindingSubmitStatus> {
  const prepared = await getEnsBindingPreparationStatus(env);
  const checks: EnsBindingSubmitStatus["checks"] = [...prepared.checks];
  const blockingReasons = [...prepared.blockingReasons];

  const liveWritesEnabled = parseBoolean(env.ENS_ENABLE_LIVE_WRITES) || parseBoolean(env.ENS_ENABLE_RECORD_WRITES);
  checks.push({
    id: "multicall",
    label: "ENS live write gate",
    status: liveWritesEnabled ? "pass" : "blocking",
    detail: liveWritesEnabled
      ? "ENS live record writes are explicitly enabled."
      : "ENS live record writes are disabled; set ENS_ENABLE_LIVE_WRITES=true only for intentional ENS updates."
  });
  if (!liveWritesEnabled) {
    blockingReasons.push("ens_live_writes_disabled");
  }

  const config = loadEnsLiveConfig(env);
  if (config.rpcUrl === undefined) {
    blockingReasons.push("missing_rpc_url");
  }

  const privateKey = normalizePrivateKey(env.ENS_SIGNER_PRIVATE_KEY);
  if (privateKey === undefined) {
    blockingReasons.push("missing_ens_signer_private_key");
  }

  if (prepared.tx === undefined || blockingReasons.length > 0 || config.rpcUrl === undefined || privateKey === undefined) {
    return {
      ...prepared,
      ok: false,
      checks,
      blockingReasons: [...new Set(blockingReasons)],
      summary: "ENS text-record multicall submission is blocked."
    };
  }

  try {
    const { ethers } = await import("ethers");
    const provider = new ethers.JsonRpcProvider(config.rpcUrl, "mainnet");
    const signer = new ethers.Wallet(privateKey, provider);
    const managerAddress = await resolveEnsManagerAddress(provider, prepared.ensName);
    const signerAddress = await signer.getAddress();
    const signerIsManager = managerAddress !== undefined && signerAddress.toLowerCase() === managerAddress.toLowerCase();
    checks.push({
      id: "authorization",
      label: "ENS signer authorization",
      status: signerIsManager ? "pass" : "blocking",
      detail: signerIsManager
        ? "ENS signer is the current manager/controller for the selected name."
        : `ENS signer ${signerAddress} is not the current manager/controller ${managerAddress ?? "unknown"}.`
    });
    if (!signerIsManager) {
      return {
        ...prepared,
        ok: false,
        checks,
        blockingReasons: ["ens_signer_not_manager"],
        degradedReasons: [],
        summary: "ENS text-record multicall submission is blocked because the signer does not control the selected ENS name."
      };
    }

    const tx = await signer.sendTransaction({
      to: prepared.tx.to,
      value: 0,
      data: prepared.tx.data
    });
    const receipt = await tx.wait();

    return {
      ...prepared,
      ok: true,
      checks,
      transactionHash: tx.hash,
      blockNumber: receipt?.blockNumber,
      blockingReasons: [],
      degradedReasons: receipt === null ? ["receipt_unavailable"] : [],
      summary: "ENS text-record multicall transaction was submitted."
    };
  } catch (error) {
    return {
      ...prepared,
      ok: false,
      checks,
      blockingReasons: ["ens_submit_failed"],
      degradedReasons: [],
      summary: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function prepareEnsTextRecordMulticall(input: {
  ensName: string;
  resolverAddress: string;
  records: EnsBindingRecordValues;
  address?: string;
}): Promise<EnsResolverMulticall> {
  const { ethers } = await import("ethers");
  const node = ethers.namehash(input.ensName);
  const resolverInterface = new ethers.Interface([
    "function setAddr(bytes32 node, address addr)",
    "function setText(bytes32 node, string key, string value)",
    "function multicall(bytes[] data) returns (bytes[] results)"
  ]);
  const writes = orderedRecordWrites(input.records);
  const calls = [
    ...(input.address === undefined ? [] : [resolverInterface.encodeFunctionData("setAddr", [node, input.address])]),
    ...writes.map((record) => resolverInterface.encodeFunctionData("setText", [node, record.key, record.value]))
  ];
  const data = resolverInterface.encodeFunctionData("multicall", [calls]);

  return {
    ensName: input.ensName,
    node,
    resolverAddress: input.resolverAddress,
    records: writes,
    to: input.resolverAddress,
    value: "0",
    data,
    method: "multicall(bytes[])",
    summary:
      input.address === undefined
        ? `Set ${writes.length} ClearIntent text records on ${input.ensName}.`
        : `Set the ETH address and ${writes.length} ClearIntent text records on ${input.ensName}.`
  };
}

export function loadBindingRecords(env: NodeJS.ProcessEnv = process.env): EnsBindingRecordValues | undefined {
  const records = {
    [ENS_IDENTITY_RECORD_KEYS.agentCard]: nonEmpty(env.CLEARINTENT_AGENT_CARD_URI) ?? nonEmpty(env.ENS_AGENT_CARD_URI),
    [ENS_IDENTITY_RECORD_KEYS.policyUri]:
      nonEmpty(env.CLEARINTENT_POLICY_URI) ??
      nonEmpty(env.CLEARINTENT_EXPECTED_POLICY_URI) ??
      nonEmpty(env.ENS_POLICY_URI),
    [ENS_IDENTITY_RECORD_KEYS.policyHash]:
      nonEmpty(env.CLEARINTENT_POLICY_HASH) ??
      nonEmpty(env.CLEARINTENT_EXPECTED_POLICY_HASH) ??
      nonEmpty(env.ENS_EXPECTED_POLICY_HASH),
    [ENS_IDENTITY_RECORD_KEYS.auditLatest]:
      nonEmpty(env.CLEARINTENT_AUDIT_LATEST) ??
      nonEmpty(env.CLEARINTENT_EXPECTED_AUDIT_URI) ??
      nonEmpty(env.ENS_AUDIT_LATEST),
    [ENS_IDENTITY_RECORD_KEYS.clearintentVersion]: nonEmpty(env.CLEARINTENT_VERSION) ?? "0.1.0"
  };

  return missingBindingRecords(records).length === 0 ? (records as EnsBindingRecordValues) : undefined;
}

function orderedRecordWrites(records: EnsBindingRecordValues): EnsTextRecordWrite[] {
  return [
    { key: ENS_IDENTITY_RECORD_KEYS.agentCard, value: records[ENS_IDENTITY_RECORD_KEYS.agentCard] },
    { key: ENS_IDENTITY_RECORD_KEYS.policyUri, value: records[ENS_IDENTITY_RECORD_KEYS.policyUri] },
    { key: ENS_IDENTITY_RECORD_KEYS.policyHash, value: records[ENS_IDENTITY_RECORD_KEYS.policyHash] },
    { key: ENS_IDENTITY_RECORD_KEYS.auditLatest, value: records[ENS_IDENTITY_RECORD_KEYS.auditLatest] },
    { key: ENS_IDENTITY_RECORD_KEYS.clearintentVersion, value: records[ENS_IDENTITY_RECORD_KEYS.clearintentVersion] }
  ];
}

function missingBindingRecords(records: Partial<EnsBindingRecordValues> | undefined): EnsIdentityRecordKey[] {
  if (records === undefined) {
    return Object.values(ENS_IDENTITY_RECORD_KEYS);
  }
  return Object.values(ENS_IDENTITY_RECORD_KEYS).filter((key) => nonEmpty(records[key]) === undefined);
}

async function resolveResolverAddress(
  rpcUrl: string | undefined,
  ensName: string,
  provider?: EnsProvider
): Promise<string | undefined> {
  const resolver = await getResolver(rpcUrl, ensName, provider);
  return nonEmpty(resolver?.address);
}

async function getResolver(
  rpcUrl: string | undefined,
  ensName: string,
  provider?: EnsProvider
): Promise<EnsResolverWithAddress | null> {
  if (provider !== undefined) {
    return provider.getResolver(ensName);
  }
  if (rpcUrl === undefined) {
    return null;
  }

  const { ethers } = await import("ethers");
  const jsonRpcProvider = new ethers.JsonRpcProvider(rpcUrl, "mainnet");
  return jsonRpcProvider.getResolver(ensName);
}

async function resolveEnsManagerAddress(provider: ContractRunner, ensName: string | undefined): Promise<string | undefined> {
  if (ensName === undefined) {
    return undefined;
  }

  const { ethers } = await import("ethers");
  const ensRegistryAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
  const nameWrapperAddress = "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401";
  const node = ethers.namehash(ensName);
  const registry = new ethers.Contract(ensRegistryAddress, ["function owner(bytes32 node) view returns (address)"], provider);
  const registryOwner = await registry.owner(node);
  if (registryOwner.toLowerCase() !== nameWrapperAddress.toLowerCase()) {
    return registryOwner;
  }

  const wrapper = new ethers.Contract(nameWrapperAddress, ["function ownerOf(uint256 id) view returns (address)"], provider);
  return wrapper.ownerOf(BigInt(node));
}

function blockedStatus(
  ensName: string | undefined,
  resolverAddress: string | undefined,
  records: EnsBindingRecordValues | undefined,
  checks: EnsBindingPreparationStatus["checks"],
  blockingReasons: string[]
): EnsBindingPreparationStatus {
  return {
    ok: false,
    ensName,
    resolverAddress,
    records,
    blockingReasons: [...new Set(blockingReasons)],
    degradedReasons: [],
    summary: "ENS text-record multicall preparation is blocked.",
    checks
  };
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}

function normalizePrivateKey(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (trimmed === undefined || trimmed.length === 0 || !/^(0x)?[a-fA-F0-9]{64}$/.test(trimmed)) {
    return undefined;
  }
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}

function parseBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === "true";
}
