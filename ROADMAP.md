# Roadmap

This is the high-visibility roadmap index for ClearIntent. Detailed phase sequencing lives under `docs/roadmaps/`.

## Current Route

- Current state: `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- Detailed roadmap: `docs/roadmaps/ROADMAP.md`
- Feature roadmap index: `docs/roadmaps/README.md`
- Phase cadence: `docs/governance/phase-cadence.md`
- Audits: `docs/audits/`

## Current Phase

Phase 5A Signer Payload and Local Approval Scaffold plus Phase 5B ERC-7730 / Clear Signing Metadata Local Scaffold are complete locally. Live-gated targets remain Phase 2B live 0G Storage closeout, Phase 3B live ENS binding, Phase 4B live KeeperHub/onchain execution, and Phase 5C/5D/5E real wallet validation.

Completed baseline:

- Phase 0 governance and documentation scaffold
- Phase 1A contract authority baseline under `contracts/`
- Phase 1B validation tooling baseline with TypeScript/Node validation and Vitest contract checks
- Phase 1C `packages/core/` authority primitives with schema-backed validation, lifecycle checks/status inspection, hashing helpers, fail-closed verification, callable API docs, focused tests, and closeout audit
- Phase 1D core lifecycle/state API with machine-readable state snapshots, evidence summaries, next-action codes, degraded-signal visibility, terminal-state handling, tests, and closeout audit
- Phase 1E core developer/module-facing API with stable public exports, `evaluateCoreAuthority`, and composition tests
- Phase 1F contract/core stability handoff closeout
- Phase 1.5 Center CLI skeleton with fixture-backed command routing, human-readable terminal output, deterministic `--json` output, and local module doctor metadata
- Phase 2A local 0G policy memory and audit scaffold with deterministic `packages/zerog-memory/`, local write/read/hash validation, audit-bundle rollup, Center CLI memory commands, and `local-adapter` claim level
- Phase 2B readiness scaffold with 0G SDK import checks, live config/status output, and fail-closed smoke-test gating while testnet credentials and tokens are pending
- Phase 3A ENS Agent Identity local scaffold with `packages/ens-identity/`, local/mock resolver, agent card validation, required ENS text-record mapping, fixture tests, Center CLI `identity status`, and `ens-local-fixture` claim level
- Phase 4A KeeperHub Execution local scaffold with `packages/keeperhub-adapter/`, typed execution adapter interface, local workflow mapping, submit/monitor simulation, canonical receipt conversion, fail-closed tests, Center CLI `execution status` / `keeperhub status`, and `keeperhub-local-fixture` claim level
- Phase 5A/5B local signer payload, approval preview, fixture signature, request-shape prep, and ERC-7730 metadata scaffold with `packages/signer-adapter/`, Center CLI signer routes, focused tests, and claim levels constrained to `signer-local-fixture`, `eip712-local-fixture`, and `erc7730-local-metadata`

Immediate next action:

- Run Phase 5C MetaMask/software-wallet signer-only validation with operator wallet evidence, then return to the Phase 2B/3B/4B live-testnet vertical path.
- Phase 5 plans: `docs/roadmaps/phase-5-signer-readable-approval/5A_SIGNER_PAYLOAD_LOCAL_APPROVAL_PLAN.md`, `docs/roadmaps/phase-5-signer-readable-approval/5B_ERC7730_METADATA_LOCAL_PLAN.md`, and `docs/roadmaps/phase-5-signer-readable-approval/5C_SOFTWARE_WALLET_METAMASK_VALIDATION_PLAN.md`.
- Phase 5A audits: `docs/audits/phase-5-signer-readable-approval/5a.5-midpoint-audit.md` and `docs/audits/phase-5-signer-readable-approval/5a.9-closeout-audit.md`.
- Phase 5B audits: `docs/audits/phase-5-signer-readable-approval/5b.5-midpoint-audit.md` and `docs/audits/phase-5-signer-readable-approval/5b.9-closeout-audit.md`.
- When `.env` and tokens are in place, close Phase 2B with live 0G upload/readback/hash evidence, then proceed to Phase 3B live ENS binding and Phase 4B live KeeperHub/onchain execution.
- Completed Phase 1.5 package: `docs/roadmaps/phase-1.5-center-cli-skeleton/`
- Completed Phase 2A closeout audit: `docs/audits/phase-2-zerog-policy-memory-audit/2a.9-closeout-audit.md`
- Completed Phase 3A closeout audit: `docs/audits/phase-3-ens-agent-identity/3a.9-closeout-audit.md`
- Completed Phase 4A closeout audit: `docs/audits/phase-4-keeperhub-execution-adapter/4a.9-closeout-audit.md`

Phase 5C status: request-shape/status/docs prep is allowed only as `planned` / `ready-for-operator-test`. Do not claim `software-wallet-tested`, wallet-rendered preview, secure-device display, or vendor-approved Clear Signing until an operator-run wallet test records real evidence.

## Feature Order

1. Core Authority Kernel: `docs/roadmaps/features/feature-01-core-authority-kernel.md`
2. 0G Policy Memory and Audit Layer: `docs/roadmaps/features/feature-02-zerog-policy-memory-audit.md`
3. ENS Agent Identity Layer: `docs/roadmaps/features/feature-03-ens-agent-identity.md`
4. KeeperHub Execution Adapter: `docs/roadmaps/features/feature-04-keeperhub-execution-adapter.md`
5. Wallet Signer Adapters and Human-Readable Approval: `docs/roadmaps/features/feature-05-hardware-signer-readable-approval.md`
6. Guardian Agent Example and Agent Audit Dashboard: `docs/roadmaps/features/feature-06-guardian-agent-example.md`
7. Stretch Standards and Monetization: `docs/roadmaps/features/feature-07-stretch-standards.md`

## Roadmap Rule

Root `ROADMAP.md` summarizes and routes. `docs/roadmaps/CURRENT_STATE_AND_NEXT.md` is the operational next-step truth. Feature files and `docs/roadmaps/ROADMAP.md` hold detailed phase scope.
