import { createHash } from "node:crypto";

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortForStableHash(value));
}

export function sha256Hex(value: unknown): string {
  return `0x${createHash("sha256").update(stableStringify(value)).digest("hex")}`;
}

export function hashAction(action: unknown): string {
  return sha256Hex(action);
}

export function hashIntentPayload(intentPayload: unknown): string {
  return sha256Hex(intentPayload);
}

export function hashPolicy(policy: unknown): string {
  return sha256Hex(policy);
}

function sortForStableHash(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortForStableHash(item));
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  return Object.keys(record)
    .sort()
    .reduce<Record<string, unknown>>((sorted, key) => {
      sorted[key] = sortForStableHash(record[key]);
      return sorted;
    }, {});
}

