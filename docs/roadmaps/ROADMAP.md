# Detailed Roadmap

This roadmap is feature-oriented. Each feature has dependency-aware phases and subphases under `docs/roadmaps/features/`.

Root `ROADMAP.md` is the high-visibility roadmap index. This file preserves the detailed phase sequence.

## Phase 0: Governance and documentation scaffold

Goal: establish the repo truth, operating rules, hackathon objective, source-material archive, and phase templates.

Deliverables:

- root README
- `AGENTS.md`
- `REPO_PROFILE.json`
- `.claude/` pointer folder
- docs index
- agent start guide
- repo-local agent skill templates
- repo truth folder
- hackathon objective and rules
- vendor-track eligibility docs
- feature roadmap files
- phase templates
- fresh-agent and closeout templates
- audit philosophy
- scaffold validation command
- minimal GitHub hygiene

Audit: `docs/audits/phase-0.9-governance-closeout.md`

Status: scaffolded, with an added machine-readable repo profile and scaffold validation layer.

## Phase 1: ClearIntent Core Authority Kernel

Goal: build the framework primitive that converts agent proposals into bounded, typed, auditable intents.

Primary file: `docs/roadmaps/features/feature-01-core-authority-kernel.md`

Dependencies:

- Phase 0 governance complete
- intent schema approved
- policy schema approved

Key deliverables:

- `contracts/`
- `packages/core/`
- intent lifecycle state machine
- policy interface
- risk report interface
- deterministic intent fixtures

### Phase 1A: Contract Authority Baseline

Goal: create the non-negotiable top-level authority contract before implementation packages.

Deliverables:

- canonical lifecycle with explicit human intervention gate
- JSON schemas for intent, policy, risk report, human review checkpoint, execution receipt, and audit bundle
- valid and invalid fixtures
- directive docs that tell agents to read `contracts/` before shaping adapters or core behavior

Status: scaffolded.

### Phase 1C: Core package implementation

Goal: make `packages/core/` the executable authority kernel that consumes `contracts/` and exposes reusable primitives before downstream adapters or demos begin.

Initial deliverables:

- schema-backed contract validation loaded from `contracts/schemas/`
- lifecycle transition helpers
- lifecycle status and missing-evidence inspection for future CLI/adapters
- deterministic hash helpers
- fail-closed authority verification for policy, risk report, human review, deadline, signer, executor, identity, and value-limit checks
- focused core tests under `tests/core/`

Status: complete. Closeout audit: `docs/audits/phase-1-core-authority-kernel/1c-core-package-closeout.md`.

### Phase 1D: Core Lifecycle/State API

Goal: expand the initial lifecycle/status primitives into a stable core state API that future Center CLI, webhook, adapter, and demo layers can consume.

Handoff prompt:

- `docs/roadmaps/phase-1d-core-lifecycle-state-api/FRESH_AGENT_HANDOFF.md`

Expected deliverables:

- explicit state snapshot type or equivalent
- derived evidence summary for lifecycle consumers
- stable issue codes for future CLI/adapters
- tests for incomplete, ready-to-advance, blocked, degraded, executed, and audited states
- updated `packages/core/API.md`

Status: complete. Closeout audit: `docs/audits/phase-1-core-authority-kernel/1d-core-lifecycle-state-api-closeout.md`.

### Phase 1E: Core Developer/Module-Facing API

Goal: polish the core package API so future Center CLI modules, adapters, and examples can consume one stable authority kernel without duplicating lifecycle, validation, state, or verification behavior.

Expected deliverables:

- clear module-facing exports from `packages/core/src/index.ts`
- API documentation that distinguishes stable public primitives from internal helpers
- developer examples or tests showing expected composition of validation, state snapshot, lifecycle advancement, and authority verification
- focused tests for module-facing API ergonomics

Status: complete. Closeout audit: `docs/audits/phase-1-core-authority-kernel/1e-core-developer-module-api-closeout.md`.

### Phase 1F: Contract/Core Stability Handoff

Goal: close Phase 1 by confirming `contracts/` plus `packages/core/` are stable enough for the next product layer to consume.

Deliverables:

- Phase 1F closeout audit
- validation evidence from `npm run check`
- roadmap/current-state routing update
- explicit deferred-scope list for provider adapters, demo integration, live signer behavior, and transport surfaces

Status: complete. Closeout audit: `docs/audits/phase-1-core-authority-kernel/1f-contract-core-stability-handoff-closeout.md`.

### Phase 1.5: Center CLI Skeleton

Goal: build the CLI-first product center over the stable core authority API before provider adapters or demo integration.

Rationale:

- `packages/core` is now stable enough to consume, but it is a library, not an operator experience.
- ClearIntent needs a foundational Center that lets humans and AI agents inspect lifecycle state, missing evidence, blocked/degraded conditions, and next actions.
- The CLI is the correct first Center because it is local, auditable, scriptable, and usable by both humans and coding agents.
- Provider adapters should plug into this Center later rather than defining their own fragmented operator surfaces.

Phase package:

- `docs/roadmaps/phase-1.5-center-cli-skeleton/IMPLEMENTATION_PLAN.md`
- `docs/roadmaps/phase-1.5-center-cli-skeleton/EXECUTION_PROMPT.md`

Expected deliverables:

- CLI command skeleton over `packages/core`
- module registration or command contract scaffold
- terminal-first human status/readout path
- deterministic AI-readable JSON output path
- no provider-specific behavior

Usage layering:

- Human-readable layer: default terminal output for operators, with concise status and next action.
- AI-readable layer: `--json` output for agents and automation, with stable issue codes and no leading prose.
- Core authority layer: command behavior derived from `packages/core`, not reimplemented in CLI code.
- Future module layer: module metadata and doctor checks prepare ENS, 0G, KeeperHub, signer, notification, and demo modules to plug in later.

Status: complete. The local CLI skeleton lives under `packages/center-cli/` and is runnable with `npm run clearintent -- <command>`. For parse-safe JSON, use `npm run --silent clearintent -- <command> --json`. Midpoint audit: `docs/audits/phase-1.5-center-cli-skeleton/1.5.5-midpoint-audit.md`. Closeout audit: `docs/audits/phase-1.5-center-cli-skeleton/1.5.9-closeout-audit.md`.

## Phase 2: 0G Policy Memory and Audit Layer

Goal: store policy, intent, risk report, and execution receipts on 0G.

Primary file: `docs/roadmaps/features/feature-02-zerog-policy-memory-audit.md`

Implementation plan: `docs/roadmaps/phase-2-zerog-policy-memory-audit/IMPLEMENTATION_PLAN.md`

Dependencies:

- Phase 1 intent and policy schema

Key deliverables:

- `packages/zerog-memory/`
- audit bundle writer
- policy loader
- example stored artifacts
- 0G usage explanation for prize eligibility

Layering:

- Phase 2A: local deterministic policy memory and audit scaffold with full artifact semantics and Center CLI status.
- Phase 2B: live 0G Storage write/read integration behind the Phase 2A interfaces.
- Phase 2C: optional 0G Compute risk/reflection, deferred until storage persistence is proven.

Status: Phase 2B reached `0g-write-read-verified` for live 0G Storage smoke evidence. Proof-enabled readback succeeded with `rootHash=0x8ee47b16e03de745ebf2e65e94ed3b7341395f506a5fb7c8e299f9974aa22484` and `txHash=0x024cc777830963d7c23500024554ed7692f3cb7562ec44014780f68bfdaa66b7`. Phase 3B then published the demo policy, audit pointer, and agent-card artifacts to live 0G and bound them through ENS records.

## Phase 3: ENS Agent Identity Layer

Goal: use ENS as the canonical agent identity and discovery layer.

Primary file: `docs/roadmaps/features/feature-03-ens-agent-identity.md`

Implementation plan: `docs/roadmaps/phase-3-ens-agent-identity/IMPLEMENTATION_PLAN.md`

Dependencies:

- Phase 1 policy schema
- Phase 2 artifact pointer format, if using 0G URIs in records

Key deliverables:

- `packages/ens-identity/`
- ENS text-record resolution
- agent card schema
- policy and audit pointer resolution
- optional subname role-gate proof

Layering:

- Phase 3A: local/mock ENS identity scaffold with agent card schema, resolver interface, text-record mapping, fixtures, tests, and honest `ens-local-fixture` claim level.
- Phase 3B: live ENS/testnet record read and authority-flow binding after Phase 2B live 0G Storage smoke testing closes.

Status: Phase 3A is complete locally with `packages/ens-identity/`, fixture-backed tests, Center CLI `identity status`, and `ens-local-fixture` claim level. Phase 3B is complete at `ens-live-bound`: `guardian.agent.clearintent.eth` resolves on ENS mainnet to `0x00DAfA45939d6Ff57E134499DB2a5AE28cc25ad7`, required ClearIntent text records are present, `policy.hash` matches the expected policy hash, and the policy/audit/agent-card records point to live 0G artifacts. ENS resolver multicall transaction: `0x1dce685d1af441208b5ae22f890cbf3e7ed38b2865c04701c874e1f40d5f861b`, block `25005501`. Closeout audit: `docs/audits/phase-3-ens-agent-identity/3b.9-closeout-audit.md`.

## Phase 4: KeeperHub Execution Adapter

Goal: convert verified intents into KeeperHub execution workflows.

Primary file: `docs/roadmaps/features/feature-04-keeperhub-execution-adapter.md`

Dependencies:

- Phase 1 intent executor shape
- Phase 2 audit receipt shape

Key deliverables:

- `packages/keeperhub-adapter/`
- workflow create/submit/monitor path
- execution receipt capture
- `KEEPERHUB_FEEDBACK.md`

Layering:

- Phase 4A: local/mock KeeperHub execution scaffold with adapter interface, workflow mapping, local submit/monitor simulation, receipt fixtures, blocked/degraded states, tests, and honest `keeperhub-local-fixture` claim level.
- Phase 4B: live KeeperHub/onchain execution after credentials, funding, selected execution path, and any required 0G/ENS live proof are available.

Status: Phase 4A is complete locally with `packages/keeperhub-adapter/`, fixture-backed tests, Center CLI `execution status` / `keeperhub status`, and `keeperhub-local-fixture` claim level. Phase 4B is unblocked by 0G/ENS prerequisites but remains open until a selected KeeperHub path, live run or transaction evidence, canonical receipt conversion, and audit persistence evidence are recorded.

## Phase 5: Wallet Signer Adapters and Human-Readable Approval

Goal: provide signer adapters that sign EIP-712 intents and surface readable approval status across software wallets, WalletConnect wallets, smart accounts, and hardware-backed wallets where practical.

Primary file: `docs/roadmaps/features/feature-05-hardware-signer-readable-approval.md`

Implementation plans:

- `docs/roadmaps/phase-5-signer-readable-approval/5A_SIGNER_PAYLOAD_LOCAL_APPROVAL_PLAN.md`
- `docs/roadmaps/phase-5-signer-readable-approval/5B_ERC7730_METADATA_LOCAL_PLAN.md`
- `docs/roadmaps/phase-5-signer-readable-approval/5C_SOFTWARE_WALLET_METAMASK_VALIDATION_PLAN.md`

Dependencies:

- Phase 1 intent schema
- Phase 3 identity fields if included in signed payload

Key deliverables:

- `packages/signer-adapter/` or future wallet signer packages
- EIP-712 typed-data payload and signer adapter contract
- local deterministic signature fixture
- software wallet, WalletConnect, and hardware paths when tested
- readable preview UI
- conditional human-review prompts for policy-triggered escalation
- ERC-7730 / Clear Signing metadata output if feasible
- blind-signing/degraded display warning

Layering:

- Phase 5A: Signer Payload and Local Approval Scaffold, including EIP-712 typed-data mapping, signer adapter interface, ClearIntent readable preview, deterministic signature fixture, display status vocabulary, and conditional review prompt semantics.
- Phase 5B: ERC-7730 / Clear Signing Metadata Local Scaffold, generating local metadata artifacts without wallet/vendor approval claims.
- Phase 5C: Software Wallet Validation, with MetaMask as the preferred first injected-wallet EIP-712 target when operator testing is available.
- Phase 5D: WalletConnect / Mobile Validation.
- Phase 5E: Hardware / Secure Display Validation.

Status: Phase 5A and 5B are complete locally with `packages/signer-adapter/`, fixture-backed tests, Center CLI signer routes, and claim levels constrained to `signer-local-fixture`, `eip712-local-fixture`, and `erc7730-local-metadata`. Phase 5C request-shape/status/docs prep is `ready-for-operator-test`, but Phase 5C/5D/5E require real wallet utilization testing and should not claim wallet-rendered, secure-device, or vendor-approved behavior from local fixtures.

Audits:

- 5A midpoint: `docs/audits/phase-5-signer-readable-approval/5a.5-midpoint-audit.md`
- 5A closeout: `docs/audits/phase-5-signer-readable-approval/5a.9-closeout-audit.md`
- 5B midpoint: `docs/audits/phase-5-signer-readable-approval/5b.5-midpoint-audit.md`
- 5B closeout: `docs/audits/phase-5-signer-readable-approval/5b.9-closeout-audit.md`

## Phase 6: Authority Dashboard and Wallet Validator

Goal: ship the wallet-gated authority dashboard and browser-based wallet validation harness needed to prove the human approval path after Phases 1 through 5B.

Primary file: `docs/roadmaps/features/feature-06-authority-dashboard-wallet-validator.md`

Implementation plan: `docs/roadmaps/phase-6-authority-wallet-validator/IMPLEMENTATION_PLAN.md`

Dependencies:

- Phases 1 through 5B locally working
- Phase 5C prepared for operator wallet testing

Key deliverables:

- `apps/web/` Next.js authority dashboard
- intentional repo governance/scaffold opening for frontend scope
- generic EIP-1193/MetaMask-first wallet validation path unless Reown is explicitly selected later
- canonical ClearIntent payload preview before wallet approval
- Phase 5C software-wallet validation support
- hooks for later Phase 5D/5E validation without claiming those surfaces early
- ENS-derived identity and metadata display
- 0G policy/audit artifact reads
- Alchemy-backed onchain authority contract reads and event display
- KeeperHub workflow/run and event evidence display with authenticity boundaries

Dashboard scope:

- The dashboard is an authority viewer and wallet validator, not an admin console, setup wizard, or backend authority service.
- The dashboard is the preferred human validation point: connect parent wallet, inspect the canonical ClearIntent payload, request wallet approval, and verify displayed evidence.
- Generic EIP-1193/MetaMask is the default first wallet path for Phase 5C. Reown remains optional until a later assignment locks it.
- The dashboard reconstructs state from wallet identity, ENS records, 0G-stored evidence, onchain contract state/events through Alchemy, and KeeperHub receipts.
- No traditional database is required for the MVP; private backend records must not become the authority source.
- The first screen should show wallet connection, payload preview, policy/audit evidence, KeeperHub claim boundary, and missing/degraded state clearly.
- KeeperHub events are reported/non-authoritative until authenticated and replay-checked.
- The dashboard must not claim smart-account/session-key enforcement, WalletConnect/mobile validation, or hardware-wallet validation until those are separately proven.

Agent wallet scope:

- The recommended secure setup is a dedicated agent wallet or smart account owned by the user's parent wallet.
- The parent wallet remains the authority for policy/session grants, escalation approval, recovery, and revocation.
- Smart-account/session-key enforcement is the preferred future bounded-automation layer, but it must not be claimed until implemented and verified.
- Until then, the KeeperHub adapter and ClearIntent core policy gate remain the MVP pre-execution blocker for out-of-policy intents.

## Phase 7: UX Setup Wizard and Operator Flow

Goal: turn the validated authority dashboard into a guided operator setup flow.

Primary file: `docs/roadmaps/features/feature-07-ux-wizard-flow.md`

Implementation plan: `docs/roadmaps/phase-7-ux-wizard-flow/IMPLEMENTATION_PLAN.md`

Dependencies:

- Phase 6 authority dashboard and wallet validator
- Phase 5C software-wallet evidence path
- Phase 4B KeeperHub claim boundary closed or explicitly labeled workflow-only

Key deliverables:

- setup wizard with explicit step status
- parent-owned agent wallet or smart-account setup UX where implemented
- policy parameter UX mapped to canonical `AgentPolicy` truth
- ENS and 0G binding flow through approved wallet/operator paths
- KeeperHub workflow/executor setup
- webhook/escalation setup
- SDK/CLI and agent handoff prompt with scoped references only
- test intent and ready/degraded/demo state display

Wizard scope:

- Each step must be classified as `live-read`, `wallet-signed-action`, `operator-external`, `disabled`, or `deferred`.
- The wizard must not request seed phrases, parent private keys, or unrestricted hot-wallet keys.
- The wizard must not mark setup ready unless evidence exists.
- The wizard prepares the operator path for a later Guardian Agent end-to-end demo; it does not itself prove planner/critic/executor autonomy.

## Phase 8: Stretch Standards and Monetization

Goal: add optional future-facing layers without endangering the core demo.

Primary file: `docs/roadmaps/features/feature-08-stretch-standards.md`

Candidate stretch layers:

- ERC-8004 identity/reputation registration
- ENSIP-style agent registration text record
- ERC-7857/iNFT encrypted agent payload
- x402 pay-per-use agent endpoint
- zk policy compliance proof
- auto-rotating ENS session addresses

Rule: stretch work must not destabilize the MVP.
