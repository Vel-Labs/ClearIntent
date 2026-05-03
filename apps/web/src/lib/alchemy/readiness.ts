export type AlchemyReadinessStatus = "configured" | "not-configured" | "degraded";

export type AlchemyPublicConfig = {
  chain?: string;
  apiKey?: string;
  walletConfigId?: string;
  walletConnectProjectId?: string;
  appName?: string;
};

export type AlchemyReadiness = {
  status: AlchemyReadinessStatus;
  configured: boolean;
  accountKitReady: boolean;
  config: AlchemyPublicConfig;
  missing: Array<keyof AlchemyPublicConfig>;
  notes: string[];
};

export function getAlchemyReadiness(env: Record<string, string | undefined> = readProcessEnv()): AlchemyReadiness {
  const config: AlchemyPublicConfig = {
    chain: readFirst(env, "NEXT_PUBLIC_ALCHEMY_CHAIN", "ALCHEMY_CHAIN"),
    apiKey: readFirst(env, "NEXT_PUBLIC_ALCHEMY_API_KEY"),
    walletConfigId: readFirst(env, "NEXT_PUBLIC_ALCHEMY_WALLET_CONFIG_ID", "NEXT_PUBLIC_ALCHEMY_CLIENT_ID"),
    walletConnectProjectId: readFirst(env, "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"),
    appName: readFirst(env, "NEXT_PUBLIC_ALCHEMY_APP_NAME", "NEXT_PUBLIC_CLEARINTENT_APP_NAME")
  };
  const missing = requiredAlchemyFields(config);

  if (missing.length > 0) {
    return {
      status: "not-configured",
      configured: false,
      accountKitReady: false,
      config,
      missing,
      notes: ["Alchemy Account Kit is not configured for this frontend session."]
    };
  }

  return {
    status: "configured",
    configured: true,
    accountKitReady: true,
    config,
    missing: [],
    notes: ["Alchemy Account Kit public configuration is present; this is readiness only, not smart-account authority proof."]
  };
}

function requiredAlchemyFields(config: AlchemyPublicConfig): Array<keyof AlchemyPublicConfig> {
  return (["chain", "apiKey"] as const).filter((key) => !config[key]);
}

function readFirst(env: Record<string, string | undefined>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

function readProcessEnv(): Record<string, string | undefined> {
  return typeof process === "undefined" ? {} : process.env;
}
