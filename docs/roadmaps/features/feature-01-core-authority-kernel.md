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

Audit target: core can be consumed by adapters without vendor-specific assumptions.

## Success criteria

- stable intent fixture
- stable policy fixture
- stable human review checkpoint fixture
- failure cases documented
- adapters can start without inventing their own schema
