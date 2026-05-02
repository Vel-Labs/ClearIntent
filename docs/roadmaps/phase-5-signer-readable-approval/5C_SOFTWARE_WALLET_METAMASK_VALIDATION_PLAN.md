# Phase 5C Software Wallet Validation Implementation Plan

## Purpose

Validate the Phase 5A EIP-712 payload through a real injected/software wallet path, with MetaMask as the preferred first target.

Phase 5C may run as signer-only validation after 5A/5B, then must be repeated as end-to-end validation after Phase 2B, 3B, and 4B live-testnet evidence exists.

ClearIntent uses two 5C evidence stages:

- `software-wallet-tested signer-only`: MetaMask or another injected/software wallet signs the local ClearIntent EIP-712 fixture payload before live 2B/3B/4B context exists.
- `software-wallet-tested testnet-integrated`: MetaMask or another injected/software wallet signs the ClearIntent EIP-712 payload after it is bound to Phase 2B live 0G artifact evidence, Phase 3B live ENS/testnet identity binding, and Phase 4B live KeeperHub/onchain execution evidence.

## Why now

- MetaMask is the lowest-friction real wallet path for EIP-712 typed-data signing.
- Early signer-only validation can reveal payload, domain, chain ID, and wallet-display problems before the full provider live path is ready.
- Keeping 5C separate from 5A/5B prevents local fixture work from being mislabeled as real wallet support.
- Current intended sequence is 5A, then 5B, then 5C signer-only validation, then a return to 2B/3B/4B live-testnet provider validation.

Skipping 5C until final demo assembly risks discovering payload or wallet display problems too late.

## Goals

- Implement or document an injected/EIP-1193 software-wallet adapter behind the Phase 5A signer interface.
- Request an EIP-712 signature for the ClearIntent typed payload through MetaMask or compatible injected wallet.
- Capture signature output without committing secrets, private keys, local wallet state, screenshots with sensitive account data, or mutable logs.
- Report display status honestly: app preview, wallet typed preview if observed, blind/limited display if applicable.
- Add manual or automated validation instructions that an operator can rerun.
- Add midpoint and closeout audits for the signer-only validation path.

## Non-goals

- WalletConnect/mobile validation.
- Hardware or secure-device validation.
- Vendor-approved Clear Signing.
- End-to-end 0G/ENS/KeeperHub execution proof unless 2B/3B/4B have already closed.
- Browser dashboard, Guardian Agent, or hosted app implementation.
- Storing wallet credentials, private keys, seed phrases, or screenshots with sensitive account data.

## Current foundation entering this phase

- Phase 5A signer payload and local approval scaffold.
- Phase 5B metadata scaffold if already complete.
- `docs/providers/Wallets/software/metamask/README.md`
- `docs/providers/Wallets/generic/eip712.md`
- `docs/providers/Wallets/compatibility-levels.md`
- `docs/providers/Wallets/PHASE_5_SOURCE_REVIEW.md`

Operator context:

- Operator-reported MetaMask version entering planning: `13.27.0`.
- Primary target: Ethereum and Ethereum testnets.
- Phase 5C audit must record exact installed wallet version, browser, network, chain ID, and observed wallet display behavior at test time.

## Core intent

Phase 5C proves a real software wallet can sign ClearIntent typed payloads. It must distinguish signer-only validation from end-to-end provider execution validation.

## Canonical distinctions

- Signer-only validation vs end-to-end 2/3/4B execution validation.
- Wallet signature output vs onchain execution.
- App preview vs MetaMask-rendered typed-data preview.
- EIP-712 signable vs secure-device display.
- Test account evidence vs committed credentials.

## Expected outcome

After 5C signer-only validation, an operator can point to a tested MetaMask/injected-wallet EIP-712 signature path and know exactly what the wallet did and did not display. After repeating 5C post-2/3/4B, the same signer path can support the end-to-end demo chain of intent.

Signer-only success is useful and should be recorded, but it is not testnet-integrated proof. The audit language must say that the signed payload came from the local ClearIntent fixture until 2B/3B/4B live-testnet evidence is available.

## Human and agent surfaces

Potential direct human command:

- `npm run clearintent -- signer software-status`

Potential JSON command:

- `npm run --silent clearintent -- signer software-status --json`

Browser/manual path:

- If a browser harness is needed, keep it local-only and document exact operator steps.
- Do not add `apps/web/` or dashboard scope in 5C unless a later phase explicitly opens it.

Bare wizard:

- Add a signer software-wallet status route if it can honestly report readiness without opening a browser.
- Document manual MetaMask validation as operator-run evidence when automation is impractical.

## Milestone cadence

- `5C.1`: injected-provider adapter or manual validation harness plan
- `5C.2`: MetaMask/EIP-1193 request path behind signer interface
- `5C.3`: signer-only validation instructions and safe evidence capture
- `5C.4`: capability/display-status reporting
- `5C.5`: midpoint audit for no overclaiming and no secret capture
- `5C.6`: Center CLI/software-wallet status route or documented manual-only gap
- `5C.7`: repeatability hardening and docs
- `5C.8`: provider docs and roadmap updates
- `5C.9`: closeout audit

## Planned artifacts

- Extend: `packages/signer-adapter/`
- Extend: `tests/signer-adapter/`
- Optional: `tests/signer-adapter/software-wallet.test.ts`
- Optional: `docs/providers/Wallets/software/metamask/VALIDATION_NOTES.md`
- Create: `docs/audits/phase-5-signer-readable-approval/5c.5-midpoint-audit.md`
- Create: `docs/audits/phase-5-signer-readable-approval/5c.9-closeout-audit.md`

## Recommended implementation shape

### Workstream 5C software adapter

Files:

- Create: `packages/signer-adapter/src/injected-wallet.ts`
- Create: `packages/signer-adapter/src/software-wallet-status.ts`
- Modify: `packages/signer-adapter/src/index.ts`
- Add tests for request-shape construction without requiring a real browser wallet in CI.

Expected outcome:

- The request payload and adapter boundary are deterministic and testable locally, while real MetaMask signature capture remains operator-run.

### Workstream 5C validation evidence

Files:

- Create or update: `docs/providers/Wallets/software/metamask/README.md`
- Optional create: `docs/providers/Wallets/software/metamask/VALIDATION_NOTES.md`
- Create audit files under `docs/audits/phase-5-signer-readable-approval/`

Expected outcome:

- The operator can record exact wallet version, network, account class, payload hash, signature result, display behavior, and limitations without committing sensitive data.

### Workstream 5C Center CLI

Files:

- Modify: `packages/center-cli/src/commands.ts`
- Modify: `packages/center-cli/src/signer-status.ts`
- Modify: `packages/center-cli/src/output.ts`
- Modify: `packages/center-cli/src/wizard.ts`
- Modify: `scripts/validate-center-cli.ts`
- Modify: `tests/center-cli/center-cli.test.ts`

Expected outcome:

- CLI can report software-wallet validation readiness and current claim level without pretending it can automate MetaMask in non-browser CI.

## Testnet and end-to-end posture

Signer-only 5C can run before 2B/3B/4B and can reach `software-wallet-tested signer-only` with real operator wallet evidence. End-to-end 5C should be repeated after:

- Phase 2B has live/testnet 0G upload/readback/hash evidence.
- Phase 3B has live/testnet ENS binding evidence if identity is included.
- Phase 4B has live/testnet KeeperHub/onchain execution evidence.

If testnet signer validation succeeds, prefer a livenet/mainnet follow-up only with separate audit language and no reused testnet claim.

After 2B/3B/4B are complete, repeat 5C against the updated payload and record `software-wallet-tested testnet-integrated` only if the wallet signs the payload that includes or binds to the live-testnet evidence.

Other EVM chains may be considered only if the same EIP-712 payload/domain model works with minimal translation. Ethereum/ENS testnet validation remains the priority for this pass.

## Touchpoints

- `docs/providers/Wallets/software/metamask/README.md`
- `docs/providers/Wallets/compatibility-levels.md`
- `docs/roadmaps/features/feature-05-hardware-signer-readable-approval.md`
- `ROADMAP.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `CHANGELOG.md`

## Validation

Run at minimum for implementation shape:

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

Real MetaMask validation must additionally record:

- wallet name and version
- network/chain ID
- account address redacted or test-only
- typed-data payload hash
- signature output redacted if needed
- display status observed
- exact limitations and claim level reached
