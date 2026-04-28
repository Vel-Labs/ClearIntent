import { encodeArtifactPayload, hashArtifactPayload } from "./hash";
import type {
  ArtifactEnvelope,
  ArtifactFamily,
  ArtifactPayload,
  ArtifactRef,
  ClaimLevel,
  MemoryAdapter,
  MemoryStatus,
  ProviderMode,
  ReadArtifactOptions,
  StorageIssue,
  StorageResult,
  WriteArtifactInput
} from "./types";

type StoredRecord = {
  encodedPayload: string;
  envelope: ArtifactEnvelope;
};

export type LocalMemoryAdapterOptions = {
  now?: () => string;
  claimLevel?: ClaimLevel;
  failReadbackUris?: string[];
  failWritesForFamilies?: ArtifactFamily[];
};

export class LocalMemoryAdapter implements MemoryAdapter {
  readonly providerMode: ProviderMode = "local";
  readonly claimLevel: ClaimLevel;

  private readonly records = new Map<string, StoredRecord>();
  private readonly now: () => string;
  private readonly failReadbackUris: Set<string>;
  private readonly failWritesForFamilies: Set<ArtifactFamily>;

  constructor(options: LocalMemoryAdapterOptions = {}) {
    this.claimLevel = options.claimLevel ?? "local-adapter";
    this.now = options.now ?? (() => new Date().toISOString());
    this.failReadbackUris = new Set(options.failReadbackUris ?? []);
    this.failWritesForFamilies = new Set(options.failWritesForFamilies ?? []);
  }

  status(): MemoryStatus {
    return {
      providerMode: this.providerMode,
      claimLevel: this.claimLevel,
      writable: this.claimLevel === "local-adapter",
      readable: this.claimLevel === "local-adapter",
      proofVerified: false,
      degradedReasons: this.claimLevel === "local-adapter" ? [] : ["local adapter only supports local-adapter claims"]
    };
  }

  async writeArtifact<F extends ArtifactFamily>(
    input: WriteArtifactInput<F>
  ): Promise<StorageResult<ArtifactEnvelope<F>>> {
    if (this.claimLevel !== "local-adapter") {
      return blocked("provider_mode_unsupported", `Local adapter cannot satisfy ${this.claimLevel} claim level.`, input.family);
    }

    if (this.failWritesForFamilies.has(input.family)) {
      return degraded("incomplete_audit_write", `Local write failed for ${input.family}.`, input.family);
    }

    const contentHash = hashArtifactPayload(input.payload);
    const ref = this.createRef(input.family, input.artifactId, contentHash);
    const envelope: ArtifactEnvelope<F> = {
      family: input.family,
      payload: input.payload,
      ref,
      metadata: {
        schemaVersion: "clearintent.zerog-memory.artifact-envelope.v1",
        artifactId: input.artifactId,
        createdAt: input.createdAt ?? this.now(),
        contentHash,
        providerMode: this.providerMode,
        claimLevel: this.claimLevel
      }
    };

    this.records.set(ref.uri, {
      encodedPayload: encodeArtifactPayload(input.payload),
      envelope: envelope as ArtifactEnvelope
    });

    if (input.verifyReadback) {
      const readback = await this.readArtifact(ref);
      if (!readback.ok) {
        return {
          ok: false,
          state: "degraded",
          value: envelope,
          issues: readback.issues.map((issue) =>
            issue.code === "missing_artifact"
              ? { ...issue, code: "missing_readback", message: `Readback failed after writing ${input.family}.` }
              : issue
          )
        };
      }
    }

    return {
      ok: true,
      state: "stored",
      value: envelope,
      issues: []
    };
  }

  async readArtifact<F extends ArtifactFamily>(
    ref: ArtifactRef<F>,
    options: ReadArtifactOptions = {}
  ): Promise<StorageResult<ArtifactEnvelope<F>>> {
    if (this.failReadbackUris.has(ref.uri)) {
      return blocked("missing_artifact", `Artifact was not available during local readback: ${ref.uri}.`, ref.family, ref);
    }

    const record = this.records.get(ref.uri);
    if (!record) {
      return blocked("missing_artifact", `Artifact not found in local memory: ${ref.uri}.`, ref.family, ref);
    }

    const actualHash = hashArtifactPayload(JSON.parse(record.encodedPayload) as ArtifactPayload);
    if (actualHash !== ref.hash || actualHash !== record.envelope.metadata.contentHash) {
      return blocked("mismatched_hash", `Stored artifact hash did not match expected hash for ${ref.uri}.`, ref.family, {
        ...ref,
        hash: actualHash
      });
    }

    if (options.requireProof) {
      return {
        ok: false,
        state: "degraded",
        value: record.envelope as ArtifactEnvelope<F>,
        issues: [
          {
            code: "missing_proof",
            message: "Local adapter can validate content hashes but cannot provide a live 0G proof.",
            artifact: {
              family: ref.family,
              uri: ref.uri,
              hash: ref.hash
            }
          }
        ]
      };
    }

    return {
      ok: true,
      state: "verified",
      value: record.envelope as ArtifactEnvelope<F>,
      issues: []
    };
  }

  corruptArtifactForTest(ref: ArtifactRef, payload: unknown): void {
    const record = this.records.get(ref.uri);
    if (!record) {
      return;
    }

    this.records.set(ref.uri, {
      encodedPayload: encodeArtifactPayload(payload),
      envelope: {
        ...record.envelope,
        payload: payload as ArtifactPayload
      }
    });
  }

  private createRef<F extends ArtifactFamily>(family: F, artifactId: string, contentHash: string): ArtifactRef<F> {
    return {
      family,
      uri: `local://zerog-memory/${family}/${encodeURIComponent(artifactId)}`,
      hash: contentHash,
      providerMode: this.providerMode,
      claimLevel: this.claimLevel
    };
  }
}

export function createLocalMemoryAdapter(options: LocalMemoryAdapterOptions = {}): LocalMemoryAdapter {
  return new LocalMemoryAdapter(options);
}

function blocked<T>(
  code: StorageIssue["code"],
  message: string,
  family?: ArtifactFamily,
  ref?: ArtifactRef
): StorageResult<T> {
  return {
    ok: false,
    state: "blocked",
    issues: [
      {
        code,
        message,
        artifact: {
          family,
          uri: ref?.uri,
          hash: ref?.hash
        }
      }
    ]
  };
}

function degraded<T>(code: StorageIssue["code"], message: string, family?: ArtifactFamily): StorageResult<T> {
  return {
    ok: false,
    state: "degraded",
    issues: [
      {
        code,
        message,
        artifact: {
          family
        }
      }
    ]
  };
}
