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

Current implementation note: Phase 3A now provides `packages/ens-identity/` with local ENS text-record mapping, agent card validation, a local/mock resolver, a live-unavailable resolver, and `ens-local-fixture` tests. It proves the discovery shape locally only; live ENS resolution and ENS-bound authority flow remain Phase 3B.

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
- future wallet signer packages or adapters

Responsibilities:

- signer discovery
- EIP-712 typed intent signing
- human-readable preview support
- ERC-7730-compatible metadata output where practical
- signer status reporting
- blind-signing or degraded display warnings
- software wallet support where practical
- WalletConnect support where practical
- smart-account signer support where practical
- hardware-backed signing where practical

Rule: signer integrations are adapters. ClearIntent should not be branded as a single hardware vendor product or as a single wallet product.

ClearIntent's baseline signer claim is clear-signing-ready typed intents plus ClearIntent-rendered human-readable approval metadata. Wallet-rendered previews, secure-device display, and vendor-approved Clear Signing are separate capability levels that must be tested and documented per wallet path.

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

- `packages/center-cli/`
- `apps/web/`
- `apps/demo-console/`
- `examples/guardian-agent/`
- `docs/hackathon/`

Responsibilities:

- local Center CLI for human and AI-readable lifecycle inspection
- fixture-backed command routing before provider adapters
- module registry and doctor checks for future adapter readiness
- show the full lifecycle
- make the framework easy to understand
- keep demo values configurable
- produce a clean 2-4 minute submission video

Rule: the demo must prove the framework. It should not fake the hard part.

Current implementation note: `packages/center-cli/` is the product-center skeleton over `packages/core`. It renders core-derived state, validation, authority evaluation, and local module metadata, but it does not own authority rules and does not implement provider behavior.

### 8. Hosted dashboard and agent-wallet plane

Expected paths:

- `apps/web/`
- future smart-account or account-abstraction adapter package
- relevant wallet provider notes under `docs/providers/Wallets/`

Responsibilities:

- stateless wallet-gated entrypoint for humans
- parent-wallet authentication
- Phase 6 authority dashboard and wallet validation
- Phase 7 agent wallet or smart-account creation/connection where implemented
- Phase 7 policy configuration and escalation-mode UX
- ENS/0G/onchain/KeeperHub evidence visualization
- audit-log and blocked-intent display
- configuration export for local SDK/CLI runtime

Rule: the hosted frontend is an interface over wallet-owned authority and decentralized/provider evidence. It must not custody secrets, store private authority records as canonical truth, or become the hidden policy source.

Phase split: Phase 6 proves the authority dashboard, canonical payload preview, wallet approval validation, and provider evidence reflection. Phase 7 builds the guided setup wizard on top of that validated surface.

Preferred product flow:

```text
human connects parent wallet in hosted dashboard
  -> dashboard creates/connects an agent wallet or smart account
  -> human configures policy and escalation thresholds
  -> policy/audit references are written to 0G and discoverable through ENS
  -> human runs ClearIntent SDK/CLI using those references
  -> agent proposes intents to SDK/CLI/runtime
  -> ClearIntent validates and blocks/escalates before signing or execution
```

The parent wallet should see the user's ClearIntent content by resolving the user's own ENS, 0G, onchain, and KeeperHub evidence. The dashboard may cache UI state locally in the browser, but persistent authority must come from signed wallet actions and explicit artifact references.

## Critical lifecycle

```text
User goal
  -> Agent planner creates proposed action
  -> ENS identity resolves agent policy and metadata
  -> Policy loader fetches current policy from 0G
  -> Risk critic evaluates the proposed action
  -> Intent builder creates bounded EIP-712 intent
  -> Human reviews readable intent and creates HumanReviewCheckpoint
  -> Wallet or hardware signer signs bounded intent
  -> Verifier checks signature, policy hash, nonce, deadline, executor, and bounds
  -> KeeperHub executes approved workflow
  -> Execution receipt and audit bundle are written to 0G
  -> ENS record or agent card points to latest audit state
```

## Agent input boundary

The agent-facing SDK/CLI may receive:

- user-approved policy URI/hash
- ENS identity reference
- 0G audit/policy pointers
- KeeperHub executor configuration
- allowed action parameters
- session-key or agent-wallet address if that key is scoped, revocable, and not the parent wallet key

The agent-facing SDK/CLI must not require or encourage:

- parent wallet seed phrases
- parent wallet private keys
- unrestricted hot-wallet keys
- raw secrets stored in agent-readable workspaces
- authority paths that bypass policy verification, review gates, signer adapters, or execution receipts

The recommended secure setup is a dedicated agent wallet or smart account owned by the user's parent wallet. The parent wallet remains the authority and escalation signer. Routine actions may be delegated only when policy bounds are explicit; out-of-policy actions escalate to human review.

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
- ERC-7730 is the human-readable display metadata direction for clear-signing-ready wallet support.
- ENS is the identity and discovery layer.
- ERC-8004 is a stretch identity/reputation registry alignment.
- ERC-7857 is a stretch private agent payload or iNFT alignment.
- x402 is a stretch payment/access layer.

Do not make draft standards required for the MVP unless implementation reality supports them.
