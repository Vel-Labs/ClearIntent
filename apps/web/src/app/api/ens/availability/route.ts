import { NextResponse } from "next/server";
import { checkAgentEnsAvailability } from "../../../../lib/ens/availability";
import { toAgentEnsName } from "../../../../lib/ens/names";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedName = searchParams.get("name");
  const requestedLabel = searchParams.get("label");
  const name = requestedName || (requestedLabel ? toAgentEnsName(requestedLabel) : "");

  if (!name) {
    return NextResponse.json({ error: "Missing ENS name or label." }, { status: 400 });
  }

  try {
    const result = await checkAgentEnsAvailability(name);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.startsWith("ENS lookup failed") ? 502 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
