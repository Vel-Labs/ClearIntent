import {
  getKeeperHubLiveRunStatus,
  getKeeperHubLiveStatus,
  submitKeeperHubLiveWorkflow
} from "../../../../../../../packages/keeperhub-adapter/src";
import { json, loadSetupEnv, parseJsonObject, stringField } from "../_shared";

export async function POST(request: Request): Promise<Response> {
  const payload = await parseJsonObject(request);
  if (!payload.ok) return payload.response;

  const env = { ...loadSetupEnv() };
  const action = stringField(payload.value, "action") ?? "status";
  const executionId = stringField(payload.value, "executionId");
  if (executionId !== undefined) env.KEEPERHUB_EXECUTION_ID = executionId;

  const status =
    action === "submit"
      ? await submitKeeperHubLiveWorkflow({
          env,
          context: {
            parentWallet: stringField(payload.value, "parentWallet"),
            agentAccount: stringField(payload.value, "agentAccount"),
            agentEnsName: stringField(payload.value, "agentEnsName"),
            policyUri: stringField(payload.value, "policyUri"),
            policyHash: stringField(payload.value, "policyHash"),
            auditLatest: stringField(payload.value, "auditLatest")
          }
        })
      : action === "run-status"
        ? await getKeeperHubLiveRunStatus({ env })
        : await getKeeperHubLiveStatus({ env });
  return json(status, status.blockingReasons.length > 0 ? 409 : 200);
}
