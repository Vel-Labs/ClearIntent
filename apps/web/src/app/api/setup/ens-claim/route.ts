import { json, loadSetupEnv, parseJsonObject, stringField } from "../_shared";

const ensRegistryAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const defaultResolverAddress = "0xF29100983E058B709F3D539b0c765937B804AC15";

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
    "function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl)"
  ]);
  const resolver = new ethers.Interface(["function setAddr(bytes32 node, address addr)"]);
  const parentNode = ethers.namehash(parentName);
  const labelHash = ethers.id(label);

  return json({
    ok: true,
    ensName,
    parentName,
    resolverAddress,
    warning:
      "This browser transaction path works only when the connected wallet controls the unwrapped parent ENS name. Wrapped-name controller support needs a dedicated NameWrapper path.",
    transactions: [
      {
        label: "Create subname",
        to: ensRegistryAddress,
        value: "0x0",
        data: registry.encodeFunctionData("setSubnodeRecord", [parentNode, labelHash, ownerAddress, resolverAddress, 0])
      },
      {
        label: "Set ETH address",
        to: resolverAddress,
        value: "0x0",
        data: resolver.encodeFunctionData("setAddr", [node, agentAccountAddress])
      }
    ]
  });
}
