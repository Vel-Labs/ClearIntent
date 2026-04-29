import { createHash } from "node:crypto";
import type { SignatureEvidence } from "../../core/src";
import { buildClearIntentTypedData, typedDataHash } from "./eip712";
import { defaultDisplayWarnings } from "./display-status";
import { SIGNER_LOCAL_FIXTURE_CLAIM, type ClearIntentTypedData, type FixtureSignatureEvidence } from "./types";

export function createFixtureSignatureEvidence(typedData: ClearIntentTypedData): FixtureSignatureEvidence {
  const hash = typedDataHash(typedData);
  const signer = typedData.message.signer;

  return {
    signer,
    signature: deterministicFixtureSignature(signer, hash),
    claimLevel: SIGNER_LOCAL_FIXTURE_CLAIM,
    typedDataHash: hash,
    displayStatus: "app_preview_only",
    displayWarnings: defaultDisplayWarnings("app_preview_only")
  };
}

export function createFixtureSignatureEvidenceForIntent(intent: Parameters<typeof buildClearIntentTypedData>[0]): FixtureSignatureEvidence {
  return createFixtureSignatureEvidence(buildClearIntentTypedData(intent));
}

export function toCoreSignatureEvidence(evidence: FixtureSignatureEvidence): SignatureEvidence {
  return {
    signer: evidence.signer,
    signature: evidence.signature
  };
}

function deterministicFixtureSignature(signer: string, hash: string): string {
  const seed = `${SIGNER_LOCAL_FIXTURE_CLAIM}:${signer.toLowerCase()}:${hash}`;
  const first = createHash("sha512").update(seed).digest("hex");
  const second = createHash("sha512").update(`${seed}:tail`).digest("hex");
  return `0x${first}${second.slice(0, 2)}`;
}
