# Roadmap

This is the high-visibility roadmap index for ClearIntent. Detailed phase sequencing lives under `docs/roadmaps/`.

## Current Route

- Current state: `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- Detailed roadmap: `docs/roadmaps/ROADMAP.md`
- Feature roadmap index: `docs/roadmaps/README.md`
- Phase cadence: `docs/governance/phase-cadence.md`
- Audits: `docs/audits/`

## Current Phase

Phase 1: ClearIntent Core Authority Kernel.

Completed baseline:

- Phase 0 governance and documentation scaffold
- Phase 1A contract authority baseline under `contracts/`
- Phase 1B validation tooling baseline with TypeScript/Node validation and Vitest contract checks
- Phase 1C initial `packages/core/` authority primitives with schema-backed validation, lifecycle checks/status inspection, hashing helpers, fail-closed verification, and focused tests

Immediate next action:

- Continue `packages/core/` toward the full contract/core stability handoff without redefining authority semantics.

## Feature Order

1. Core Authority Kernel: `docs/roadmaps/features/feature-01-core-authority-kernel.md`
2. 0G Policy Memory and Audit Layer: `docs/roadmaps/features/feature-02-zerog-policy-memory-audit.md`
3. ENS Agent Identity Layer: `docs/roadmaps/features/feature-03-ens-agent-identity.md`
4. KeeperHub Execution Adapter: `docs/roadmaps/features/feature-04-keeperhub-execution-adapter.md`
5. Hardware Signer and Human-Readable Approval: `docs/roadmaps/features/feature-05-hardware-signer-readable-approval.md`
6. Guardian Agent Example: `docs/roadmaps/features/feature-06-guardian-agent-example.md`
7. Stretch Standards and Monetization: `docs/roadmaps/features/feature-07-stretch-standards.md`

## Roadmap Rule

Root `ROADMAP.md` summarizes and routes. `docs/roadmaps/CURRENT_STATE_AND_NEXT.md` is the operational next-step truth. Feature files and `docs/roadmaps/ROADMAP.md` hold detailed phase scope.
