import { sha256Hex, stableStringify } from "../../core/src";

export function hashArtifactPayload(payload: unknown): string {
  return sha256Hex(payload);
}

export function encodeArtifactPayload(payload: unknown): string {
  return stableStringify(payload);
}

export function hashArtifactContent(value: unknown): string {
  return hashArtifactPayload(value);
}

export function cloneStable<T>(value: T): T {
  return JSON.parse(stableStringify(value)) as T;
}
