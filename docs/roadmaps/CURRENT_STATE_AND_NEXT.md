# Current State and Next

## Current state

Governance scaffold exists. Phase 1A contract authority baseline is scaffolded under `contracts/`. Phase 1B adds repo-local Node/TypeScript validation tooling and shared tests that consume the contract schemas and examples directly.

## Immediate next action

Start the core implementation: implement `packages/core/` against the top-level contracts and keep it passing the Phase 1B validation gate.

Core implementation must consume:

- `contracts/authority-lifecycle.md`
- `contracts/schemas/*.schema.json`
- `contracts/examples/*.json`
- `scripts/validate-contracts.ts`
- `tests/contracts/validate-contracts.test.ts`

## Recommended parallelization

After Phase 1 contracts and core validation are stable:

- one agent can build ENS resolver scaffolding
- one agent can build 0G storage scaffolding
- one agent can build KeeperHub adapter scaffolding
- one agent can build signer adapter scaffolding
- one human should own integration and final demo truth

## Do not start yet

- ERC-7857 iNFTs
- zk proofs
- auto-rotating ENS addresses
- x402 monetization
- marketplace UI

These are stretch layers, not MVP dependencies.
