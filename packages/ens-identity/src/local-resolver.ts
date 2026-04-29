import type {
  EnsIdentityIssue,
  EnsIdentityResult,
  EnsResolverAdapter,
  EnsResolverLookup,
  EnsResolverRecord
} from "./types";

export type LocalEnsResolverOptions = {
  records: EnsResolverRecord[];
  supportedNetworks?: string[];
  namesWithoutResolver?: string[];
};

export class LocalEnsResolver implements EnsResolverAdapter {
  readonly providerMode = "local" as const;
  readonly claimLevel = "ens-local-fixture" as const;

  private readonly records: Map<string, EnsResolverRecord>;
  private readonly supportedNetworks: Set<string>;
  private readonly namesWithoutResolver: Set<string>;

  constructor(options: LocalEnsResolverOptions) {
    this.records = new Map(options.records.map((record) => [normalizeName(record.ensName), record]));
    this.supportedNetworks = new Set(options.supportedNetworks ?? ["local"]);
    this.namesWithoutResolver = new Set((options.namesWithoutResolver ?? []).map(normalizeName));
  }

  async resolveName(input: EnsResolverLookup): Promise<EnsIdentityResult<EnsResolverRecord>> {
    const ensName = normalizeName(input.ensName);
    const network = input.network ?? "local";

    if (!ensName) {
      return blocked("missing_name", "ENS name is required.");
    }

    if (!this.supportedNetworks.has(network)) {
      return blocked("unsupported_network", `Network is not supported by the local ENS fixture resolver: ${network}.`, ensName);
    }

    if (this.namesWithoutResolver.has(ensName)) {
      return blocked("missing_resolver", `No resolver is available for fixture ENS name: ${ensName}.`, ensName);
    }

    const record = this.records.get(ensName);
    if (!record) {
      return blocked("missing_name", `No fixture exists for ENS name: ${ensName}.`, ensName);
    }

    return {
      ok: true,
      state: "resolved",
      value: record,
      issues: []
    };
  }
}

export function createLocalEnsResolver(options: LocalEnsResolverOptions): LocalEnsResolver {
  return new LocalEnsResolver(options);
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function blocked(
  code: EnsIdentityIssue["code"],
  message: string,
  ensName?: string
): EnsIdentityResult<EnsResolverRecord> {
  return {
    ok: false,
    state: "blocked",
    issues: [{ code, message, ensName }]
  };
}
