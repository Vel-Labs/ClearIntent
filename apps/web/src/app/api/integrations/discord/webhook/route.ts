import { postDiscordWebhook } from "../../../../../lib/integrations/discord-webhook";

export async function POST(request: Request): Promise<Response> {
  const payload = await parseJson(request);
  const result = payload.ok
    ? await postDiscordWebhook(payload.value)
    : {
        ok: false,
        delivered: false,
        status: 400,
        error: "Request body must be valid JSON."
      };

  return new Response(JSON.stringify(result, null, 2), {
    status: result.ok ? 202 : result.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

async function parseJson(request: Request): Promise<{ ok: true; value: unknown } | { ok: false }> {
  try {
    return { ok: true, value: await request.json() };
  } catch {
    return { ok: false };
  }
}
