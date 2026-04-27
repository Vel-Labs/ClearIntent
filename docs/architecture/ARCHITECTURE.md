# Architecture

## System goal

ClearIntent is a framework-level authority layer for autonomous onchain agents.

The system should let agents produce useful plans while preventing them from moving value or changing privileged state unless a bounded intent has been resolved, checked, reviewed, signed, verified, executed, and audited.

## Core thesis

```text
Agent autonomy is not the same as execution authority.
```

ClearIntent gives builders a reusable way to separate those two concepts.

## Architecture planes

### 1. Intent contract plane

Expected paths:

- `contracts/`
- `packages/core/`
- `schemas/`

Responsibilities:

- intent schema
- policy schema
- risk report schema
- execution receipt schema
- nonce and deadline requirements
- typed verification inputs
- event and audit envelope definitions
- explicit human review checkpoint

Rule: the intent contract is the boundary between agent reasoning and executable authority.

`contracts/` is the canonical source of authority truth. `packages/core/` must implement and enforce it. Provider adapters may translate to vendor-specific requests, but they must not replace the shared contracts.

Current implementation note: `packages/core/` now provides the first executable authority primitives for schema-backed validation, lifecycle transitions/status inspection, deterministic hashing, and fail-closed verification. It remains adapter-neutral and must continue to consume `contracts/` rather than becoming a parallel contract layer.

### 2. Agent framework plane

Expected paths:

- `packages/core/`
- `packages/opencleaw-adapter/`
- `examples/guardian-agent/`

Responsibilities:

- planner interface
- critic/reflection interface
- policy loader
- intent builder
- execution adapter selection
- framework integration examples

Rule: the framework plane should be useful without the example app.

### 3. Identity plane

Expected path:

- `packages/ens-identity/`

Responsibilities:

- ENS name resolution
- text record loading
- agent card loading
- policy URI and hash loading
- audit URI loading
- role/subname resolution
- ERC-8004 or ENSIP-25 linkage if implemented

Rule: ENS must do real work. It should not be a cosmetic display name.

### 4. Memory and audit plane

Expected paths:

- `packages/zerog-memory/`
- `packages/zerog-compute/`
- `shared-state/` for local development only

Responsibilities:

- policy storage
- prompt and intent storage
- risk report storage
- signature and execution receipt storage
- persistent agent state
- optional 0G Compute risk reflection

Rule: if a privileged decision cannot be inspected later, it was not properly recorded.

### 5. Signing plane

Expected path:

- `packages/signer-hardware/`

Responsibilities:

- signer discovery
- EIP-712 typed intent signing
- human-readable preview support
- ERC-7730-compatible metadata output where practical
- signer status reporting
- blind-signing or degraded display warnings

Rule: signer integrations are adapters. ClearIntent should not be branded as a single hardware vendor product.

### 6. Execution plane

Expected path:

- `packages/keeperhub-adapter/`

Responsibilities:

- convert approved intents into KeeperHub workflows
- submit verified executions
- monitor execution
- return execution receipts
- write audit results

Rule: execution adapters may submit only after policy and signature verification have passed.

### 7. Demo and developer experience plane

Expected paths:

- `apps/demo-console/`
- `examples/guardian-agent/`
- `docs/hackathon/`

Responsibilities:

- show the full lifecycle
- make the framework easy to understand
- keep demo values configurable
- produce a clean 2-4 minute submission video

Rule: the demo must prove the framework. It should not fake the hard part.

## Critical lifecycle

```text
User goal
  -> Agent planner creates proposed action
  -> ENS identity resolves agent policy and metadata
  -> Policy loader fetches current policy from 0G
  -> Risk critic evaluates the proposed action
  -> Intent builder creates bounded EIP-712 intent
  -> Human reviews readable intent and creates HumanReviewCheckpoint
  -> Hardware signer signs bounded intent
  -> Verifier checks signature, policy hash, nonce, deadline, executor, and bounds
  -> KeeperHub executes approved workflow
  -> Execution receipt and audit bundle are written to 0G
  -> ENS record or agent card points to latest audit state
```

## Fail-closed laws

- Missing ENS identity blocks privileged execution.
- Missing policy blocks execution.
- Policy hash mismatch blocks execution.
- Missing risk report creates degraded state and may block execution depending on policy.
- Missing signature blocks execution.
- Missing human review checkpoint blocks signing and execution.
- Unknown signer blocks execution.
- Expired deadline blocks execution.
- Reused nonce blocks execution.
- Unknown executor blocks execution.
- Execution without audit receipt is degraded and must be visible.

## Standards posture

- EIP-712 is the typed intent signing primitive.
- ERC-7730 is the human-readable display metadata direction.
- ENS is the identity and discovery layer.
- ERC-8004 is a stretch identity/reputation registry alignment.
- ERC-7857 is a stretch private agent payload or iNFT alignment.
- x402 is a stretch payment/access layer.

Do not make draft standards required for the MVP unless implementation reality supports them.
