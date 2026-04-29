# Current State and Next

## Current state

Governance scaffold exists. Phase 0 now includes `REPO_PROFILE.json`, `docs/agents/START_HERE.md`, repo-local agent skill templates, fresh-agent and closeout templates, scaffold validation, and minimal GitHub hygiene. Phase 1A contract authority baseline is complete under `contracts/`. Phase 1B validation tooling baseline is complete with repo-local Node/TypeScript validation, Vitest contract tests, shared `tests/` quality-gate docs, and a package-level `typecheck` command.

Phase 1C is complete. `packages/core/` now exists with schema-backed contract validation, lifecycle transition checks, lifecycle status/missing-evidence inspection, deterministic hashing helpers, fail-closed authority verification, `packages/core/API.md`, and focused `tests/core/` coverage. The Phase 1C closeout audit is `docs/audits/phase-1-core-authority-kernel/1c-core-package-closeout.md`.

Phase 1D is complete. `packages/core` now exposes `deriveCoreStateSnapshot` with machine-readable evidence summaries, next-action codes, blocking issue codes, degraded-signal visibility, and terminal `audited` handling. The Phase 1D closeout audit is `docs/audits/phase-1-core-authority-kernel/1d-core-lifecycle-state-api-closeout.md`.

Phase 1E is complete. `packages/core` now exposes `evaluateCoreAuthority` for module-facing composition of state snapshots, lifecycle advancement, and authority verification. The Phase 1E closeout audit is `docs/audits/phase-1-core-authority-kernel/1e-core-developer-module-api-closeout.md`.

Phase 1F is complete. The contract/core stability handoff is closed for local authority behavior. The Phase 1F closeout audit is `docs/audits/phase-1-core-authority-kernel/1f-contract-core-stability-handoff-closeout.md`.

Phase 1.5 is complete. `packages/center-cli/` now provides the fixture-backed Center CLI skeleton over `packages/core`, with command routing for Center status/inspect, intent validation/state, authority evaluation, and module list/doctor. Human-readable terminal output is the default. Agent-readable output is available through `--json`; use `npm run --silent clearintent -- <command> --json` when consuming via npm so npm's banner does not precede the JSON payload. The midpoint audit is `docs/audits/phase-1.5-center-cli-skeleton/1.5.5-midpoint-audit.md`; closeout audit is `docs/audits/phase-1.5-center-cli-skeleton/1.5.9-closeout-audit.md`.

Phase 2A is complete locally. `packages/zerog-memory/` now provides the local deterministic memory/audit adapter with `MemoryAdapter`, `AuditStore`, artifact envelope/ref types, storage results with blocked/degraded states, stable payload hashing, local write/read validation, audit-bundle rollup, and a Center-facing local memory doctor. `packages/center-cli/` exposes `module doctor`, `memory status`, `memory check`, and `memory audit-bundle` in human-readable and deterministic JSON modes. The reached claim level is `local-adapter`; live 0G proof remains explicitly absent as `missing_proof` / `live_provider_disabled`. The closeout audit is `docs/audits/phase-2-zerog-policy-memory-audit/2a.9-closeout-audit.md`.

Phase 2B is readiness-stubbed but not closed. The repo has live 0G SDK dependency wiring, `.env.example`, live config parsing, `memory live-status`, and `memory live-smoke` entrypoints. Live upload/readback/hash evidence remains gated on local `.env` values, wallet credentials, explicit live-write opt-in, and funded testnet tokens. Until that smoke pass succeeds, the claim level remains below `0g-write-read`.

Phase 3A is complete locally. `packages/ens-identity/` now provides the local ENS identity scaffold with record constants for `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, and `clearintent.version`; an agent card validation shape; a resolver adapter interface; local/mock and live-unavailable resolvers; fixture-backed records; and explicit blocked/degraded issue codes. `tests/ens-identity/` proves local fixture resolution, record extraction, missing-record behavior, policy hash mismatch handling, and no-live-claim semantics. `packages/center-cli/` exposes `identity status` in human-readable and deterministic JSON modes. The reached claim level is `ens-local-fixture`; live ENS and live 0G-backed identity claims remain absent.

Phase 4A is complete locally. `packages/keeperhub-adapter/` now provides the local KeeperHub execution scaffold with a narrow `ExecutionAdapter` interface, `keeperhub-local-fixture` claim level, verified-intent-to-workflow mapping, local submit/monitor simulation, canonical `ExecutionReceipt` conversion, explicit blocked/degraded issue codes, and Center status helper. `tests/keeperhub-adapter/` proves local mapping, deterministic submit/monitor, canonical receipt validation, fail-closed unsafe submissions, failed/degraded run behavior, unavailable live provider status, and no live/onchain claim semantics. `packages/center-cli/` exposes `execution status` and `keeperhub status` in human-readable and deterministic JSON modes. Live KeeperHub/onchain execution remains absent.

Phase 5A and 5B are complete locally. `packages/signer-adapter/` now provides deterministic ClearIntent EIP-712 typed-data generation, ClearIntent approval preview rendering, deterministic fixture signature evidence compatible with core signature evidence, display warning vocabulary, conditional review prompt semantics, `eth_signTypedData_v4` request-shape prep, typed injected-wallet issue codes, and local ERC-7730 metadata generation/validation. `tests/signer-adapter/` proves typed data, preview, fixture signature evidence, conditional review prompts, metadata, and injected-wallet request shape/status. `packages/center-cli/` exposes `signer status`, `signer preview`, `signer typed-data`, and `signer metadata` in human-readable and deterministic JSON modes. The only reached local claim levels are `signer-local-fixture`, `eip712-local-fixture`, and `erc7730-local-metadata`. Phase 5C is prepared only to `ready-for-operator-test`; real wallet signing, wallet-rendered preview, secure-device display, and vendor-approved Clear Signing remain absent.

## Immediate next action

Run the operator checklist in `docs/roadmaps/OPERATOR_TESTING_2A_3A_4A_5ABC.md`, then run Phase 5C MetaMask/software-wallet signer-only validation with operator wallet evidence before returning to the Phase 2B/3B/4B live-testnet vertical path. Keep 5C at `ready-for-operator-test` until an operator wallet session signs the exact ClearIntent typed payload and records evidence.

Close Phase 2B live 0G Storage once local `.env` values, wallet credentials, explicit live-write opt-in, and funded testnet tokens are available. Then proceed to Phase 3B live ENS binding and Phase 4B live KeeperHub/onchain execution against the proven live evidence.

Phase 2 is split intentionally:

- Phase 2A proved local deterministic artifact storage, hash validation, audit bundle rollup, degraded-state semantics, and Center CLI memory status without live credentials.
- Phase 2B connects the same interfaces to real 0G Storage after credentials, SDK imports, endpoints, and proof level are verified.
- Phase 2C is optional 0G Compute risk/reflection. It is a parking lane for advisory compute output and remains deferred until storage persistence is proven; it does not block Phase 3A or 3B.

Phase 3 is split intentionally:

- Phase 3A is complete and defines the local/mock ENS identity shape: agent card validation, resolver interface, text-record mapping, fixture records, tests, Center CLI identity status, and honest `ens-local-fixture` claim level.
- Phase 3B performs live ENS/testnet reads and binds ENS-derived identity or policy evidence after Phase 2B live 0G closeout evidence exists.

Phase 4 is split intentionally:

- Phase 4A is complete and defines local/mock KeeperHub execution shape: execution adapter interface, workflow mapping, local submit/monitor simulation, receipt conversion, blocked/degraded states, tests, Center CLI status, and honest `keeperhub-local-fixture` claim level.
- Phase 4B performs live KeeperHub/API/CLI/MCP/direct-execution work, captures run or transaction evidence, returns typed `ExecutionReceipt`, and updates `KEEPERHUB_FEEDBACK.md`.

Phase 5 is split intentionally:

- Phase 5A defines signer payload and local approval semantics: EIP-712 typed-data mapping, signer adapter interface, ClearIntent readable preview, deterministic fixture signature, display warnings, and conditional review prompt semantics. Current status: complete locally.
- Phase 5B generates ERC-7730 / Clear Signing metadata locally without vendor or secure-display claims. Current status: complete locally.
- Phase 5C validates a real software wallet path, with MetaMask preferred as the first injected-wallet target. Current status may be only `planned` / `ready-for-operator-test` unless operator wallet evidence exists.
- Phase 5D validates WalletConnect/mobile signing.
- Phase 5E validates hardware-backed signing and any secure-display claims.

Current Phase 5A/5B documentation state:

- 5A midpoint audit: `docs/audits/phase-5-signer-readable-approval/5a.5-midpoint-audit.md`
- 5A closeout audit: `docs/audits/phase-5-signer-readable-approval/5a.9-closeout-audit.md`
- 5B midpoint audit: `docs/audits/phase-5-signer-readable-approval/5b.5-midpoint-audit.md`
- 5B closeout audit: `docs/audits/phase-5-signer-readable-approval/5b.9-closeout-audit.md`
- documented local claim levels: `signer-local-fixture`, `eip712-local-fixture`, `erc7730-local-metadata`
- real wallet claim: none
- wallet-rendered preview claim: none
- secure-device display claim: none
- vendor-approved Clear Signing claim: none
- Phase 5C prep status: `ready-for-operator-test` request-shape/status/docs only; no real MetaMask claim without operator-run evidence.

Current Phase 2A documentation state:

- midpoint audit: `docs/audits/phase-2-zerog-policy-memory-audit/2a.5-midpoint-audit.md`
- closeout audit: `docs/audits/phase-2-zerog-policy-memory-audit/2a.9-closeout-audit.md`
- documented claim level: `local-adapter`
- live 0G claim: none
- Phase 2B requirement: replace the local backend with real 0G write/read behavior without changing artifact semantics, and record the exact claim level reached.
- Phase 2B current gate: local `.env` values, wallet credentials, explicit live-write opt-in, and funded testnet tokens.

Relevant phase packages:

- `docs/roadmaps/phase-1.5-center-cli-skeleton/IMPLEMENTATION_PLAN.md`
- `docs/roadmaps/phase-1.5-center-cli-skeleton/EXECUTION_PROMPT.md`
- `docs/roadmaps/phase-2-zerog-policy-memory-audit/IMPLEMENTATION_PLAN.md`
- `docs/roadmaps/phase-2-zerog-policy-memory-audit/PHASE_2B_READINESS.md`
- `docs/roadmaps/phase-3-ens-agent-identity/IMPLEMENTATION_PLAN.md`
- `docs/roadmaps/phase-4-keeperhub-execution-adapter/IMPLEMENTATION_PLAN.md`
- `docs/roadmaps/phase-5-signer-readable-approval/5A_SIGNER_PAYLOAD_LOCAL_APPROVAL_PLAN.md`
- `docs/roadmaps/phase-5-signer-readable-approval/5B_ERC7730_METADATA_LOCAL_PLAN.md`
- `docs/roadmaps/phase-5-signer-readable-approval/5C_SOFTWARE_WALLET_METAMASK_VALIDATION_PLAN.md`
- `docs/audits/phase-3-ens-agent-identity/3a.5-midpoint-audit.md`
- `docs/audits/phase-3-ens-agent-identity/3a.9-closeout-audit.md`
- `docs/audits/phase-4-keeperhub-execution-adapter/4a.5-midpoint-audit.md`
- `docs/audits/phase-4-keeperhub-execution-adapter/4a.9-closeout-audit.md`

Rationale for the next route:

- Phase 1 proved local contract/core authority behavior.
- Phase 1.5 proved a local Center CLI can render core state and authority evaluation without becoming an authority source.
- Phase 2A established the memory/audit adapter shape before other provider modules depend on storage truth.
- Phase 2B can finish quickly once testnet funds are available, but waiting on tokens should not block local ENS identity shape.
- Phase 3A made ENS identity fixture-driven and testable before live 3B binding or demo integration.
- Phase 4A made execution fixture-driven and testable before live KeeperHub/onchain execution or Guardian Agent wiring.
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

Before starting Phase 2B or adjacent provider adapter work, a fresh checkout should pass:

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

## Recommended sequencing

1. Run Phase 5C MetaMask/software-wallet signer-only validation using `docs/roadmaps/phase-5-signer-readable-approval/5C_SOFTWARE_WALLET_METAMASK_VALIDATION_PLAN.md` if an operator wallet session is available; keep status `ready-for-operator-test` until real evidence exists.
2. When `.env` values and tokens are available, close Phase 2B with live/testnet 0G upload/readback/hash evidence.
3. Implement Phase 3B live/testnet ENS binding against the proven 2B artifact semantics.
4. Implement Phase 4B live/testnet KeeperHub/onchain execution against the proven adapter semantics.
5. Run Phase 5D/5E WalletConnect and hardware utilization validation when the operator devices/sessions are available, with stronger claims reserved for tested evidence.
6. Reconsider optional Phase 2C only if 0G Compute materially improves the hackathon demo or judging story.

## Recommended parallelization

Now that the Center CLI skeleton is stable:

- one agent can prepare Phase 3B live ENS binding after Phase 2B evidence is available
- one agent can prepare the funded-token Phase 2B smoke pass without committing secrets
- one agent can prepare Phase 4B live KeeperHub/onchain execution planning after Phase 2B and 3B evidence is available
- one agent can build Phase 5A/5B signer payload and metadata scaffolding
- one human should own integration and final demo truth

## Do not start yet

- Phase 3B live ENS binding before Phase 2B live 0G closeout
- Phase 4B live KeeperHub/onchain execution before Phase 4A local scaffold and required live credentials/evidence are ready
- Phase 5C/5D/5E real wallet capability claims before actual wallet utilization testing
- Phase 2C 0G Compute unless explicitly selected as a demo accelerator
- demo integration
- webhook delivery
- local OS notification delivery
- Agent Audit dashboard implementation before the onchain, 0G, ENS, KeeperHub, and signer evidence sources exist
- conditional human-review/autonomy mode implementation before the policy contract extension is designed and tested
- ERC-7857 iNFTs
- zk proofs
- auto-rotating ENS addresses
- x402 monetization
- marketplace UI

These are stretch layers, not MVP dependencies.
