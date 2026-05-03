export const defaultAgentEnsParent = "agent.clearintent.eth";

export function normalizeAgentLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}

export function isUsableAgentLabel(label: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/.test(label);
}

export function toAgentEnsName(label: string, parent = defaultAgentEnsParent): string {
  const normalizedLabel = normalizeAgentLabel(label);
  return normalizedLabel ? `${normalizedLabel}.${parent}` : parent;
}
