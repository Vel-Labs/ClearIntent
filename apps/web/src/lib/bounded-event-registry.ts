import type { AgentSetupDiscoveryRecord } from "./setup-discovery";
import type { WalletAccountState } from "./wallet";

export const keeperHubEventIngestEndpoint = "/api/events" as const;
export const clearIntentPublicBaseUrl = "https://clearintent.xyz" as const;
export const keeperHubEventIngestUrl = `${clearIntentPublicBaseUrl}${keeperHubEventIngestEndpoint}` as const;

export type BoundedEventRegistryContext = {
  schemaVersion: "clearintent.bounded-event-registry.v1";
  ingest: {
    endpoint: typeof keeperHubEventIngestEndpoint;
    url: typeof keeperHubEventIngestUrl;
    method: "POST";
    direction: "keeperhub-to-clearintent";
    acceptedPayload: "clearintent.keeperhub-event.v1";
    boundary: "reported_non_authoritative";
  };
  registry:
    | {
        key: string;
        displayName: string;
        url: string;
        source: "browser-local";
        parentWallet: string;
        agentAccount: string;
        agentEnsName: string;
        policyHash?: string;
        auditLatest?: string;
        keeperHubRunId?: string;
      }
    | {
        key: undefined;
        displayName: undefined;
        url: typeof keeperHubEventIngestUrl;
        source: "unavailable";
        detail: string;
      };
  delivery: {
    userWebhookForwarding: false;
    detail: string;
  };
};

export function buildBoundedEventRegistryContext(
  wallet: WalletAccountState | undefined,
  setup: AgentSetupDiscoveryRecord | undefined
): BoundedEventRegistryContext {
  const ingest = {
    endpoint: keeperHubEventIngestEndpoint,
    url: keeperHubEventIngestUrl,
    method: "POST",
    direction: "keeperhub-to-clearintent",
    acceptedPayload: "clearintent.keeperhub-event.v1",
    boundary: "reported_non_authoritative"
  } as const;

  if (setup === undefined) {
    return {
      schemaVersion: "clearintent.bounded-event-registry.v1",
      ingest,
      registry: {
        key: undefined,
        displayName: undefined,
        url: keeperHubEventIngestUrl,
        source: "unavailable",
        detail: "Connect the parent wallet and link an agent setup before registry context is available."
      },
      delivery: disabledUserWebhookForwarding()
    };
  }

  const parentWallet = wallet?.account ?? setup.parentWallet;
  const displayName = boundedWebhookDisplayName(setup.agentEnsName, parentWallet, setup.agentAccount);

  return {
    schemaVersion: "clearintent.bounded-event-registry.v1",
    ingest,
    registry: {
      key: registryKey(parentWallet, setup.agentAccount, setup.agentEnsName),
      displayName,
      source: setup.source,
      parentWallet,
      agentAccount: setup.agentAccount,
      agentEnsName: setup.agentEnsName,
      url: boundedWebhookUrl(displayName),
      policyHash: setup.policyHash,
      auditLatest: setup.auditLatest,
      keeperHubRunId: setup.keeperHubRunId
    },
    delivery: disabledUserWebhookForwarding()
  };
}

function boundedWebhookUrl(displayName: string): string {
  return `${keeperHubEventIngestUrl}?registry=${encodeURIComponent(displayName)}`;
}

function registryKey(parentWallet: string, agentAccount: string, agentEnsName: string): string {
  return `${parentWallet.toLowerCase()}:${agentAccount.toLowerCase()}:${agentEnsName.toLowerCase()}`;
}

function boundedWebhookDisplayName(agentEnsName: string, parentWallet: string, agentAccount: string): string {
  return [
    displaySegment(agentEnsName.split(".")[0] ?? "agent"),
    walletSegment(parentWallet),
    walletSegment(agentAccount)
  ].join("-");
}

function displaySegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .padEnd(4, "x")
    .slice(0, 4);
}

function walletSegment(value: string): string {
  const hexBody = value.toLowerCase().replace(/^0x/, "").replace(/[^a-f0-9]/g, "");
  return hexBody.padEnd(4, "0").slice(0, 4);
}

function disabledUserWebhookForwarding(): BoundedEventRegistryContext["delivery"] {
  return {
    userWebhookForwarding: false,
    detail:
      "The derived webhook name is a routing label, not an authentication secret. User webhook forwarding is disabled until scoped destination registration, replay checks, and KeeperHub source binding exist."
  };
}
