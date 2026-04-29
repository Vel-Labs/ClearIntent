# Phase 3 ENS Agent Identity Implementation Plan

## Purpose

Make ENS the canonical identity and discovery layer for ClearIntent agents without blocking local progress on live 0G testnet funding.

## Why now

- Phase 1 and Phase 1.5 established the authority kernel and Center CLI boundary.
- Phase 2A established local artifact/ref semantics for policy memory and audit evidence.
- Phase 2B is readiness-wired but cannot close until local `.env` values, wallet credentials, and funded testnet tokens allow live 0G upload/readback/hash validation.
- ENS identity can be scaffolded locally now against mock records and the Phase 2A artifact pointer shape, then bound to live 0G evidence after Phase 2B closes.

## Phase split

### Phase 3A: ENS Agent Identity Local Scaffold

Goal: define and test the full ENS identity shape locally.

Allowed scope:

- `packages/ens-identity/` scaffold
- agent card type/schema
- resolver adapter interface
- local/mock resolver implementation
- text-record mapping for `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, and `clearintent.version`
- local/mock ENS fixtures and tests
- Center CLI module/readout stub if it can remain thin and honest
- docs stating this is mock/local ENS readiness, not live ENS proof

Claim level:

- `ens-local-fixture`

Stop point:

- midpoint audit proves identity-critical fields are fixture-driven and not hard-coded
- closeout audit proves local ENS resolution, policy pointer/hash extraction, audit pointer extraction, and degraded/missing-record behavior

### Phase 3B: Live ENS Binding

Goal: bind live ENS or testnet ENS-like records into the ClearIntent flow after Phase 2B has proven live 0G artifact persistence.

Required before starting:

- Phase 2B closeout with exact live 0G claim level
- `.env` values available locally without committing secrets
- selected ENS name/subname or testnet-compatible resolver path
- decision on which records point at live 0G artifacts

Allowed scope:

- live resolver adapter behind the Phase 3A interface
- config-driven ENS name/resolver target
- live read path for address and text records
- binding ENS-derived identity fields and policy hash into the intent flow when supported by the contract layer
- optional subname role proof if feasible without destabilizing the demo
- Center CLI output distinguishing local fixture, live lookup, degraded lookup, and verified binding states

Claim level:

- `ens-live-read` after live address/text-record read succeeds
- `ens-live-bound` only after ENS-derived policy/hash or identity fields are bound into the authority flow with tests or deterministic evidence

Stop point:

- closeout audit proves which live records were read, which bindings are real, which fields remain mocked, and whether subname role proof is implemented or deferred

## Goals

- Keep ENS as the identity/discovery layer, not the authority source.
- Resolve agent identity, agent card URI, policy URI, policy hash, audit pointer, and ClearIntent version from records.
- Preserve explicit degraded states for missing name, missing resolver, missing record, hash mismatch, unsupported network, and live lookup unavailable.
- Avoid hard-coded ENS names, wallet addresses, policy hashes, audit URIs, or 0G artifact refs in implementation or demos.

## Non-goals

- Marketplace or hosted registry.
- Complex rotating resolver infrastructure.
- Production ENS migration tooling.
- Subname role proof as a required 3A deliverable.
- Live 0G artifact claims before Phase 2B smoke testing closes.
- 0G Compute risk/reflection; that remains optional Phase 2C and does not block Phase 3A or 3B.

## Current foundation entering this phase

- `contracts/` defines the canonical authority lifecycle and evidence shapes.
- `packages/core/` enforces contract validation, lifecycle state, evidence summaries, and authority verification.
- `packages/center-cli/` provides direct human commands, deterministic `--json`, and a guided wizard boundary.
- `packages/zerog-memory/` provides local artifact refs, hash validation, and audit-bundle semantics at `local-adapter` claim level.
- `packages/zerog-memory/` live status is readiness-wired but remains blocked/degraded until credentials, live writes, and tokens are available.

## Core intent

Phase 3 makes ClearIntent more capable of discovering who an agent is and where its policy/audit evidence lives. It must not pretend that ENS approval, a text record, or a name resolution replaces policy verification, human review, signing, execution authorization, or 0G artifact proof.

## Canonical distinctions

- ENS identity vs authority approval
- agent card metadata vs policy contract truth
- policy URI vs policy hash verification
- local/mock ENS fixture vs live ENS read
- live ENS read vs ENS-bound authority flow
- 0G Storage proof vs 0G Compute advisory output

## Expected outcome

After 3A, a developer or agent can resolve a fixture-backed ClearIntent agent identity and inspect agent card, policy, audit, and version records without live network dependencies.

After 3B, the same interface can read selected live ENS/testnet records and bind verified identity or policy evidence into the authority flow without hard-coded demo values.

## Human and agent surfaces

If Center CLI behavior is added in 3A or 3B, implementation must cover:

- direct human command, such as `npm run clearintent -- identity status`
- agent-readable JSON command, such as `npm run --silent clearintent -- identity status --json`
- guided wizard route through bare `npm run clearintent`

If the first implementation keeps ENS as a package-only scaffold, document the CLI wizard gap in the phase audit and do not call the operator surface complete.

## Milestone cadence

### Phase 3A

- `3A.1`: package scaffold, types, and record constants
- `3A.2`: local/mock resolver adapter
- `3A.3`: fixtures and tests for required records
- `3A.4`: hash/pointer validation integration with Phase 2A artifact semantics
- `3A.5`: midpoint audit for hard-coded identity and claim boundaries
- `3A.6`: degraded-state handling
- `3A.7`: Center CLI module/status route or documented deferred gap
- `3A.8`: docs, tests, and roadmap routing updates
- `3A.9`: closeout audit

### Phase 3B

- `3B.1`: live resolver configuration and provider boundary
- `3B.2`: live address/text-record read path
- `3B.3`: live record fixture capture without committing secrets
- `3B.4`: bind ENS-derived policy hash or identity fields where contract-compatible
- `3B.5`: midpoint audit for live-record claim boundaries
- `3B.6`: optional subname role proof if feasible
- `3B.7`: Center CLI live/degraded/verified readout
- `3B.8`: docs, tests, and demo prep
- `3B.9`: closeout audit

## Planned artifacts

- `packages/ens-identity/`
- `tests/ens-identity/`
- `docs/audits/phase-3-ens-agent-identity/3a.5-midpoint-audit.md`
- `docs/audits/phase-3-ens-agent-identity/3a.9-closeout-audit.md`
- `docs/audits/phase-3-ens-agent-identity/3b.5-midpoint-audit.md`
- `docs/audits/phase-3-ens-agent-identity/3b.9-closeout-audit.md`
- roadmap/current-state updates after each closeout

## Touchpoints

- `docs/roadmaps/features/feature-03-ens-agent-identity.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `ROADMAP.md`
- `docs/roadmaps/ROADMAP.md`
- `REPO_PROFILE.json`
- `CHANGELOG.md`
- `DECISIONS.md` and the relevant dated decision file if binding semantics change
- `packages/center-cli/` if operator commands are added
- `packages/core/` only if contract-compatible identity binding requires new public primitives

## Validation

Minimum 3A validation:

```bash
npm run validate:scaffold
npm run validate:contracts
npm run validate:center-cli
npm test
npm run typecheck
```

Minimum 3B validation:

```bash
npm run validate:scaffold
npm run validate:contracts
npm run validate:center-cli
npm test
npm run typecheck
npm run --silent clearintent -- memory live-status --json
```

If live ENS or live 0G commands cannot run in the current environment, the audit must say why and preserve the lower claim level.
