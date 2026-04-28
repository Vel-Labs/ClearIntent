import type {
  ArtifactEnvelope,
  ArtifactRef,
  AuditBundleManifest,
  AuditStore,
  CreateAuditBundleInput,
  MemoryAdapter,
  StorageResult
} from "./types";

export class LocalAuditStore implements AuditStore {
  constructor(private readonly memory: MemoryAdapter) {}

  async createAuditBundle(input: CreateAuditBundleInput): Promise<StorageResult<ArtifactEnvelope<"audit-bundle">>> {
    const degradedReasons = validateAuditRefs(input.refs);
    const payload: AuditBundleManifest = {
      schemaVersion: "clearintent.zerog-memory.audit-bundle.v1",
      bundleId: input.bundleId,
      intentHash: input.intentHash,
      policyHash: input.policyHash,
      createdAt: input.createdAt ?? new Date().toISOString(),
      artifacts: input.refs,
      finalStatus: degradedReasons.length === 0 ? "audited" : "degraded",
      degradedReasons
    };

    const write = await this.memory.writeArtifact({
      family: "audit-bundle",
      artifactId: input.bundleId,
      payload,
      createdAt: payload.createdAt,
      verifyReadback: input.verifyReadback
    });

    if (!write.ok) {
      return {
        ok: false,
        state: "degraded",
        value: write.value,
        issues: write.issues.map((issue) => ({
          ...issue,
          code: issue.code === "missing_readback" ? "incomplete_audit_write" : issue.code,
          message:
            issue.code === "missing_readback"
              ? `Audit bundle write was incomplete: ${issue.message}`
              : issue.message
        }))
      };
    }

    return write;
  }

  readAuditBundle(ref: ArtifactRef<"audit-bundle">): Promise<StorageResult<ArtifactEnvelope<"audit-bundle">>> {
    return this.memory.readArtifact(ref);
  }
}

export function createLocalAuditStore(memory: MemoryAdapter): LocalAuditStore {
  return new LocalAuditStore(memory);
}

function validateAuditRefs(refs: CreateAuditBundleInput["refs"]): string[] {
  const required: Array<[keyof CreateAuditBundleInput["refs"], ArtifactRef | undefined]> = [
    ["policy", refs.policy],
    ["intent", refs.intent],
    ["riskReport", refs.riskReport],
    ["humanReviewCheckpoint", refs.humanReviewCheckpoint]
  ];

  return required
    .filter(([, ref]) => !ref)
    .map(([name]) => `missing required audit artifact ref: ${String(name)}`);
}
