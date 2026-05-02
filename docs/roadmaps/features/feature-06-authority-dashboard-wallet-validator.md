# Feature 06: Authority Dashboard and Wallet Validator

## Purpose

Build the first ClearIntent frontend as an authority-layer dashboard and wallet-validation harness.

Phase 6 exists because Phases 5C/5D/5E cannot be honestly validated from CLI output alone. The repo has local signer payload and ERC-7730 metadata scaffolds, but real wallet-facing approval needs a browser surface that can connect a parent wallet, render the canonical ClearIntent payload, request EIP-712 signing, and reflect ENS, 0G, KeeperHub, and signer evidence without becoming the authority source.

## Dependencies

- Feature 01 core authority primitives
- Feature 02 0G storage/audit evidence
- Feature 03 ENS identity evidence
- Feature 04 KeeperHub adapter and live claim-boundary routing
- Feature 05A/5B signer payload and ERC-7730 metadata scaffolds

## Goals

- `apps/web/` frontend opened intentionally in repo governance and scaffold validation.
- Wallet-gated authority dashboard using a generic EIP-1193/MetaMask-first path unless a later assignment selects Reown explicitly.
- Canonical ClearIntent payload preview shared with CLI, EIP-712 typed data, ERC-7730 metadata, webhook payloads, and 0G audit artifacts.
- Phase 5C software-wallet validation surface for real `eth_signTypedData_v4` request/display/signature evidence.
- Future hooks for Phase 5D WalletConnect/mobile and Phase 5E hardware-backed validation without claiming them early.
- ENS, 0G, KeeperHub, signer, and wallet evidence reflection from provider/configured state, not hard-coded demo completion state.
- KeeperHub event ingest stub with explicit authenticity, replay, and non-authoritative display boundaries.
- Clear connected/configured/degraded/demo state vocabulary.

## Non-goals

- Full onboarding/setup wizard.
- Editable policy management.
- ENS binding, 0G publishing, KeeperHub workflow creation, or agent-account setup as first-pass frontend writes.
- Planner/critic/executor Guardian Agent implementation.
- Live smart-account/session-key enforcement claims.
- Ledger Clear Signing, WalletConnect/mobile, or hardware-wallet claims before operator-run evidence exists.
- Private database authority truth.
- Marketplace, x402, iNFT, zk, MCP server, or monetization surfaces.

## Subphases

### 6.1 Scope and governance opening

Open `apps/web/` deliberately by updating `REPO_PROFILE.json`, `docs/FILE_TREE.md`, roadmap indexes, and scaffold expectations. Define the package/workspace strategy before worker implementation starts.

### 6.2 Frontend shell and authority state model

Build the dark operational dashboard shell with Overview as the initial page. Model `unconnected`, `connected-unconfigured`, `partially-configured`, `configured`, `degraded`, and `demo` states without fake completion data.

### 6.3 Wallet connection and software-wallet validator

Implement or stub a clear wallet adapter boundary. MetaMask/generic EIP-1193 is the default first target for Phase 5C; Reown remains optional unless explicitly selected. The dashboard must show parent-wallet connected state and support real EIP-712 request/display validation when an operator wallet session exists.

### 6.4 Evidence reflection and provider wrappers

Render ENS, 0G, KeeperHub, signer, and wallet evidence through thin app wrappers over repo adapter packages. Frontend modules may format provider evidence, but must not redefine authority semantics or duplicate canonical shapes.

### 6.5 Midpoint audit

Audit target: the dashboard does not request secrets, does not show fake completion data, separates connected/configured/degraded/demo states, keeps provider reads behind adapter boundaries, and correctly labels KeeperHub workflow execution as distinct from onchain transaction execution.

### 6.6 KeeperHub event ingest and payload preview

Add `POST /api/keeperhub/events` as a KeeperHub-specific event ingest stub. Shape validation alone is not enough: token/signature checks, replay/timestamp handling, and source binding must be designed before events can be displayed as trusted evidence. Until then, render them as reported/non-authoritative events.

### 6.7 5C validation workflow

Use the dashboard to validate software-wallet signing evidence for Phase 5C. Record whether evidence is signer-only or testnet-integrated. Do not claim WalletConnect/mobile or hardware validation from this work.

### 6.8 Docs, tests, and hardening

Update roadmap/current-state docs, architecture notes, wallet demo strategy, provider notes, `CHANGELOG.md`, and decisions if authority boundaries changed. Add web validation commands once scripts exist.

### 6.9 Closeout audit

Audit target: Phase 6 proves the frontend authority dashboard and wallet validator, not the full setup wizard and not the full Guardian Agent demo.

## Success criteria

- A human can connect a wallet or see a clear unconnected state.
- A human can inspect the canonical ClearIntent payload before wallet approval.
- Phase 5C has a browser-based validation path for real software-wallet evidence.
- ENS/0G/KeeperHub/signer evidence is displayed from provider/configured state or shown as missing/degraded.
- KeeperHub events cannot masquerade as authority truth without authenticity checks.
- The dashboard remains an interface over authority truth, not the authority source.

## Downstream routing

- Phase 7 owns the UX/setup wizard flow.
- A later Guardian Agent demo phase owns planner, critic, executor, and end-to-end user-prompt-to-receipt execution.
- Stretch standards and monetization move after the wizard/demo path.
