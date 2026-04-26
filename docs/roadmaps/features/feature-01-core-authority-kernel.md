# Feature 01: Core Authority Kernel

## Purpose

Create the reusable ClearIntent primitive that turns agent proposals into bounded, typed, auditable intents.

## Why now

Every adapter depends on the intent, policy, risk, and receipt shapes. Without this layer, other agents will build incompatible assumptions.

## Dependencies

- Phase 0 governance scaffold

## Goals

- define `AgentIntent`
- define `AgentPolicy`
- define `RiskReport`
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

### 1.1 Schema draft

Create initial TypeScript or JSON schema for intent, policy, risk report, and receipt.

### 1.2 Lifecycle state machine

Define transitions:

```text
proposed -> policy_checked -> reviewed -> signed -> verified -> executed -> audited
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
- failure cases documented
- adapters can start without inventing their own schema
