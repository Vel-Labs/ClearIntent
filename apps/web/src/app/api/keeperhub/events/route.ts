import { ingestKeeperHubReportedEvent } from "../../../../lib/events/keeperhub-event";

export async function POST(request: Request): Promise<Response> {
  const payload = await parseJson(request);
  const result = ingestKeeperHubReportedEvent(payload.ok ? payload.value : undefined, { headers: request.headers });
  const body = payload.ok
    ? result
    : {
        ...result,
        issues: [
          {
            code: "invalid_payload",
            message: "Request body must be valid JSON."
          }
        ]
      };

  return json(body, body.ok ? 202 : 400);
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
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
