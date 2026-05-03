import { getEnsBindingPreparationStatus, prepareEnsTextRecordMulticall } from "../../../../../../../packages/ens-identity/src";
import { json, loadSetupEnv, parseJsonObject, stringField } from "../_shared";

export async function POST(request: Request): Promise<Response> {
  const payload = await parseJsonObject(request);
  if (!payload.ok) return payload.response;

  const env = { ...loadSetupEnv() };
  const ensName = stringField(payload.value, "agentEnsName");
  const agentCard = stringField(payload.value, "agentCard");
  const policyUri = stringField(payload.value, "policyUri");
  const policyHash = stringField(payload.value, "policyHash");
  const auditLatest = stringField(payload.value, "auditLatest");
  const clearintentVersion = stringField(payload.value, "clearintentVersion");
  const agentAccountAddress = stringField(payload.value, "agentAccountAddress");
  const resolverAddress = stringField(payload.value, "resolverAddress");

  if (ensName !== undefined) env.CLEARINTENT_ENS_NAME = ensName;
  if (resolverAddress !== undefined) env.ENS_RESOLVER_ADDRESS = resolverAddress;
  if (agentCard !== undefined) env.CLEARINTENT_AGENT_CARD_URI = agentCard;
  if (policyUri !== undefined) env.CLEARINTENT_POLICY_URI = policyUri;
  if (policyHash !== undefined) env.CLEARINTENT_POLICY_HASH = policyHash;
  if (auditLatest !== undefined) env.CLEARINTENT_AUDIT_LATEST = auditLatest;
  if (clearintentVersion !== undefined) env.CLEARINTENT_VERSION = clearintentVersion;

  const status = await getEnsBindingPreparationStatus(env);
  if (
    status.ok &&
    status.ensName !== undefined &&
    status.resolverAddress !== undefined &&
    status.records !== undefined &&
    agentAccountAddress !== undefined
  ) {
    const tx = await prepareEnsTextRecordMulticall({
      ensName: status.ensName,
      resolverAddress: status.resolverAddress,
      records: status.records,
      address: agentAccountAddress
    });
    return json(
      {
        ...status,
        tx,
        summary: "ENS address and ClearIntent text-record multicall is prepared for parent-wallet signature."
      },
      200
    );
  }
  return json(status, status.blockingReasons.length > 0 ? 409 : 200);
}
