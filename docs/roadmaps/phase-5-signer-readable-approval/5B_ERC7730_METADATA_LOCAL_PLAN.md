# Phase 5B ERC-7730 / Clear Signing Metadata Local Scaffold Implementation Plan

## Purpose

Generate local readable-signing metadata artifacts that can support future wallet/vendor display work without claiming wallet-rendered, secure-device, or vendor-approved Clear Signing behavior.

## Why now

- Phase 5A defines the signer payload, preview, and display vocabulary.
- ERC-7730-style metadata is functional metadata generation, not live network behavior.
- Building metadata locally before wallet testing prevents each wallet lane from inventing labels, field ordering, or display claims independently.

Skipping 5B would leave readable-signing metadata as a late demo polish task, increasing the risk of overstated claims during wallet testing.

## Goals

- Generate ERC-7730-compatible or ERC-7730-inspired metadata from the Phase 5A typed payload and preview field map where feasible.
- Define display labels for authority-critical fields.
- Validate metadata shape deterministically.
- Report claim level `erc7730-local-metadata`.
- Keep vendor approval and secure-screen claims explicitly absent.

## Non-goals

- Vendor approval.
- Secure-device display verification.
- Wallet-rendered preview verification.
- Real wallet signing.
- Live provider or onchain behavior.
- Changing the canonical intent contract solely to fit metadata display.

## Current foundation entering this phase

- Phase 5A signer payload and preview scaffold.
- `docs/providers/Wallets/generic/erc7730.md`
- `docs/providers/Wallets/compatibility-levels.md`
- `docs/providers/Wallets/generic/signer-adapter-contract.md`

## Core intent

Phase 5B makes ClearIntent ready to hand wallet vendors or adapter implementers a consistent readable-signing metadata artifact. It must not claim that any wallet has accepted, rendered, or securely displayed the metadata.

## Canonical distinctions

- Metadata generated vs metadata accepted by a wallet/vendor.
- ClearIntent-readable labels vs wallet-rendered fields.
- Local metadata fixture vs secure-device display evidence.
- ERC-7730-ready direction vs official Clear Signing approval.

## Expected outcome

After 5B, the repo can generate and validate local metadata for ClearIntent intent signing fields, and operators can inspect the metadata while seeing explicit `local metadata only` claim language.

## Human and agent surfaces

Recommended direct human command:

- `npm run clearintent -- signer metadata`

Recommended JSON command:

- `npm run --silent clearintent -- signer metadata --json`

Bare wizard:

- Add signer metadata route if Center CLI integration is in scope.
- Otherwise document the exact deferred CLI gap in the audits.

Posture:

- `commandOk: true` for local metadata generation.
- `authorityOk: false` unless docs explicitly classify metadata as non-authority inspection.
- `liveProvider: false`.
- Claim level limited to `erc7730-local-metadata`.

## Milestone cadence

- `5B.1`: metadata generator shape and claim-level constants
- `5B.2`: field-label mapping from Phase 5A payload/preview fields
- `5B.3`: deterministic local metadata fixture
- `5B.4`: validation tests
- `5B.5`: midpoint audit for no vendor/secure-display claim
- `5B.6`: Center CLI metadata route or documented deferred gap
- `5B.7`: wallet docs update
- `5B.8`: roadmap/profile/file-tree/changelog hardening
- `5B.9`: closeout audit

## Planned artifacts

- Extend: `packages/signer-adapter/`
- Extend: `tests/signer-adapter/`
- Create: `docs/audits/phase-5-signer-readable-approval/5b.5-midpoint-audit.md`
- Create: `docs/audits/phase-5-signer-readable-approval/5b.9-closeout-audit.md`
- Optional Center CLI metadata route updates

## Recommended implementation shape

### Workstream 5B metadata

Files:

- Create: `packages/signer-adapter/src/erc7730-metadata.ts`
- Create: `packages/signer-adapter/src/metadata-fixtures.ts`
- Modify: `packages/signer-adapter/src/index.ts`
- Modify: `tests/signer-adapter/signer-adapter.test.ts`

Expected outcome:

- Local metadata generation is deterministic and validated without implying wallet/vendor approval.

### Workstream 5B Center CLI

Files:

- Modify: `packages/center-cli/src/commands.ts`
- Modify: `packages/center-cli/src/signer-status.ts`
- Modify: `packages/center-cli/src/output.ts`
- Modify: `packages/center-cli/src/wizard.ts`
- Modify: `scripts/validate-center-cli.ts`
- Modify: `tests/center-cli/center-cli.test.ts`

Expected outcome:

- Operators can inspect local metadata in human and JSON lanes if CLI integration remains clean.

### Workstream 5B audits

Audit artifacts:

- `docs/audits/phase-5-signer-readable-approval/5b.5-midpoint-audit.md`
- `docs/audits/phase-5-signer-readable-approval/5b.9-closeout-audit.md`

Audit target:

- Prove metadata is local-only, deterministic, and honestly labeled.
- Prove no secure-device, wallet-rendered, or vendor-approved claim is made.

## Touchpoints

- `docs/providers/Wallets/generic/erc7730.md`
- `docs/providers/Wallets/compatibility-levels.md`
- `docs/roadmaps/features/feature-05-hardware-signer-readable-approval.md`
- `ROADMAP.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `REPO_PROFILE.json`
- `docs/FILE_TREE.md`
- `CHANGELOG.md`

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

