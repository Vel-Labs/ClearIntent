import { getAlchemyReadiness } from "../../../../lib/alchemy/readiness";
import { json, loadSetupEnv } from "../_shared";

export async function GET(): Promise<Response> {
  const env = loadSetupEnv();
  const readiness = getAlchemyReadiness(env);

  return json({
    ...readiness,
    env: {
      NEXT_PUBLIC_ALCHEMY_CHAIN: readiness.config.chain,
      NEXT_PUBLIC_ALCHEMY_API_KEY: readiness.config.apiKey,
      NEXT_PUBLIC_ALCHEMY_WALLET_CONFIG_ID: readiness.config.walletConfigId,
      NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: readiness.config.walletConnectProjectId,
      NEXT_PUBLIC_ALCHEMY_APP_NAME: readiness.config.appName
    }
  });
}
