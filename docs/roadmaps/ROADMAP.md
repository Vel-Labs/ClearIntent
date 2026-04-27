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

Expected deliverables:

- CLI command skeleton over `packages/core`
- module registration or command contract scaffold
- terminal-first human status/readout path
- no provider-specific behavior

Status: recommended next phase.

## Phase 2: 0G Policy Memory and Audit Layer

Goal: store policy, intent, risk report, and execution receipts on 0G.

Primary file: `docs/roadmaps/features/feature-02-zerog-policy-memory-audit.md`

Dependencies:

- Phase 1 intent and policy schema

Key deliverables:

- `packages/zerog-memory/`
- audit bundle writer
- policy loader
- example stored artifacts
- 0G usage explanation for prize eligibility

## Phase 3: ENS Agent Identity Layer

Goal: use ENS as the canonical agent identity and discovery layer.

Primary file: `docs/roadmaps/features/feature-03-ens-agent-identity.md`

Dependencies:

- Phase 1 policy schema
- Phase 2 artifact pointer format, if using 0G URIs in records

Key deliverables:

- `packages/ens-identity/`
- ENS text-record resolution
- agent card schema
- policy and audit pointer resolution
- optional subname role-gate proof

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

## Phase 5: Hardware Signer and Human-Readable Approval

Goal: provide a signer adapter that signs EIP-712 intents and surfaces readable approval status.

Primary file: `docs/roadmaps/features/feature-05-hardware-signer-readable-approval.md`

Dependencies:

- Phase 1 intent schema
- Phase 3 identity fields if included in signed payload

Key deliverables:

- `packages/signer-hardware/`
- EIP-712 signing flow
- readable preview UI
- ERC-7730 metadata output if feasible
- blind-signing/degraded display warning

## Phase 6: Guardian Agent Example

Goal: ship the working example agent required to prove the framework.

Primary file: `docs/roadmaps/features/feature-06-guardian-agent-example.md`

Dependencies:

- Phases 1 through 5 minimally working

Key deliverables:

- `examples/guardian-agent/`
- planner + critic + executor roles
- demo script
- live demo link or reproducible local demo

## Phase 7: Stretch Standards and Monetization

Goal: add optional future-facing layers without endangering the core demo.

Primary file: `docs/roadmaps/features/feature-07-stretch-standards.md`

Candidate stretch layers:

- ERC-8004 identity/reputation registration
- ENSIP-style agent registration text record
- ERC-7857/iNFT encrypted agent payload
- x402 pay-per-use agent endpoint
- zk policy compliance proof
- auto-rotating ENS session addresses

Rule: stretch work must not destabilize the MVP.
