# DECISIONS

Use this file to record durable architectural decisions.

## 2026-04-25: Project name is ClearIntent

- Status: Accepted
- Context: The original ideation centered on Ledger-backed security, but vendor branding would make the repo feel like a single-integration demo.
- Decision: Use `ClearIntent` as the neutral product name.
- Consequences: Ledger-compatible hardware signing is a feature and adapter, not the project identity.

## 2026-04-25: Build framework primitive first, example agent second

- Status: Accepted
- Context: The 0G framework track rewards core extensions, tooling, and infrastructure primitives that other builders can use.
- Decision: Treat the authority lifecycle as the product. Build Guardian Agent as the working example.
- Consequences: The repo must expose reusable modules, not just a hard-coded demo.

## 2026-04-25: ENS is canonical agent identity, not cosmetic naming

- Status: Accepted
- Context: ENS prize eligibility requires identity, metadata, gating, discovery, or coordination to be real.
- Decision: ClearIntent will use ENS records to resolve agent address, policy pointer, audit pointer, metadata, and role/subname information where feasible.
- Consequences: Demos must not hard-code values that should be resolved through ENS.

## 2026-04-25: 0G owns policy memory and audit trail for the hackathon build

- Status: Accepted
- Context: 0G alignment is strongest when ClearIntent is a framework primitive with persistent memory, audit storage, and optional compute reflection.
- Decision: Store policy, intent, risk report, signature, and execution receipt artifacts through a 0G adapter.
- Consequences: Local files can be development fixtures, but the prize demo should show 0G-backed artifacts.

## 2026-04-25: KeeperHub is the first execution adapter

- Status: Accepted
- Context: KeeperHub is directly aligned with reliable agent execution, workflow monitoring, and developer-facing integrations.
- Decision: Build a reusable KeeperHub adapter that executes only verified intents.
- Consequences: The adapter should be documented as mergeable infrastructure, not a one-off script.

## 2026-04-25: EIP-712 is the MVP signing primitive

- Status: Accepted
- Context: Typed intent signing is achievable and understandable during the hackathon.
- Decision: Use EIP-712 for typed agent intents.
- Consequences: Replay protection must be implemented explicitly through nonce, deadline, chain ID, and verifying contract fields.

## 2026-04-25: ERC-7730 is a stretch-readable-display layer, not a blocker

- Status: Accepted
- Context: Clear Signing metadata is valuable, but full signer display support may depend on wallet and hardware environment.
- Decision: Generate human-readable approval UI and ERC-7730-compatible metadata if feasible, but do not block the MVP on full device-native Clear Signing.
- Consequences: Documentation must clearly state what is actually displayed and where.

## 2026-04-25: ERC-8004, ERC-7857, x402, and zk are stretch layers

- Status: Accepted
- Context: These standards support a strong future stack, but full implementation risks diluting the core demo.
- Decision: Keep them in the roadmap and implement only if the MVP is stable.
- Consequences: Do not claim eligibility based on incomplete stretch layers.

## 2026-04-25: Contracts folder is the authority contract layer

- Status: Accepted
- Context: ClearIntent needs shared shapes and primitives locked before provider adapters or implementation packages start.
- Decision: Create top-level `contracts/` as the canonical information contract for lifecycle states, intent, policy, risk report, human review checkpoint, execution receipt, audit bundle, and fixtures.
- Consequences: `packages/core/` implements and enforces these contracts. Provider adapters consume or wrap them, but do not redefine authority semantics locally.

## 2026-04-25: Human review is an explicit lifecycle gate

- Status: Accepted
- Context: The project must support human intervention and testing throughout the lifecycle, not only final signing.
- Decision: Add `human_approved` as a lifecycle state and define `HumanReviewCheckpoint` as a required contract before signing or execution.
- Consequences: Signing is not treated as a substitute for review. Demo and adapter flows must expose a pause point where a human can inspect the exact intent hash, policy hash, risk report, warnings, and executor target.

## 2026-04-26: Contract/core stability handoff gates downstream work

- Status: Accepted
- Context: ClearIntent can only parallelize provider adapters and demo implementation safely after canonical authority truth and executable enforcement are stable.
- Decision: Treat `contracts/` plus `packages/core/` as the final stability handoff before ENS, 0G, KeeperHub, signer, Ledger, or demo work proceeds.
- Consequences: Future scaffolds should include this pattern by default when correctness, replayability, or multi-agent implementation matter. Adapters and demos must consume the contract/core API rather than becoming alternate sources of truth.
