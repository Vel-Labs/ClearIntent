# Current State and Next

## Current state

Governance scaffold exists. Phase 0 now includes `REPO_PROFILE.json`, `docs/agents/START_HERE.md`, repo-local agent skill templates, fresh-agent and closeout templates, scaffold validation, and minimal GitHub hygiene. Phase 1A contract authority baseline is complete under `contracts/`. Phase 1B validation tooling baseline is complete with repo-local Node/TypeScript validation, Vitest contract tests, shared `tests/` quality-gate docs, and a package-level `typecheck` command.

Phase 1C is complete. `packages/core/` now exists with schema-backed contract validation, lifecycle transition checks, lifecycle status/missing-evidence inspection, deterministic hashing helpers, fail-closed authority verification, `packages/core/API.md`, and focused `tests/core/` coverage. The Phase 1C closeout audit is `docs/audits/phase-1-core-authority-kernel/1c-core-package-closeout.md`.

Phase 1D is complete. `packages/core` now exposes `deriveCoreStateSnapshot` with machine-readable evidence summaries, next-action codes, blocking issue codes, degraded-signal visibility, and terminal `audited` handling. The Phase 1D closeout audit is `docs/audits/phase-1-core-authority-kernel/1d-core-lifecycle-state-api-closeout.md`.

Phase 1E is complete. `packages/core` now exposes `evaluateCoreAuthority` for module-facing composition of state snapshots, lifecycle advancement, and authority verification. The Phase 1E closeout audit is `docs/audits/phase-1-core-authority-kernel/1e-core-developer-module-api-closeout.md`.

Phase 1F is complete. The contract/core stability handoff is closed for local authority behavior. The Phase 1F closeout audit is `docs/audits/phase-1-core-authority-kernel/1f-contract-core-stability-handoff-closeout.md`.

Phase 1.5 is complete. `packages/center-cli/` now provides the fixture-backed Center CLI skeleton over `packages/core`, with command routing for Center status/inspect, intent validation/state, authority evaluation, and module list/doctor. Human-readable terminal output is the default. Agent-readable output is available through `--json`; use `npm run --silent clearintent -- <command> --json` when consuming via npm so npm's banner does not precede the JSON payload. The midpoint audit is `docs/audits/phase-1.5-center-cli-skeleton/1.5.5-midpoint-audit.md`; closeout audit is `docs/audits/phase-1.5-center-cli-skeleton/1.5.9-closeout-audit.md`.

## Immediate next action

Start Phase 2A: local 0G policy memory and audit scaffold. Phase 2 is split intentionally:

- Phase 2A proves local deterministic artifact storage, hash validation, audit bundle rollup, degraded-state semantics, and Center CLI memory status without live credentials.
- Phase 2B connects the same interfaces to real 0G Storage after credentials, SDK imports, endpoints, and proof level are verified.
- Phase 2C is optional 0G Compute risk/reflection and remains deferred until storage persistence is proven.

Relevant phase packages:

- `docs/roadmaps/phase-1.5-center-cli-skeleton/IMPLEMENTATION_PLAN.md`
- `docs/roadmaps/phase-1.5-center-cli-skeleton/EXECUTION_PROMPT.md`
- `docs/roadmaps/phase-2-zerog-policy-memory-audit/IMPLEMENTATION_PLAN.md`

Rationale for the next route:

- Phase 1 proved local contract/core authority behavior.
- Phase 1.5 proved a local Center CLI can render core state and authority evaluation without becoming an authority source.
- Phase 2A should establish the memory/audit adapter shape before other provider modules depend on storage truth.
- Future ENS, KeeperHub, signer, notification, and demo layers should plug into the Center/module shape instead of creating fragmented operator surfaces.

Structure for usage:

- Human-readable layer: default terminal output with concise status, next action, missing evidence, and blocked/degraded state.
- AI-readable layer: deterministic `--json` output with stable issue codes and next-action codes, no leading prose.
- Core authority layer: all commands consume `packages/core` public primitives such as `deriveCoreStateSnapshot` and `evaluateCoreAuthority`.
- Module layer: `module list` and `module doctor` establish a registration/health-check shape for future feature modules without loading real providers yet.

Phase 1.5 implementation consumed:

- `contracts/authority-lifecycle.md`
- `contracts/schemas/*.schema.json`
- `contracts/examples/*.json`
- `scripts/validate-contracts.ts`
- `tests/contracts/validate-contracts.test.ts`
- `docs/governance/stability-handoff.md`
- `packages/core/src/`
- `tests/core/`
- `packages/core/API.md`
- `docs/audits/phase-1-core-authority-kernel/1c-core-package-closeout.md`
- `docs/audits/phase-1-core-authority-kernel/1d-core-lifecycle-state-api-closeout.md`
- `docs/audits/phase-1-core-authority-kernel/1e-core-developer-module-api-closeout.md`
- `docs/audits/phase-1-core-authority-kernel/1f-contract-core-stability-handoff-closeout.md`
- `docs/roadmaps/phase-1.5-center-cli-skeleton/IMPLEMENTATION_PLAN.md`

Before starting Phase 2A or provider adapter work, a fresh checkout should pass:

```bash
npm install
npm run validate:scaffold
npm run validate:contracts
npm run validate:center-cli
npm run test:contracts
npm test
npm run typecheck
npm run check
```

## Recommended parallelization

Now that the Center CLI skeleton is stable:

- one agent can build ENS resolver scaffolding
- one agent can build 0G storage scaffolding
- one agent can build KeeperHub adapter scaffolding
- one agent can build signer adapter scaffolding
- one human should own integration and final demo truth

## Do not start yet

- provider adapter implementation
- demo integration
- webhook delivery
- local OS notification delivery
- Agent Audit dashboard implementation before the onchain, 0G, ENS, KeeperHub, and signer evidence sources exist
- ERC-7857 iNFTs
- zk proofs
- auto-rotating ENS addresses
- x402 monetization
- marketplace UI

These are stretch layers, not MVP dependencies.
