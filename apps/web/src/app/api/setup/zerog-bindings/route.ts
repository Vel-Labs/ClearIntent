import { getZeroGLiveBindingsStatus } from "../../../../../../../packages/zerog-memory/src";
import { json, loadSetupEnv, parseJsonObject, stringField } from "../_shared";

export async function POST(request: Request): Promise<Response> {
  const payload = await parseJsonObject(request);
  if (!payload.ok) return payload.response;

  const env = { ...loadSetupEnv() };
  const ensName = stringField(payload.value, "agentEnsName");
  const controllerAddress = stringField(payload.value, "controllerAddress");
  const executorAddress = stringField(payload.value, "executorAddress");

  if (ensName !== undefined) env.CLEARINTENT_ENS_NAME = ensName;
  if (controllerAddress !== undefined) env.ZERO_G_WALLET_ADDRESS = controllerAddress;
  if (executorAddress !== undefined) env.KEEPERHUB_EXECUTOR_ADDRESS = executorAddress;

  const status = await getZeroGLiveBindingsStatus(env);
  return json(status, status.blockingReasons.length > 0 ? 409 : 200);
}
