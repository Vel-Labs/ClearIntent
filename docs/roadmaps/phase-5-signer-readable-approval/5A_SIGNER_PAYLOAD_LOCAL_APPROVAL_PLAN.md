# Phase 5A Signer Payload and Local Approval Scaffold Implementation Plan

## Purpose

Build the local signer payload foundation for ClearIntent without requiring real wallet utilization. Phase 5A should make every future wallet path consume the same EIP-712 typed payload, signer adapter contract, human-readable approval preview, fixture signature evidence, display-warning vocabulary, and Center CLI status semantics.

## Why now

- Phase 1 contracts and `packages/core/` already define `AgentIntent`, `HumanReviewCheckpoint`, signature evidence, and fail-closed verification behavior.
- Phase 1.5 Center CLI already provides the human and JSON operator surface.
- Phase 2A, 3A, and 4A have local provider semantics for memory, identity, and execution.
- The remaining vertical live path is 2B/3B/4B, but signer payload semantics can be built locally now so wallet validation becomes horizontal surface expansion rather than another architecture pass.

Skipping 5A would force MetaMask, WalletConnect, hardware, and metadata work to each invent their own signing payload and display wording.

## Goals

- Define a signer adapter interface usable by software wallets, WalletConnect wallets, smart accounts, and hardware-backed signers.
- Generate deterministic EIP-712 typed data from canonical `AgentIntent`.
- Render a ClearIntent human-readable approval preview covering action, policy, executor, signer, nonce, deadline, value bounds, identity, and audit refs.
- Add deterministic/mock signature fixture output compatible with `packages/core` signature evidence.
- Define wallet class, capability level, display status, and blind/limited-display warnings.
- Add conditional review prompt semantics for escalation triggers such as value threshold, high risk, new executor, degraded audit write, or policy change.
- Add Center CLI signer status if it remains thin and honest.
- Add focused tests and midpoint/closeout audits.

## Non-goals

- Real MetaMask, WalletConnect, mobile, or hardware wallet signing.
- Wallet-rendered preview claims.
- Secure-device display claims.
- Vendor-approved Clear Signing claims.
- Guardian Agent, dashboard, deploy, hosted app, or live provider integration.
- Changing canonical authority contracts unless a deliberate contract-steward pass is opened.

## Current foundation entering this phase

- `contracts/schemas/agent-intent.schema.json`
- `contracts/schemas/human-review-checkpoint.schema.json`
- `contracts/authority-lifecycle.md`
- `contracts/examples/valid-agent-intent.json`
- `packages/core/src/types.ts`
- `packages/core/src/verification.ts`
- `packages/core/API.md`
- `packages/center-cli/`
- `docs/providers/Wallets/README.md`
- `docs/providers/Wallets/compatibility-levels.md`
- `docs/providers/Wallets/generic/eip712.md`
- `docs/providers/Wallets/generic/signer-adapter-contract.md`

## Core intent

Phase 5A makes ClearIntent capable of producing one bounded signing payload and readable approval surface that every future wallet path can reuse. It must not pretend a local fixture signature proves real wallet behavior.

## Canonical distinctions

- ClearIntent app preview vs wallet-rendered preview.
- EIP-712 typed payload vs wallet signature result.
- Signature evidence vs human review checkpoint.
- Local fixture signature vs real wallet utilization.
- Display status warning vs signing failure.
- Capability level claim vs vendor/product promise.

## Expected outcome

After 5A, a developer or agent can inspect a local signer package, generate EIP-712 typed data from a fixture `AgentIntent`, render the ClearIntent approval preview, produce deterministic fixture signature evidence, and see exactly which signer display claims remain unproven.

## Human and agent surfaces

Recommended direct human commands:

- `npm run clearintent -- signer status`
- `npm run clearintent -- signer preview`
- `npm run clearintent -- signer typed-data`

Recommended JSON commands:

- `npm run --silent clearintent -- signer status --json`
- `npm run --silent clearintent -- signer preview --json`
- `npm run --silent clearintent -- signer typed-data --json`

Bare wizard:

- Add a Signer status or Signer preview route to `npm run clearintent`.
- Do not call the CLI surface complete if direct/JSON/wizard coverage is absent.

Posture:

- `commandOk: true` for read-only local signer inspection.
- `authorityOk: false` unless a command is explicitly reporting non-authority status and docs justify it.
- `liveProvider: false`.
- Claim level limited to `signer-local-fixture` / `eip712-local-fixture`.

## Milestone cadence

- `5A.1`: signer package scaffold, public API, claim-level constants, capability/display types
- `5A.2`: EIP-712 domain/message mapping from `AgentIntent`
- `5A.3`: ClearIntent human-readable approval preview renderer
- `5A.4`: deterministic fixture signature evidence and display-warning model
- `5A.5`: midpoint audit for payload/review/signature boundaries
- `5A.6`: conditional review prompt semantics
- `5A.7`: Center CLI signer status/preview/typed-data route or documented deferred gap
- `5A.8`: docs, tests, and hardening
- `5A.9`: closeout audit

## Planned artifacts

- `packages/signer-adapter/`
- `tests/signer-adapter/`
- `docs/audits/phase-5-signer-readable-approval/5a.5-midpoint-audit.md`
- `docs/audits/phase-5-signer-readable-approval/5a.9-closeout-audit.md`
- Center CLI updates if included
- roadmap/current-state/profile/file-tree/changelog updates after closeout

## Recommended implementation shape

### Workstream 5A adapter package

Files:

- Create: `packages/signer-adapter/src/types.ts`
- Create: `packages/signer-adapter/src/eip712.ts`
- Create: `packages/signer-adapter/src/preview.ts`
- Create: `packages/signer-adapter/src/fixture-signer.ts`
- Create: `packages/signer-adapter/src/display-status.ts`
- Create: `packages/signer-adapter/src/review-prompts.ts`
- Create: `packages/signer-adapter/src/index.ts`
- Create: `tests/signer-adapter/signer-adapter.test.ts`

Expected outcome:

- Local EIP-712 payload, readable preview, fixture signature evidence, display warning, and conditional-review prompt behavior are deterministic and tested.

### Workstream 5A Center CLI

Files:

- Modify: `packages/center-cli/src/commands.ts`
- Create or modify: `packages/center-cli/src/signer-status.ts`
- Modify: `packages/center-cli/src/modules.ts`
- Modify: `packages/center-cli/src/output.ts`
- Modify: `packages/center-cli/src/wizard.ts`
- Modify: `scripts/validate-center-cli.ts`
- Modify: `tests/center-cli/center-cli.test.ts`

Expected outcome:

- Human and JSON signer status/preview readouts are available without real-wallet or authority claims.

### Workstream 5A audits

Audit artifact:

- Create: `docs/audits/phase-5-signer-readable-approval/5a.5-midpoint-audit.md`
- Create: `docs/audits/phase-5-signer-readable-approval/5a.9-closeout-audit.md`

Audit target:

- 5A midpoint must prove the local payload/preview/signature fixture cannot be confused with real wallet utilization.
- 5A closeout must prove EIP-712 payload generation, preview rendering, fixture signature evidence, display warnings, CLI status if added, and no real-wallet claims.

## Touchpoints

- `ROADMAP.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `docs/roadmaps/ROADMAP.md`
- `docs/roadmaps/features/feature-05-hardware-signer-readable-approval.md`
- `REPO_PROFILE.json`
- `docs/FILE_TREE.md`
- `CHANGELOG.md`
- `docs/providers/Wallets/README.md`
- `docs/providers/Wallets/compatibility-levels.md`
- `docs/providers/Wallets/generic/eip712.md`
- `docs/providers/Wallets/generic/signer-adapter-contract.md`

## Validation

Run at minimum:

```bash
npm run validate:scaffold
npm run validate:contracts
npm run validate:center-cli
npm test -- tests/signer-adapter
npm test -- tests/center-cli
npm test
npm run typecheck
npm run check
```

