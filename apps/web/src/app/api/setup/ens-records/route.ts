import { getEnsBindingPreparationStatus } from "../../../../../../../packages/ens-identity/src";
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

  if (ensName !== undefined) env.CLEARINTENT_ENS_NAME = ensName;
  if (agentCard !== undefined) env.CLEARINTENT_AGENT_CARD_URI = agentCard;
  if (policyUri !== undefined) env.CLEARINTENT_POLICY_URI = policyUri;
  if (policyHash !== undefined) env.CLEARINTENT_POLICY_HASH = policyHash;
  if (auditLatest !== undefined) env.CLEARINTENT_AUDIT_LATEST = auditLatest;
  if (clearintentVersion !== undefined) env.CLEARINTENT_VERSION = clearintentVersion;

  const status = await getEnsBindingPreparationStatus(env);
  return json(status, status.blockingReasons.length > 0 ? 409 : 200);
}
