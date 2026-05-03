import { json, loadSetupEnv, parseJsonObject, stringField } from "../_shared";
import { getEnsAvailabilityRpcUrls } from "../../../../lib/ens/availability";

const ensRegistryAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const defaultResolverAddress = "0xF29100983E058B709F3D539b0c765937B804AC15";
const zeroAddress = "0x0000000000000000000000000000000000000000";

export async function POST(request: Request): Promise<Response> {
  const payload = await parseJsonObject(request);
  if (!payload.ok) return payload.response;

  const label = stringField(payload.value, "label");
  const parentName = stringField(payload.value, "parentName") ?? "agent.clearintent.eth";
  const ownerAddress = stringField(payload.value, "ownerAddress");
  const agentAccountAddress = stringField(payload.value, "agentAccountAddress");
  const env = loadSetupEnv();
  const resolverAddress = stringField(payload.value, "resolverAddress") ?? env.ENS_RESOLVER_ADDRESS ?? defaultResolverAddress;

  if (label === undefined || !/^[a-z0-9-]{3,32}$/.test(label)) {
    return json({ error: "A normalized ENS label between 3 and 32 characters is required." }, 400);
  }
  if (ownerAddress === undefined || agentAccountAddress === undefined) {
    return json({ error: "ownerAddress and agentAccountAddress are required." }, 400);
  }

  const { ethers } = await import("ethers");
  const ensName = `${label}.${parentName}`;
  const node = ethers.namehash(ensName);
  const registry = new ethers.Interface([
    "function owner(bytes32 node) view returns (address)",
    "function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl)"
  ]);
  const parentNode = ethers.namehash(parentName);
  const labelHash = ethers.id(label);
  const parentOwner = await readEnsOwner({
    ethers,
    registry,
    node: parentNode,
    rpcUrls: getEnsAvailabilityRpcUrls(env)
  });
  if (parentOwner === undefined) {
    return json({ error: `Could not verify the owner of ${parentName}; ENS RPC lookup failed before preparing the claim transaction.` }, 503);
  }
  if (parentOwner === zeroAddress) {
    return json({ error: `${parentName} is not owned on the ENS registry; cannot create a ClearIntent subname.` }, 409);
  }

  const hostedIssuer = await maybeIssueHostedSubname({
    ethers,
    env,
    registry,
    parentName,
    parentNode,
    labelHash,
    ownerAddress,
    resolverAddress
  });
  if (hostedIssuer !== undefined) {
    if (!hostedIssuer.ok) {
      return json({ error: hostedIssuer.error, parentName, parentOwner, connectedWallet: ownerAddress }, hostedIssuer.status);
    }
    return json({
      ok: true,
      ensName,
      parentName,
      resolverAddress,
      warning:
        "ClearIntent hosted issuer created this subname from the parent ENS authority. The connected wallet controls the subname records next.",
      hostedIssuer: true,
      transactionHashes: [hostedIssuer.transactionHash],
      addressRecordDeferredToEnsRecords: true,
      agentAccountAddress
    });
  }

  if (parentOwner.toLowerCase() !== ownerAddress.toLowerCase()) {
    return json(
      {
        error: `The connected wallet does not control ${parentName}. Connect the parent ENS owner wallet or use an operator-prepared demo setup before claiming this subname.`,
        parentName,
        parentOwner,
        connectedWallet: ownerAddress
      },
      409
    );
  }

  return json({
    ok: true,
    ensName,
    parentName,
    resolverAddress,
    warning:
      "This browser transaction path works only when the connected wallet controls the unwrapped parent ENS name. The address record is set later with the ClearIntent resolver multicall.",
    transactions: [
      {
        label: "Create subname",
        to: ensRegistryAddress,
        value: "0x0",
        data: registry.encodeFunctionData("setSubnodeRecord", [parentNode, labelHash, ownerAddress, resolverAddress, 0])
      }
    ],
    addressRecordDeferredToEnsRecords: true,
    agentAccountAddress
  });
}

async function readEnsOwner(input: {
  ethers: typeof import("ethers");
  registry: import("ethers").Interface;
  node: string;
  rpcUrls: string[];
}): Promise<string | undefined> {
  for (const rpcUrl of input.rpcUrls) {
    try {
      const provider = new input.ethers.JsonRpcProvider(rpcUrl);
      const result = await provider.call({
        to: ensRegistryAddress,
        data: input.registry.encodeFunctionData("owner", [input.node])
      });
      const [owner] = input.registry.decodeFunctionResult("owner", result);
      if (typeof owner === "string") {
        return owner;
      }
    } catch {
      // Try the next configured/public RPC endpoint.
    }
  }
  return undefined;
}

async function maybeIssueHostedSubname(input: {
  ethers: typeof import("ethers");
  env: NodeJS.ProcessEnv;
  registry: import("ethers").Interface;
  parentName: string;
  parentNode: string;
  labelHash: string;
  ownerAddress: string;
  resolverAddress: string;
}): Promise<{ ok: true; transactionHash: string } | { ok: false; error: string; status: number } | undefined> {
  if (!parseBoolean(input.env.ENS_ENABLE_HOSTED_SUBNAME_ISSUER)) {
    return undefined;
  }

  const rpcUrl = input.env.ENS_PROVIDER_RPC || input.env.ENS_EVM_RPC || input.env.PRIVATE_EVM_RPC_URL;
  const privateKey = normalizePrivateKey(input.env.ENS_SIGNER_PRIVATE_KEY);
  if (rpcUrl === undefined || privateKey === undefined) {
    return {
      ok: false,
      status: 503,
      error: "Hosted ENS subname issuer is enabled but missing ENS_PROVIDER_RPC or ENS_SIGNER_PRIVATE_KEY."
    };
  }

  try {
    const provider = new input.ethers.JsonRpcProvider(rpcUrl, "mainnet");
    const signer = new input.ethers.Wallet(privateKey, provider);
    const signerAddress = await signer.getAddress();
    const parentOwner = await readEnsOwner({
      ethers: input.ethers,
      registry: input.registry,
      node: input.parentNode,
      rpcUrls: [rpcUrl]
    });
    if (parentOwner === undefined || signerAddress.toLowerCase() !== parentOwner.toLowerCase()) {
      return {
        ok: false,
        status: 409,
        error: `Hosted ENS issuer signer does not control ${input.parentName}.`
      };
    }

    const tx = await signer.sendTransaction({
      to: ensRegistryAddress,
      value: 0,
      data: input.registry.encodeFunctionData("setSubnodeRecord", [
        input.parentNode,
        input.labelHash,
        input.ownerAddress,
        input.resolverAddress,
        0
      ])
    });
    const receipt = await tx.wait();
    if (receipt === null || receipt.status !== 1) {
      return {
        ok: false,
        status: 502,
        error: `Hosted ENS issuer transaction did not confirm successfully: ${tx.hash}`
      };
    }
    return { ok: true, transactionHash: tx.hash };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function parseBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === "true";
}

function normalizePrivateKey(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (trimmed === undefined || trimmed.length === 0 || !/^(0x)?[a-fA-F0-9]{64}$/.test(trimmed)) {
    return undefined;
  }
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}
