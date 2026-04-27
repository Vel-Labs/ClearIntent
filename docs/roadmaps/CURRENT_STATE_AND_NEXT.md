# Current State and Next

## Current state

Governance scaffold exists. Phase 0 now includes `REPO_PROFILE.json`, `docs/agents/START_HERE.md`, repo-local agent skill templates, fresh-agent and closeout templates, scaffold validation, and minimal GitHub hygiene. Phase 1A contract authority baseline is complete under `contracts/`. Phase 1B validation tooling baseline is complete with repo-local Node/TypeScript validation, Vitest contract tests, shared `tests/` quality-gate docs, and a package-level `typecheck` command.

Phase 1C has started. `packages/core/` now exists with initial schema-backed contract validation, lifecycle transition checks, lifecycle status/missing-evidence inspection, deterministic hashing helpers, fail-closed authority verification, and focused `tests/core/` coverage. It remains an initial kernel, not a completed contract/core stability handoff.

## Immediate next action

Continue the core implementation: expand `packages/core/` against the top-level contracts and keep it passing the Phase 1B validation gate plus focused core tests.

Core implementation must consume:

- `contracts/authority-lifecycle.md`
- `contracts/schemas/*.schema.json`
- `contracts/examples/*.json`
- `scripts/validate-contracts.ts`
- `tests/contracts/validate-contracts.test.ts`
- `docs/governance/stability-handoff.md`
- `packages/core/src/`
- `tests/core/`

Before expanding core business logic, a fresh checkout should pass:

```bash
npm install
npm run validate:scaffold
npm run validate:contracts
npm run test:contracts
npm test
npm run typecheck
npm run check
```

## Recommended parallelization

After Phase 1 contracts and `packages/core/` are stable:

- one agent can build ENS resolver scaffolding
- one agent can build 0G storage scaffolding
- one agent can build KeeperHub adapter scaffolding
- one agent can build signer adapter scaffolding
- one human should own integration and final demo truth

## Do not start yet

- provider adapter implementation
- demo integration
- ERC-7857 iNFTs
- zk proofs
- auto-rotating ENS addresses
- x402 monetization
- marketplace UI

These are stretch layers, not MVP dependencies.
