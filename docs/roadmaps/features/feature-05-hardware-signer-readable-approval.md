# Feature 05: Hardware Signer and Readable Approval

## Purpose

Provide a signer adapter that lets humans approve bounded EIP-712 intents with hardware-backed signing where available.

## Dependencies

- Feature 01 intent schema
- Feature 03 identity binding if included in signed payload

## Goals

- generate EIP-712 typed data
- show readable approval preview
- connect signer adapter
- sign intent
- report display status honestly
- optionally emit ERC-7730-compatible metadata

## Non-goals

- branding ClearIntent as a Ledger product
- claiming full Clear Signing without proof
- hiding blind-signing fallback

## Subphases

### 5.1 EIP-712 payload

Define typed data domain and message.

### 5.2 Human-readable preview

Render action, policy, executor, deadline, and value bounds.

### 5.3 Signer adapter

Implement hardware/wallet signer interface.

### 5.4 Signature fixture

Add deterministic or mocked signature verification fixture.

### 5.5 Midpoint audit

Audit target: signing claims match actual signer behavior.

### 5.6 ERC-7730 metadata

Generate metadata if feasible.

### 5.7 Degraded display warnings

Expose blind-signing or limited-display warnings.

### 5.8 Demo polish

Make the approval moment clear and honest.

### 5.9 Closeout audit

Audit target: the signer flow enforces bounded human approval.

## Success criteria

- typed intent can be signed
- signed intent can be verified
- user-facing preview is clear
- display limitations are documented
