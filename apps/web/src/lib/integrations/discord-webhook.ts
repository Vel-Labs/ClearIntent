import type { DemoClearIntentEventPayload } from "../demo-intent";

export type DiscordWebhookPostResult =
  | {
      ok: true;
      delivered: true;
      status: number;
      redactedWebhook: string;
    }
  | {
      ok: false;
      delivered: false;
      status: number;
      error: string;
      redactedWebhook?: string;
    };

type DiscordWebhookRequest = {
  webhookUrl?: unknown;
  registryName?: unknown;
  event?: unknown;
};

export async function postDiscordWebhook(input: unknown): Promise<DiscordWebhookPostResult> {
  if (!isRecord(input)) {
    return {
      ok: false,
      delivered: false,
      status: 400,
      error: "Request body must be an object."
    };
  }

  const request = input as DiscordWebhookRequest;
  const webhookUrl = parseDiscordWebhookUrl(request.webhookUrl);
  if (webhookUrl === undefined) {
    return {
      ok: false,
      delivered: false,
      status: 400,
      error: "Discord webhook URL must be a https://discord.com/api/webhooks/... or https://discordapp.com/api/webhooks/... URL."
    };
  }

  const event = parseDemoEvent(request.event);
  if (event === undefined) {
    return {
      ok: false,
      delivered: false,
      status: 400,
      error: "Request requires a ClearIntent demo event payload.",
      redactedWebhook: redactDiscordWebhookUrl(webhookUrl)
    };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(buildDiscordMessage(event, optionalString(request.registryName)))
  });

  if (!response.ok) {
    return {
      ok: false,
      delivered: false,
      status: response.status,
      error: `Discord webhook returned HTTP ${response.status}.`,
      redactedWebhook: redactDiscordWebhookUrl(webhookUrl)
    };
  }

  return {
    ok: true,
    delivered: true,
    status: response.status,
    redactedWebhook: redactDiscordWebhookUrl(webhookUrl)
  };
}

function buildDiscordMessage(event: DemoClearIntentEventPayload, registryName: string | undefined) {
  const passed = event.shouldExecute === true;
  const title = passed ? "ClearIntent demo allowed" : "ClearIntent demo blocked";
  return {
    username: "ClearIntent",
    content: `${passed ? "PASS" : "FAIL"} ${registryName ?? "clearintent-demo"}: ${event.valueLimit} ETH to ${shortValue(event.target)}`,
    embeds: [
      {
        title,
        description: event.error === "none" ? "Simulated policy evaluation passed." : event.error,
        color: passed ? 0x2fb344 : 0xd83a3a,
        fields: [
          { name: "Registry", value: registryName ?? "not provided", inline: true },
          { name: "Outcome", value: passed ? "pass" : "fail", inline: true },
          { name: "Mode", value: "simulation-only", inline: true },
          { name: "Agent", value: event.agentEnsName ?? event.agentAccount ?? "not provided", inline: false },
          { name: "Intent", value: shortValue(event.intentHash), inline: true },
          { name: "Policy", value: shortValue(event.policyHash ?? "missing"), inline: true },
          { name: "Transaction", value: "not submitted", inline: true }
        ]
      }
    ]
  };
}

function parseDiscordWebhookUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value.trim());
    const allowedHost = url.hostname === "discord.com" || url.hostname === "discordapp.com";
    if (url.protocol !== "https:" || !allowedHost || !url.pathname.startsWith("/api/webhooks/")) {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

function parseDemoEvent(value: unknown): DemoClearIntentEventPayload | undefined {
  if (!isRecord(value)) return undefined;
  if (value.schemaVersion !== "clearintent.keeperhub-event.v1") return undefined;
  if (value.project !== "clearintent") return undefined;
  if (value.source !== "keeperhub") return undefined;
  if (value.actionType !== "demo.native-transfer") return undefined;
  if (typeof value.intentHash !== "string" || typeof value.target !== "string" || typeof value.valueLimit !== "string") return undefined;
  return value as DemoClearIntentEventPayload;
}

function redactDiscordWebhookUrl(value: string): string {
  try {
    const url = new URL(value);
    const parts = url.pathname.split("/");
    const webhookId = parts[3] ?? "unknown";
    return `${url.origin}/api/webhooks/${webhookId}/...`;
  } catch {
    return "discord-webhook-redacted";
  }
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function shortValue(value: string): string {
  return value.length > 18 ? `${value.slice(0, 10)}...${value.slice(-6)}` : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
