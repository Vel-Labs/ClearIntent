# Feature 05: Wallet Signer Adapters and Readable Approval

## Purpose

Provide signer adapters that let humans approve bounded EIP-712 intents across software wallets, WalletConnect wallets, smart accounts, and hardware-backed wallets where practical.

## Dependencies

- Feature 01 intent schema
- Feature 03 identity binding if included in signed payload

## Goals

- generate EIP-712 typed data
- show readable approval preview
- connect signer adapters
- sign intent
- report display status honestly
- report wallet capability level honestly
- optionally emit ERC-7730-compatible metadata
- support policy-triggered human review prompts for thresholded autonomy modes

## Non-goals

- branding ClearIntent as a Ledger product
- claiming official secure-screen Clear Signing without provider approval and proof
- hiding blind-signing fallback

## Subphases

### 5.1 EIP-712 payload

Define typed data domain and message.

### 5.2 Human-readable preview

Render action, policy, executor, deadline, and value bounds.

### 5.2A Conditional review prompt semantics

Define how signer and approval surfaces explain why an otherwise autonomous action escalated to human review. Examples include value threshold, large order, new executor, high risk severity, degraded audit write, or policy change.

### 5.3 Software wallet adapter

Implement the first low-friction injected wallet path where practical.

### 5.4 WalletConnect adapter

Scaffold or implement WalletConnect signing where practical.

### 5.5 Hardware signer adapter

Implement hardware signer interface where available. Ledger, Trezor, and Tangem remain adapter-specific paths with capability reporting.

### 5.6 Signature fixture

Add deterministic or mocked signature verification fixture.

### 5.7 Midpoint audit

Audit target: signing claims match actual signer behavior.

### 5.8 ERC-7730 metadata

Generate metadata if feasible.

### 5.9 Degraded display warnings

Expose blind-signing or limited-display warnings.

### 5.10 Demo polish

Make the approval moment clear and honest. Preferred visual: show the same intent through ClearIntent app preview, software wallet signing, WalletConnect where available, and hardware wallet display where available.

If conditional review gates are included in the demo, show one routine action that stays automatic inside policy bounds and one thresholded action that stops for human approval before signing/execution.

### 5.11 Closeout audit

Audit target: the signer flow enforces bounded human approval.

## Success criteria

- typed intent can be signed
- signed intent can be verified
- user-facing preview is clear
- display limitations are documented
- wallet-specific capability level is documented
- conditional review prompts explain the trigger before requesting approval
