# Current State and Next

## Current state

Governance scaffold exists. Phase 0 now includes `REPO_PROFILE.json`, `docs/agents/START_HERE.md`, repo-local agent skill templates, fresh-agent and closeout templates, scaffold validation, and minimal GitHub hygiene. Phase 1A contract authority baseline is complete under `contracts/`. Phase 1B validation tooling baseline is complete with repo-local Node/TypeScript validation, Vitest contract tests, shared `tests/` quality-gate docs, and a package-level `typecheck` command.

Phase 1C is complete. `packages/core/` now exists with schema-backed contract validation, lifecycle transition checks, lifecycle status/missing-evidence inspection, deterministic hashing helpers, fail-closed authority verification, `packages/core/API.md`, and focused `tests/core/` coverage. The Phase 1C closeout audit is `docs/audits/phase-1-core-authority-kernel/1c-core-package-closeout.md`.

Phase 1D is complete. `packages/core` now exposes `deriveCoreStateSnapshot` with machine-readable evidence summaries, next-action codes, blocking issue codes, degraded-signal visibility, and terminal `audited` handling. The Phase 1D closeout audit is `docs/audits/phase-1-core-authority-kernel/1d-core-lifecycle-state-api-closeout.md`.

Phase 1E is complete. `packages/core` now exposes `evaluateCoreAuthority` for module-facing composition of state snapshots, lifecycle advancement, and authority verification. The Phase 1E closeout audit is `docs/audits/phase-1-core-authority-kernel/1e-core-developer-module-api-closeout.md`.

Phase 1F is complete. The contract/core stability handoff is closed for local authority behavior. The Phase 1F closeout audit is `docs/audits/phase-1-core-authority-kernel/1f-contract-core-stability-handoff-closeout.md`.

Phase 1.5 is complete. `packages/center-cli/` now provides the fixture-backed Center CLI skeleton over `packages/core`, with command routing for Center status/inspect, intent validation/state, authority evaluation, and module list/doctor. Human-readable terminal output is the default. Agent-readable output is available through `--json`; use `npm run --silent clearintent -- <command> --json` when consuming via npm so npm's banner does not precede the JSON payload. The midpoint audit is `docs/audits/phase-1.5-center-cli-skeleton/1.5.5-midpoint-audit.md`; closeout audit is `docs/audits/phase-1.5-center-cli-skeleton/1.5.9-closeout-audit.md`.

Phase 2A is complete locally. `packages/zerog-memory/` now provides the local deterministic memory/audit adapter with `MemoryAdapter`, `AuditStore`, artifact envelope/ref types, storage results with blocked/degraded states, stable payload hashing, local write/read validation, audit-bundle rollup, and a Center-facing local memory doctor. `packages/center-cli/` exposes `module doctor`, `memory status`, `memory check`, and `memory audit-bundle` in human-readable and deterministic JSON modes. The reached claim level is `local-adapter`; live 0G proof remains explicitly absent as `missing_proof` / `live_provider_disabled`. The closeout audit is `docs/audits/phase-2-zerog-policy-memory-audit/2a.9-closeout-audit.md`.

Phase 2B is complete for live 0G Storage smoke evidence. The repo has live 0G SDK dependency wiring, `.env.example`, live config parsing, `memory live-status`, and `memory live-smoke` entrypoints. Operator evidence reached `0g-write-read-verified` with proof-enabled readback: `rootHash=0x8ee47b16e03de745ebf2e65e94ed3b7341395f506a5fb7c8e299f9974aa22484`, `txHash=0x024cc777830963d7c23500024554ed7692f3cb7562ec44014780f68bfdaa66b7`, degraded reasons `none`. The closeout audit is `docs/audits/phase-2-zerog-policy-memory-audit/2b.9-closeout-audit.md`. Phase 3B later published the demo policy, audit pointer, and agent-card artifacts to live 0G and bound those artifacts through ENS.

Phase 3A is complete locally. `packages/ens-identity/` now provides the local ENS identity scaffold with record constants for `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, and `clearintent.version`; an agent card validation shape; a resolver adapter interface; local/mock and live-unavailable resolvers; fixture-backed records; and explicit blocked/degraded issue codes. `tests/ens-identity/` proves local fixture resolution, record extraction, missing-record behavior, policy hash mismatch handling, and no-live-claim semantics. `packages/center-cli/` exposes `identity status` in human-readable and deterministic JSON modes. The reached claim level is `ens-local-fixture`.

Phase 3B is complete at `ens-live-bound`. `packages/ens-identity/src/live-resolver.ts` provides a live ENS resolver boundary using config-driven `ENS_PROVIDER_RPC` / `PRIVATE_EVM_RPC_URL`, `ENS_CHAIN_ID`, `ENS_NETWORK`, `ENS_NAME`, and optional `ENS_EXPECTED_POLICY_HASH`. `packages/center-cli/` exposes `identity live-status` in human-readable and deterministic JSON modes. `packages/ens-identity/src/bind-records.ts` prepares one ENS Public Resolver `multicall(bytes[])` transaction for the ClearIntent records generated by `memory live-bindings`, and the gated `identity send-bind-records` path submitted the live record update after checking manager/controller authority. Operator evidence: `guardian.agent.clearintent.eth` resolves to `0x00DAfA45939d6Ff57E134499DB2a5AE28cc25ad7`, required records are present, `policy.hash` matches the expected value, live 0G claim is `bound`, ENS multicall transaction is `0x1dce685d1af441208b5ae22f890cbf3e7ed38b2865c04701c874e1f40d5f861b`, block `25005501`, and blocking/degraded reasons are none. Closeout audit: `docs/audits/phase-3-ens-agent-identity/3b.9-closeout-audit.md`.

Phase 4A is complete locally. `packages/keeperhub-adapter/` now provides the local KeeperHub execution scaffold with a narrow `ExecutionAdapter` interface, `keeperhub-local-fixture` claim level, verified-intent-to-workflow mapping, local submit/monitor simulation, canonical `ExecutionReceipt` conversion, explicit blocked/degraded issue codes, and Center status helper. `tests/keeperhub-adapter/` proves local mapping, deterministic submit/monitor, canonical receipt validation, fail-closed unsafe submissions, failed/degraded run behavior, unavailable live provider status, and no live/onchain claim semantics. `packages/center-cli/` exposes `execution status`, `keeperhub status`, `keeperhub live-status`, gated `keeperhub live-submit`, and `keeperhub live-run-status` in human-readable and deterministic JSON modes. Phase 4B has reached `keeperhub-live-submitted`: workflow `r8hbrox9eorgvvlunk72b` accepted execution/run ID `089to8oqegw0r48i63vbj`, and the run-status route reported terminal status `executed` with zero logs and no transaction hash. Phase 4B remains open until the claim boundary is closed as workflow-execution proof or extended to transaction-backed onchain evidence.

Phase 5A and 5B are complete locally. `packages/signer-adapter/` now provides deterministic ClearIntent EIP-712 typed-data generation, ClearIntent approval preview rendering, deterministic fixture signature evidence compatible with core signature evidence, display warning vocabulary, conditional review prompt semantics, `eth_signTypedData_v4` request-shape prep, typed injected-wallet issue codes, and local ERC-7730 metadata generation/validation. `tests/signer-adapter/` proves typed data, preview, fixture signature evidence, conditional review prompts, metadata, and injected-wallet request shape/status. `packages/center-cli/` exposes `signer status`, `signer preview`, `signer typed-data`, and `signer metadata` in human-readable and deterministic JSON modes. The only reached local claim levels are `signer-local-fixture`, `eip712-local-fixture`, and `erc7730-local-metadata`. Phase 5C is prepared only to `ready-for-operator-test`; real wallet signing, wallet-rendered preview, secure-device display, and vendor-approved Clear Signing remain absent.

The intended product abstraction is now hosted-dashboard first, SDK/CLI second. A user should start from a stateless wallet-gated ClearIntent frontend, connect the parent wallet, create or connect a dedicated agent wallet or smart account where implemented, configure policy and escalation rules, store/resolve policy and audit pointers through 0G and ENS, then run the ClearIntent SDK/CLI with only scoped references. The agent-facing runtime may receive ENS references, 0G policy/audit pointers, KeeperHub executor configuration, allowed action parameters, and a scoped session-key or agent-wallet address where available. It must not require parent wallet seed phrases, parent wallet private keys, unrestricted hot-wallet keys, or hidden authority that bypasses ClearIntent verification. This is a product/architecture target; live smart-account/session-key enforcement remains unproven until a dedicated implementation phase records evidence.

## Immediate next action

Proceed with Phase 4B claim-boundary closeout. The 0G/ENS prerequisite evidence exists, the simplified live KeeperHub workflow accepted submit `089to8oqegw0r48i63vbj`, and the monitor route reports terminal status `executed` without transaction evidence. The next gap is deciding whether to close Phase 4B as workflow-execution proof or extend it to a small transaction-backed run. Phase 5C signer validation should be repeated as `software-wallet-tested testnet-integrated` only after the selected 4B claim boundary is closed.

Phase 2 is split intentionally:

- Phase 2A proved local deterministic artifact storage, hash validation, audit bundle rollup, degraded-state semantics, and Center CLI memory status without live credentials.
- Phase 2B connected the same interfaces to real 0G Storage and reached `0g-write-read-verified` for live smoke evidence.
- Phase 2C is optional 0G Compute risk/reflection. It is a parking lane for advisory compute output and remains deferred until storage persistence is proven; it does not block Phase 3A or 3B.

Phase 3 is split intentionally:

- Phase 3A is complete and defines the local/mock ENS identity shape: agent card validation, resolver interface, text-record mapping, fixture records, tests, Center CLI identity status, and honest `ens-local-fixture` claim level.
- Phase 3B is complete at `ens-live-bound`, with `guardian.agent.clearintent.eth` resolving live ENS records to 0G-backed policy, audit, and agent-card artifacts.

Phase 4 is split intentionally:

- Phase 4A is complete and defines local/mock KeeperHub execution shape: execution adapter interface, workflow mapping, local submit/monitor simulation, receipt conversion, blocked/degraded states, tests, Center CLI status, and honest `keeperhub-local-fixture` claim level.
- Phase 4B performs live KeeperHub/API/CLI/MCP/direct-execution work, captures run or transaction evidence, returns typed `ExecutionReceipt`, and updates `KEEPERHUB_FEEDBACK.md`. This is the next open live-evidence layer.

Phase 5 is split intentionally:

- Phase 5A defines signer payload and local approval semantics: EIP-712 typed-data mapping, signer adapter interface, ClearIntent readable preview, deterministic fixture signature, display warnings, and conditional review prompt semantics. Current status: complete locally.
- Phase 5B generates ERC-7730 / Clear Signing metadata locally without vendor or secure-display claims. Current status: complete locally.
- Phase 5C validates a real software wallet path, with MetaMask preferred as the first injected-wallet target. Current status may be only `planned` / `ready-for-operator-test` unless operator wallet evidence exists. The first validation target is `software-wallet-tested signer-only`; after 2B/3B/4B live-testnet evidence exists, repeat 5C for `software-wallet-tested testnet-integrated`.
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
- live 0G claim: Phase 2B smoke reached `0g-write-read-verified`
- Phase 2B evidence: `rootHash=0x8ee47b16e03de745ebf2e65e94ed3b7341395f506a5fb7c8e299f9974aa22484`, `txHash=0x024cc777830963d7c23500024554ed7692f3cb7562ec44014780f68bfdaa66b7`, proof requested, degraded reasons none
- Phase 2B boundary: smoke storage proof only; final demo policy/audit artifacts were published and ENS-bound during Phase 3B

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

Before starting Phase 4B or adjacent live execution work, a fresh checkout should pass:

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
2. Implement Phase 4B live/testnet KeeperHub/onchain execution against the proven adapter semantics and completed 0G/ENS binding.
3. Start Phase 6.6 frontend dashboard planning/execution from `docs/roadmaps/phase-6-guardian-agent-example/6.6_FRONTEND_DASHBOARD_PLAN.md` once the operator confirms the app stack and Alchemy setup thread is underway.
4. Repeat Phase 5C as testnet-integrated after 4B live evidence, then run Phase 5D/5E WalletConnect and hardware utilization validation when the operator devices/sessions are available.
5. Reconsider optional Phase 2C only if 0G Compute materially improves the hackathon demo or judging story.

## Recommended parallelization

Now that the Center CLI skeleton is stable:

- one agent can prepare Phase 4B live KeeperHub/onchain execution against completed 0G/ENS evidence
- one agent can prepare Phase 5C software-wallet validation around the 2B/3B evidence, keeping testnet-integrated claims deferred until 4B exists
- one agent can build the frontend Overview visual system from the Phase 6.6 plan
- one agent can build the Wizard skeleton from the Phase 6.6 plan
- one agent can build the KeeperHub event ingest stub from the Phase 6.6 plan
- one agent can prepare the Alchemy Account Kit adapter boundary while the operator configures Alchemy credentials separately
- one human should own integration and final demo truth

## Do not start yet

- Phase 4B live KeeperHub/onchain execution before Phase 4A local scaffold and required live credentials/evidence are ready
- Phase 5C/5D/5E real wallet capability claims before actual wallet utilization testing
- Phase 2C 0G Compute unless explicitly selected as a demo accelerator
- demo integration beyond the Phase 6.6 planned dashboard path
- hosted Agent Audit dashboard implementation without the Phase 6.6 plan and explicit execution assignment
- agent-wallet or smart-account setup UX outside the Alchemy Account Kit boundary in the Phase 6.6 plan
- live smart-account/session-key enforcement
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
