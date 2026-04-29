import type { EnsIdentityResult, EnsResolverAdapter, EnsResolverLookup, EnsResolverRecord } from "./types";

export class LiveLookupUnavailableResolver implements EnsResolverAdapter {
  readonly providerMode = "local" as const;
  readonly claimLevel = "ens-local-fixture" as const;

  async resolveName(input: EnsResolverLookup): Promise<EnsIdentityResult<EnsResolverRecord>> {
    return {
      ok: false,
      state: "blocked",
      issues: [
        {
          code: "live_lookup_unavailable",
          message: "Phase 3A does not perform live ENS lookup.",
          ensName: input.ensName
        }
      ]
    };
  }
}
