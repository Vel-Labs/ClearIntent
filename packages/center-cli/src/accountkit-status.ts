export type AccountKitCliStatus = {
  ok: boolean;
  configured: boolean;
  chain?: string;
  apiKeyPresent: boolean;
  missing: string[];
  summary: string;
  prompts: string[];
  notes: string[];
};

export function getAccountKitCliStatus(env: NodeJS.ProcessEnv = process.env): AccountKitCliStatus {
  const chain = readFirst(env, "NEXT_PUBLIC_ALCHEMY_CHAIN", "ALCHEMY_CHAIN");
  const apiKey = readFirst(env, "NEXT_PUBLIC_ALCHEMY_API_KEY");
  const missing = [
    ...(chain === undefined ? ["NEXT_PUBLIC_ALCHEMY_CHAIN"] : []),
    ...(apiKey === undefined ? ["NEXT_PUBLIC_ALCHEMY_API_KEY"] : [])
  ];

  return {
    ok: missing.length === 0,
    configured: missing.length === 0,
    chain,
    apiKeyPresent: apiKey !== undefined,
    missing,
    summary:
      missing.length === 0
        ? "Account Kit public configuration is present. CLI can provide local setup prompts; browser or WalletConnect signing remains required for parent-wallet deployment authority."
        : "Account Kit public configuration is incomplete. Add the missing public env values before deriving or deploying a parent-owned agent smart account.",
    prompts: buildAccountKitPrompts(chain),
    notes: [
      "The CLI does not ask for parent wallet seed phrases or private keys.",
      "Use the frontend, a local EIP-1193 app, MetaMask, WalletConnect, or hardware-wallet-backed provider for parent-wallet approval.",
      "The web wizard can submit the Account Kit deployment UserOperation through the connected parent wallet.",
      "Gas sponsorship is not assumed; if deployment is unfunded, fund the predicted smart account on the configured chain and retry."
    ]
  };
}

function buildAccountKitPrompts(chain: string | undefined): string[] {
  return [
    "Connect the parent wallet that should own the agent smart account.",
    "Choose an agent subname such as velcrafting.agent.clearintent.eth and verify ENS availability.",
    `Derive the Account Kit MultiOwnerModularAccount on ${chain ?? "<configured chain>"} with the connected parent wallet as owner.`,
    "Deploy the smart account with a parent-wallet-approved Account Kit UserOperation; fund the predicted account first if gas sponsorship is disabled.",
    "Record the deployment UserOperation hash or transaction hash as Step 2 evidence before preparing ENS subname or 0G binding writes.",
    "Do not pass a parent private key to an LLM agent; only pass the agent ENS name, smart-account address, policy URI/hash, and bounded execution references."
  ];
}

function readFirst(env: NodeJS.ProcessEnv, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}
