import { handleKeeperHubEventRequest } from "../../../lib/events/keeperhub-event-route";

export async function POST(request: Request): Promise<Response> {
  return handleKeeperHubEventRequest(request);
}
