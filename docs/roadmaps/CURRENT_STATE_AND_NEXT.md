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

Phase 4A is complete locally. `packages/keeperhub-adapter/` now provides the local KeeperHub execution scaffold with a narrow `ExecutionAdapter` interface, `keeperhub-local-fixture` claim level, verified-intent-to-workflow mapping, local submit/monitor simulation, canonical `ExecutionReceipt` conversion, explicit blocked/degraded issue codes, and Center status helper. `tests/keeperhub-adapter/` proves local mapping, deterministic submit/monitor, canonical receipt validation, fail-closed unsafe submissions, failed/degraded run behavior, unavailable live provider status, and no live/onchain claim semantics. `packages/center-cli/` exposes `execution status`, `keeperhub status`, `keeperhub live-status`, gated `keeperhub live-submit`, and `keeperhub live-run-status` in human-readable and deterministic JSON modes. Phase 4B is closed at `keeperhub-live-submitted` workflow-execution proof: workflow `r8hbrox9eorgvvlunk72b` accepted execution/run ID `089to8oqegw0r48i63vbj`, and the run-status route reported terminal status `executed` with zero logs and no transaction hash. The exported workflow artifact now keeps only `ClearIntent Execution Gate -> Evaluate ClearIntent Gate`; the `Send ClearIntent Event` node remains disabled and disconnected until the frontend event route exists.

Phase 5A and 5B are complete locally. `packages/signer-adapter/` now provides deterministic ClearIntent EIP-712 typed-data generation, ClearIntent approval preview rendering, deterministic fixture signature evidence compatible with core signature evidence, display warning vocabulary, conditional review prompt semantics, `eth_signTypedData_v4` request-shape prep, typed injected-wallet issue codes, and local ERC-7730 metadata generation/validation. `tests/signer-adapter/` proves typed data, preview, fixture signature evidence, conditional review prompts, metadata, and injected-wallet request shape/status. `packages/center-cli/` exposes `signer status`, `signer preview`, `signer typed-data`, and `signer metadata` in human-readable and deterministic JSON modes. The only reached local claim levels are `signer-local-fixture`, `eip712-local-fixture`, and `erc7730-local-metadata`. Phase 5C is prepared only to `ready-for-operator-test`; real wallet signing, wallet-rendered preview, secure-device display, and vendor-approved Clear Signing remain absent.

The intended product abstraction is now hosted-dashboard first, SDK/CLI second. The phase boundary is split intentionally:

- Phase 6 is the authority dashboard and wallet validator. It lets a human connect a wallet, inspect the canonical ClearIntent payload, validate the Phase 5C software-wallet approval path, and reflect ENS/0G/KeeperHub/signer evidence without making the frontend the authority source.
- Phase 7 is the UX/setup wizard. It builds the guided operator flow for agent account setup, policy configuration, ENS/0G binding, KeeperHub routing, escalation, SDK/CLI handoff, and ready-state display after Phase 6 proves the authority/wallet surface.

Phase 6 foundation is now implemented locally under `apps/web/`. The repo intentionally opened `apps/web/` in scaffold/profile governance, added root web scripts, and created a Next.js dashboard shell with Overview as the first page. The current default Overview renders `unconnected`/missing evidence, a clearly labeled demo fixture lane, canonical ClearIntent payload preview before wallet approval, wallet validation status, provider evidence cards, and a KeeperHub reported-event boundary. Supporting modules model `unconnected`, `connected-unconfigured`, `partially-configured`, `configured`, `degraded`, and `demo`; provide generic EIP-1193/MetaMask request construction for `eth_signTypedData_v4`; report Alchemy readiness without enforcement claims; and validate KeeperHub reported event shape without treating events as trusted evidence.

The agent-facing runtime may receive ENS references, 0G policy/audit pointers, KeeperHub executor configuration, allowed action parameters, and a scoped session-key or agent-wallet address where available. It must not require parent wallet seed phrases, parent wallet private keys, unrestricted hot-wallet keys, or hidden authority that bypasses ClearIntent verification. Live smart-account/session-key enforcement remains unproven until a dedicated implementation phase records evidence.

## Immediate next action

Use the Phase 6 dashboard foundation for operator-run Phase 5C MetaMask/software-wallet signer-only validation. The 0G/ENS prerequisite evidence exists, and Phase 4B is intentionally closed as KeeperHub workflow-execution proof, not transaction-backed onchain execution. Phase 5C `testnet-integrated` claims remain limited to the evidence actually captured.

Phase 2 is split intentionally:

- Phase 2A proved local deterministic artifact storage, hash validation, audit bundle rollup, degraded-state semantics, and Center CLI memory status without live credentials.
- Phase 2B connected the same interfaces to real 0G Storage and reached `0g-write-read-verified` for live smoke evidence.
- Phase 2C is optional 0G Compute risk/reflection. It is a parking lane for advisory compute output and remains deferred until storage persistence is proven; it does not block Phase 3A or 3B.

Phase 3 is split intentionally:

- Phase 3A is complete and defines the local/mock ENS identity shape: agent card validation, resolver interface, text-record mapping, fixture records, tests, Center CLI identity status, and honest `ens-local-fixture` claim level.
- Phase 3B is complete at `ens-live-bound`, with `guardian.agent.clearintent.eth` resolving live ENS records to 0G-backed policy, audit, and agent-card artifacts.

Phase 4 is split intentionally:

- Phase 4A is complete and defines local/mock KeeperHub execution shape: execution adapter interface, workflow mapping, local submit/monitor simulation, receipt conversion, blocked/degraded states, tests, Center CLI status, and honest `keeperhub-local-fixture` claim level.
- Phase 4B is complete at workflow-execution proof. Transaction-backed KeeperHub execution remains a follow-up if the demo needs onchain execution evidence.

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
- Future ENS, KeeperHub, signer, notification, frontend, wizard, and demo layers should plug into the Center/module shape instead of creating fragmented operator surfaces.

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

1. Run Phase 5C MetaMask/software-wallet signer-only validation through the Phase 6 dashboard when an operator wallet session is available; keep status `ready-for-operator-test` until real evidence exists.
2. Harden Phase 6 provider reads only through thin wrappers over existing adapter packages, preserving the current non-authoritative dashboard boundary.
3. Repeat Phase 5C as testnet-integrated against the closed 0G/ENS/KeeperHub workflow evidence, then run Phase 5D/5E WalletConnect and hardware utilization validation when the operator devices/sessions are available.
4. Add a transaction-backed KeeperHub execution follow-up only if the demo needs onchain execution evidence beyond workflow orchestration.
5. Start Phase 7 UX/setup wizard from `docs/roadmaps/phase-7-ux-wizard-flow/IMPLEMENTATION_PLAN.md` only after the Phase 6 authority/wallet surface is materially working.
6. Reconsider optional Phase 2C only if 0G Compute materially improves the hackathon demo or judging story.

## Recommended parallelization

Now that the Center CLI skeleton is stable:

- one agent can prepare Phase 5C software-wallet validation around the 2B/3B evidence and Phase 6 dashboard harness, keeping testnet-integrated claims deferred until 4B exists
- one agent can build the frontend Overview visual system from the Phase 6 authority dashboard plan
- one agent can build the authority/evidence state model from the Phase 6 plan
- one agent can build the KeeperHub event ingest stub from the Phase 6 plan
- one agent can prepare the Alchemy Account Kit adapter boundary while the operator configures Alchemy credentials separately
- one later agent can build the Phase 7 Wizard skeleton after Phase 6 state and wallet validation are stable
- one human should own integration and final demo truth

## Do not start yet

- transaction-backed KeeperHub/onchain execution claims without a known executor and transaction hash
- Phase 5C/5D/5E real wallet capability claims before actual wallet utilization testing
- Phase 2C 0G Compute unless explicitly selected as a demo accelerator
- demo integration beyond the Phase 6 authority dashboard and Phase 7 wizard paths
- hosted authority dashboard implementation without the Phase 6 plan and explicit execution assignment
- agent-wallet or smart-account setup UX before the Phase 7 wizard plan or outside the Alchemy Account Kit boundary
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
