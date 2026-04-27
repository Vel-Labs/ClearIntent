# Feature 01: Core Authority Kernel

## Purpose

Create the reusable ClearIntent primitive that turns agent proposals into bounded, typed, auditable intents.

## Why now

Every adapter depends on the intent, policy, risk, and receipt shapes. Without this layer, other agents will build incompatible assumptions.

## Dependencies

- Phase 0 governance scaffold

## Goals

- define top-level `contracts/` as canonical authority truth
- define `AgentIntent`
- define `AgentPolicy`
- define `RiskReport`
- define `HumanReviewCheckpoint`
- define `ExecutionReceipt`
- define lifecycle states
- define fail-closed validation behavior
- create deterministic fixtures

## Non-goals

- real ENS resolution
- real 0G storage
- real KeeperHub execution
- hardware signing
- marketplace features

## Subphases

### 1A Contract authority baseline

Create top-level `contracts/` with canonical lifecycle, JSON schemas, fixtures, and directive documentation.

Required outputs:

- `contracts/README.md`
- `contracts/authority-lifecycle.md`
- `contracts/schemas/`
- `contracts/examples/`

### 1B Contract validation tooling baseline

Add repo-local TypeScript/Node validation tooling before implementation packages so humans and agents can run the same deterministic checks before commits.

Required outputs:

- `package.json`
- `tsconfig.json`
- `scripts/validate-contracts.ts`
- `tests/README.md`
- `tests/contracts/validate-contracts.test.ts`
- Phase 1B closeout audit

Validation commands:

```bash
npm run validate:contracts
npm run test:contracts
npm test
npm run typecheck
```

Status: complete. Phase 1B now includes package and documentation hardening so a new checkout can install dependencies and run the validation gate before `packages/core/` begins.

### 1C Core package implementation readiness

Begin `packages/core/` implementation only after the Phase 1B gate passes locally. Core must consume the top-level contract schemas, examples, and lifecycle docs as source truth.

Required before core work starts:

- dependencies install with `npm install`
- contract validation passes with `npm run validate:contracts`
- contract-only tests pass with `npm run test:contracts`
- all repo-local tests pass with `npm test`
- TypeScript scripts and tests pass `npm run typecheck`
- provider adapters and demo integration remain deferred

The stability handoff is complete only when `contracts/` defines the authority truth and `packages/core/` enforces it through a reusable API that adapters can consume without redefining intent, policy, risk, review, receipt, or audit shapes.

Status: complete. `packages/core/` contains schema-backed validation, lifecycle transition checks, lifecycle status/missing-evidence inspection, deterministic hashing helpers, fail-closed authority verification, callable API documentation, and focused core tests. Closeout audit: `docs/audits/phase-1-core-authority-kernel/1c-core-package-closeout.md`.

### 1D Core lifecycle/state API

Expand the initial lifecycle/status primitives into a stable state API that future Center CLI, webhook, adapter, and demo layers can consume without inventing lifecycle semantics.

Required outputs:

- explicit state snapshot type or equivalent
- derived evidence summary for lifecycle consumers
- stable issue codes for future CLI/adapters
- tests for incomplete, ready-to-advance, blocked, degraded, executed, and audited states
- updated `packages/core/API.md`

Handoff prompt: `docs/roadmaps/phase-1d-core-lifecycle-state-api/FRESH_AGENT_HANDOFF.md`

Status: complete. Closeout audit: `docs/audits/phase-1-core-authority-kernel/1d-core-lifecycle-state-api-closeout.md`.

### 1E Core developer/module-facing API

Polish the core package API so future Center CLI modules, adapters, and examples can consume one stable authority kernel without duplicating lifecycle, validation, state, or verification behavior.

Required outputs:

- clear module-facing exports from `packages/core/src/index.ts`
- API documentation that distinguishes stable public primitives from internal helpers
- developer examples or tests showing expected composition of validation, state snapshot, lifecycle advancement, and authority verification
- focused tests for module-facing API ergonomics

Status: complete. Closeout audit: `docs/audits/phase-1-core-authority-kernel/1e-core-developer-module-api-closeout.md`.

### 1F Contract/core stability handoff

Close Phase 1 by confirming that `contracts/` plus `packages/core/` are stable enough for the next product layer to consume.

Required outputs:

- closeout audit stating whether the contract/core stability handoff is complete
- roadmap/current-state routing update
- validation evidence from `npm run check`
- explicit deferred-scope list for provider adapters, demo integration, live signer behavior, and transport surfaces

Status: complete. Closeout audit: `docs/audits/phase-1-core-authority-kernel/1f-contract-core-stability-handoff-closeout.md`.

### 1.1 Core schema implementation

Implement TypeScript types and validators from the top-level contract schemas.

### 1.2 Lifecycle state machine

Define transitions:

```text
proposed -> policy_checked -> reviewed -> human_approved -> signed -> verified -> submitted -> executed -> audited
```

### 1.3 Deterministic hashing

Add stable hash helpers for policy, action, and intent.

### 1.4 Fixture validation

Create positive and negative examples.

### 1.5 Midpoint audit

Audit target: schemas are coherent and block obvious unsafe ambiguity.

### 1.6 Verification helpers

Add nonce, deadline, executor, signer, and policy-hash checks.

### 1.7 Developer API

Expose a small API other adapters can call.

### 1.8 Docs and tests

Document lifecycle and run focused checks.

### 1.9 Closeout audit

Audit target: core can be consumed by adapters without vendor-specific assumptions. Closeout must explicitly state whether the contract/core stability handoff is complete.

## Success criteria

- stable intent fixture
- stable policy fixture
- stable human review checkpoint fixture
- failure cases documented
- adapters can start without inventing their own schema

Status: met for the local contract/core stability handoff. Live provider behavior remains deferred.
