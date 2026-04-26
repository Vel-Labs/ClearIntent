# Feature 02: 0G Policy Memory and Audit

## Purpose

Use 0G as the persistence layer for policy, intent, risk, and receipt artifacts.

## Dependencies

- Feature 01 schema draft

## Goals

- store policy artifacts
- store intent artifacts
- store risk reports
- store execution receipts
- retrieve latest policy by pointer
- generate audit bundle links

## Non-goals

- full long-term memory product
- iNFT embedded memory
- production-grade storage migration

## Subphases

### 2.1 Adapter interface

Define `MemoryAdapter` and `AuditStore` interfaces.

### 2.2 Local fixture backend

Create a local backend so tests can run without network dependency.

### 2.3 0G write path

Implement artifact upload/write flow.

### 2.4 0G read path

Implement artifact retrieval and validation.

### 2.5 Midpoint audit

Audit target: artifacts are typed and missing storage is handled honestly.

### 2.6 Audit bundle

Create a single bundle that links prompt, policy, risk, intent, signature, and receipt.

### 2.7 Demo visibility

Expose artifact links for the demo console.

### 2.8 Docs and examples

Document 0G protocol features used.

### 2.9 Closeout audit

Audit target: 0G is doing real persistence work, not cosmetic storage.

## Success criteria

- policy artifact exists
- risk or audit artifact exists
- demo can show artifact link or proof
