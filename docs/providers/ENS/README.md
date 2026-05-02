# ENS Provider Funnel

ENS is the ClearIntent provider for canonical agent identity, metadata discovery, role/subname routing, and optional ENSIP-25 alignment.

Current ClearIntent claim level: `ens-local-fixture` locally; Phase 3B live-read route is implemented but blocked on live ENS config/records.

## Read first

1. [ENS Building with AI](https://docs.ens.domains/building-with-ai) - ENS guidance for AI assistants and machine-readable docs.
2. [ENS docs](https://docs.ens.domains/) - protocol, resolver, text-record, subname, and integration references.
3. [ENS llms.txt](https://docs.ens.domains/llms.txt) and [llms-full.txt](https://docs.ens.domains/llms-full.txt) - machine-readable docs corpus.
4. [ensdomains GitHub organization](https://github.com/ensdomains) - contracts, SDKs, docs, resolvers, subgraph, manager app, and tooling.

## ClearIntent fit

| ClearIntent need | ENS surface | Implementation note |
| --- | --- | --- |
| Agent identity | Forward resolution, address records, reverse/primary names | Resolve the agent name and validate expected controller/executor addresses. |
| Policy discovery | Text records | Store `policy.uri`, `policy.hash`, `audit.uri`, agent metadata, and version fields as text records. |
| Role separation | Subnames and optional Name Wrapper | Model executor/auditor/signer/session roles as subnames if useful for the demo. |
| Registry verification | ENSIP-25 draft | Optional alignment for AI agent registry verification; do not treat as stable MVP dependency. |
| Cross-chain/offchain data | Universal Resolver, CCIP Read, L2/offchain resolvers | Use standard libraries that support Universal Resolver and CCIP Read. |

## Current repo evidence

Phase 3B has a live resolver and Center CLI route:

```bash
npm run clearintent -- identity live-status
npm run --silent clearintent -- identity live-status --json
```

The route is config-driven through `ENS_PROVIDER_RPC` or `PRIVATE_EVM_RPC_URL`, `ENS_CHAIN_ID`, `ENS_NETWORK`, `ENS_NAME`, and optional `ENS_EXPECTED_POLICY_HASH`. For operator files created before the Phase 3B live read route, `ENS_EVM_RPC`, `CLEARINTENT_ENS_NAME`, and `CLEARINTENT_EXPECTED_POLICY_HASH` remain accepted aliases. It currently blocks cleanly until live ENS config and records are available. Do not claim `ens-live-read` or `ens-live-bound` until the command reads the selected name and records the resulting claim level in the Phase 3B closeout audit.

The remaining live binding records should come from 0G, not hand-authored placeholders:

```bash
npm run clearintent -- memory live-bindings
```

Set the returned values on the live agent name as `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, and `clearintent.version`, then set `ENS_EXPECTED_POLICY_HASH` or `CLEARINTENT_EXPECTED_POLICY_HASH` to the returned `policy.hash` before rerunning `identity live-status`.

For parent-wallet UX, ClearIntent can prepare a single ENS Public Resolver batch transaction:

```bash
npm run clearintent -- identity bind-records
```

This route encodes all ClearIntent text-record updates as one resolver `multicall(bytes[])` transaction. It does not send the transaction or require an ENS-owner private key; the connected parent wallet must still sign and submit it. Frontend setup should reuse this adapter helper so users can bind `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, and `clearintent.version` in one wallet prompt when their resolver supports `multicall`.

## Taxonomy

### Resolution

ENS resolution maps names to resolver records. Current docs emphasize the Universal Resolver as the canonical integration entrypoint for ENSv2 readiness.

ClearIntent usage: `packages/ens-identity/` should resolve names through supported libraries or Universal Resolver-compatible paths, not hand-roll partial resolution.

Sources: [Resolution docs](https://docs.ens.domains/resolution), [Universal Resolver docs](https://docs.ens.domains/resolvers/universal), [ENSv2 readiness](https://docs.ens.domains/web/ensv2-readiness).

### Text records

ENS text records are key-value records for arbitrary associated data. ENS docs list common profile records and custom records.

ClearIntent usage: define a small ClearIntent-specific key set and keep values content-addressed or hash-bound where possible.

Candidate keys:

| Key | Intended value |
| --- | --- |
| `clearintent.agent.card` | URL or content address for agent card JSON |
| `clearintent.policy.uri` | 0G policy artifact URI |
| `clearintent.policy.hash` | hash of canonical policy artifact |
| `clearintent.audit.latest` | latest audit bundle URI |
| `clearintent.framework.version` | ClearIntent package/schema version |
| `clearintent.executor` | expected executor name or address pointer |

Sources: [Text Records](https://docs.ens.domains/web/records), [ENSIP-5 Text Records](https://docs.ens.domains/ensip/5).

### Subnames

ENS subnames can represent scoped identities below a parent name. Docs cover onchain L1 subnames, L2 subnames, and offchain subnames.

ClearIntent usage: subnames can make role boundaries visible, for example `executor.guardian.clearintent.eth`, `auditor.guardian.clearintent.eth`, and `session-001.guardian.clearintent.eth`.

Sources: [Subdomains](https://docs.ens.domains/web/subdomains), [Name Wrapper overview](https://docs.ens.domains/wrapper/overview).

### ENSIP-25

ENSIP-25 is a draft for verifying an AI agent registry entry against an ENS name through a parameterized text-record key.

ClearIntent usage: stretch alignment if the demo uses an agent registry such as ERC-8004. Treat it as draft and optional.

Source: [ENSIP-25](https://docs.ens.domains/ensip/25).

### Design and safety

ENS design guidance says interfaces should preserve access to underlying addresses and handle caching/updating carefully.

ClearIntent usage: the demo UI can show ENS names, but verification must still compare resolved addresses, hashes, and signed payloads.

Source: [ENS Design Guidelines](https://docs.ens.domains/web/design).

## Implementation cautions

- Do not hard-code ENS names or resolved addresses in the demo path.
- Do not trust a display name without resolving and validating the address/policy fields.
- Do not claim ENSIP-25 compliance unless the required record key is set and checked.
- Handle stale records and ownership changes explicitly in risk/audit output.

## Local follow-ups

- Write a typed agent-card schema before finalizing ENS text-record keys.
- Choose library support for Universal Resolver and CCIP Read.
- Add fixtures for a valid name, missing record, mismatched policy hash, and stale audit URI.
