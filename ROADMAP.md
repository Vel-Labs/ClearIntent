# Roadmap

This is the high-visibility roadmap index for ClearIntent. Detailed phase sequencing lives under `docs/roadmaps/`.

## Current Route

- Current state: `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- Detailed roadmap: `docs/roadmaps/ROADMAP.md`
- Feature roadmap index: `docs/roadmaps/README.md`
- Phase cadence: `docs/governance/phase-cadence.md`
- Audits: `docs/audits/`

## Current Phase

Phase 5A Signer Payload and Local Approval Scaffold plus Phase 5B ERC-7730 / Clear Signing Metadata Local Scaffold are complete locally. Phase 2B live 0G Storage smoke reached `0g-write-read-verified`. Phase 3B live ENS binding is complete at `ens-live-bound` for `guardian.agent.clearintent.eth`, with live 0G policy/audit/agent-card artifacts bound through ENS text records. Phase 4B has reached `keeperhub-live-submitted` for workflow `r8hbrox9eorgvvlunk72b` and corrected execution/run `089to8oqegw0r48i63vbj`; the monitor route reports terminal status `executed` with no transaction hash. Phase 4B remains open until the claim boundary is closed as workflow-execution proof or extended to transaction-backed onchain evidence. Phase 6 now has the initial `apps/web/` authority dashboard and wallet-validator foundation; Phase 5C remains `ready-for-operator-test` until a real wallet session records evidence. Phase 7 is the guided UX/setup wizard.

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
- Phase 2B live 0G Storage smoke with proof-enabled upload/readback/hash validation at claim level `0g-write-read-verified`
- Phase 3A ENS Agent Identity local scaffold with `packages/ens-identity/`, local/mock resolver, agent card validation, required ENS text-record mapping, fixture tests, Center CLI `identity status`, and `ens-local-fixture` claim level
- Phase 3B live ENS binding with `identity live-status`, parent-wallet-oriented `identity bind-records` / `identity send-bind-records`, one Public Resolver multicall over ClearIntent text records, `guardian.agent.clearintent.eth`, and `ens-live-bound` policy-hash verification against live 0G artifacts
- Phase 4A KeeperHub Execution local scaffold with `packages/keeperhub-adapter/`, typed execution adapter interface, local workflow mapping, submit/monitor simulation, canonical receipt conversion, fail-closed tests, Center CLI `execution status` / `keeperhub status`, and `keeperhub-local-fixture` claim level
- Phase 4B live KeeperHub workflow submit and monitor path with `keeperhub live-status`, gated `keeperhub live-submit`, `keeperhub live-run-status`, exported workflow `docs/providers/KeeperHub/clearintent-execution-gate.workflow.json`, workflow ID `r8hbrox9eorgvvlunk72b`, and monitored executed workflow run `089to8oqegw0r48i63vbj` at claim level `keeperhub-live-submitted`
- Phase 5A/5B local signer payload, approval preview, fixture signature, request-shape prep, and ERC-7730 metadata scaffold with `packages/signer-adapter/`, Center CLI signer routes, focused tests, and claim levels constrained to `signer-local-fixture`, `eip712-local-fixture`, and `erc7730-local-metadata`
- Phase 6 foundation with intentional `apps/web/` workspace opening, Next.js dashboard shell, Overview page, authority/evidence state vocabulary, EIP-1193/MetaMask request boundary, Alchemy readiness boundary, canonical payload preview, KeeperHub reported-event ingest stub, and focused web tests

Immediate next action:

- Use the Phase 6 dashboard foundation for operator-run Phase 5C MetaMask/software-wallet validation, while continuing Phase 4B by closing the claim boundary for workflow execution proof or extending to a transaction-backed run, then record canonical `ExecutionReceipt` and audit persistence level.
- Phase 5 plans: `docs/roadmaps/phase-5-signer-readable-approval/5A_SIGNER_PAYLOAD_LOCAL_APPROVAL_PLAN.md`, `docs/roadmaps/phase-5-signer-readable-approval/5B_ERC7730_METADATA_LOCAL_PLAN.md`, and `docs/roadmaps/phase-5-signer-readable-approval/5C_SOFTWARE_WALLET_METAMASK_VALIDATION_PLAN.md`.
- Phase 5A audits: `docs/audits/phase-5-signer-readable-approval/5a.5-midpoint-audit.md` and `docs/audits/phase-5-signer-readable-approval/5a.9-closeout-audit.md`.
- Phase 5B audits: `docs/audits/phase-5-signer-readable-approval/5b.5-midpoint-audit.md` and `docs/audits/phase-5-signer-readable-approval/5b.9-closeout-audit.md`.
- Phase 2B closeout audit: `docs/audits/phase-2-zerog-policy-memory-audit/2b.9-closeout-audit.md`
- Phase 3B closeout audit: `docs/audits/phase-3-ens-agent-identity/3b.9-closeout-audit.md`
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
6. Authority Dashboard and Wallet Validator: `docs/roadmaps/features/feature-06-authority-dashboard-wallet-validator.md`
7. UX Setup Wizard and Operator Flow: `docs/roadmaps/features/feature-07-ux-wizard-flow.md`
8. Stretch Standards and Monetization: `docs/roadmaps/features/feature-08-stretch-standards.md`

## Roadmap Rule

Root `ROADMAP.md` summarizes and routes. `docs/roadmaps/CURRENT_STATE_AND_NEXT.md` is the operational next-step truth. Feature files and `docs/roadmaps/ROADMAP.md` hold detailed phase scope.
