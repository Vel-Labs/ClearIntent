import { createPublicClient, http, namehash, zeroAddress, type Address } from "viem";
import { mainnet } from "viem/chains";
import { defaultAgentEnsParent, isUsableAgentLabel } from "./names";

const ensRegistryAbi = [
  {
    inputs: [{ name: "node", type: "bytes32" }],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const ensRegistryAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

export type EnsAvailabilityResult = {
  available: boolean;
  checkedAt: string;
  name: string;
  owner: Address;
  source: "ens-registry";
};

const publicEnsRpcFallbacks = ["https://ethereum-rpc.publicnode.com", "https://cloudflare-eth.com", "https://eth.llamarpc.com"];

export function getEnsAvailabilityRpcUrls(env: NodeJS.ProcessEnv = process.env): string[] {
  return uniqueValues([
    env.ENS_PROVIDER_RPC,
    env.ENS_EVM_RPC,
    env.PRIVATE_EVM_RPC_URL,
    env.NEXT_PUBLIC_ENS_PROVIDER_RPC,
    ...publicEnsRpcFallbacks
  ]);
}

export function getEnsAvailabilityRpcUrl(env: NodeJS.ProcessEnv = process.env): string {
  return getEnsAvailabilityRpcUrls(env)[0] || publicEnsRpcFallbacks[0];
}

export async function checkAgentEnsAvailability(name: string, rpcUrls = getEnsAvailabilityRpcUrls()): Promise<EnsAvailabilityResult> {
  const normalizedName = name.trim().toLowerCase();

  if (!normalizedName.endsWith(`.${defaultAgentEnsParent}`)) {
    throw new Error(`ENS name must be under ${defaultAgentEnsParent}.`);
  }

  const label = normalizedName.slice(0, -1 * (`.${defaultAgentEnsParent}`).length);
  if (!isUsableAgentLabel(label)) {
    throw new Error("ENS label must be 3-63 characters and contain only lowercase letters, numbers, or hyphens.");
  }

  const node = namehash(normalizedName);
  for (const rpcUrl of rpcUrls) {
    try {
      const client = createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl, { timeout: 8_000 })
      });
      const owner = await client.readContract({
        abi: ensRegistryAbi,
        address: ensRegistryAddress,
        args: [node],
        functionName: "owner"
      });

      return {
        available: owner === zeroAddress,
        checkedAt: new Date().toISOString(),
        name: normalizedName,
        owner,
        source: "ens-registry"
      };
    } catch (error) {
      void error;
    }
  }

  throw new Error(`ENS lookup failed across ${rpcUrls.length} RPC endpoint${rpcUrls.length === 1 ? "" : "s"}.`);
}

function uniqueValues(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0))];
}
