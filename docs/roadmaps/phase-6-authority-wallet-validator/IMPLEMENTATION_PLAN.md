# Phase 6 Authority Dashboard and Wallet Validator Implementation Plan

## Purpose

Build the first ClearIntent frontend as a wallet-gated authority dashboard and wallet-validation harness.

This phase is not the full setup wizard and not the full Guardian Agent planner/critic/executor demo. It exists because Phases 5C/5D/5E need a real human wallet-facing surface to validate the approval experience derived from Phases 1 through 5B.

The dashboard should make the authority chain visible before an agent acts:

```text
parent wallet
-> connected wallet session
-> ClearIntent canonical payload
-> EIP-712 wallet approval request
-> ENS identity evidence
-> 0G policy/audit/card refs
-> KeeperHub execution evidence boundary
-> wallet/webhook/CLI review surfaces
```

The dashboard must render real connected-wallet and resolved provider state. It must not fill the authority chain with fake completion data.

## Why now

- Phases 1 through 5B are complete enough to expose the authority path to a human.
- Phase 5C software-wallet validation is only `ready-for-operator-test`; it needs a browser/wallet surface to capture real wallet-rendered evidence.
- 0G storage reached `0g-write-read-verified`.
- ENS binding reached `ens-live-bound` for `guardian.agent.clearintent.eth`.
- KeeperHub workflow execution reached `keeperhub-live-submitted` with corrected run `089to8oqegw0r48i63vbj` reporting terminal workflow status `executed` and no transaction hash.
- The hackathon demo needs a human-facing authority surface before the full setup wizard and Guardian Agent flow can be honest.

## Goals

- Create `apps/web/` as an intentional repo scope change, with scaffold/governance updates.
- Create a dark operational frontend shell using the selected dashboard direction.
- Make `Overview` the initial page with concise value explanation and real authority-state cards.
- Add a wallet-validation path for Phase 5C software-wallet testing.
- Render the canonical ClearIntent payload before wallet approval.
- Add evidence reflection for wallet session, ENS records, 0G refs, KeeperHub workflow/run evidence, signer status, and future event ingest.
- Add `POST /api/keeperhub/events` as a KeeperHub-specific event ingest stub with authenticity boundaries.
- Keep Alchemy Account Kit integration isolated so operator credentials/API keys remain out of repo and frontend semantics do not become authority truth.
- Preserve the hard product rule: every agent-originated flow renders the canonical ClearIntent payload and no frontend component invents separate authority meaning.

## Non-goals

- Do not implement the full setup wizard in Phase 6. Phase 7 owns the UX/setup wizard flow.
- Do not implement a private database as authority truth.
- Do not claim smart-account/session-key enforcement until Alchemy account creation and permissioning are implemented and tested.
- Do not claim Ledger Clear Signing, WalletConnect/mobile validation, or hardware-wallet support in this phase.
- Do not implement planner/critic/executor Guardian Agent roles.
- Do not implement x402, MCP server, marketplace, iNFT, zk, or monetization surfaces.
- Do not execute onchain transactions from the frontend in the first pass.
- Do not require or request seed phrases, parent private keys, or unrestricted hot-wallet keys.

## Current foundation entering this phase

- Contracts/core lifecycle and authority evaluation exist locally.
- Center CLI can render identity, 0G, KeeperHub, signer, and credential state.
- Phase 5A/5B signer payload and ERC-7730 metadata are complete locally.
- Phase 5C is prepared only to `ready-for-operator-test`; real wallet evidence is absent.
- ENS live records exist for `guardian.agent.clearintent.eth`.
- 0G policy/audit/card artifacts are bound through ENS text records.
- KeeperHub simplified gate workflow executes at workflow level but has no transaction hash or executor binding.
- Frontend app code does not exist yet.
- `clearintent.xyz` domain exists but the site/API is not deployed yet.
- Alchemy project/services have been selected by the operator; Account Kit implementation remains pending.

## Canonical distinctions

- `Authority dashboard` vs `Setup wizard`: Phase 6 validates display, evidence, and wallet approval. Phase 7 performs guided setup.
- `Connected` vs `Configured`: a wallet connection is not a completed ClearIntent setup.
- `Workflow executed` vs `Onchain transaction executed`: KeeperHub run `089to8oqegw0r48i63vbj` proves workflow execution only.
- `Reported event` vs `Trusted evidence`: KeeperHub webhook events are reported/non-authoritative unless authenticated and replay-checked.
- `Parent wallet` vs `Agent smart account`: parent wallet owns/administers; agent account operates inside policy where implemented.
- `Policy artifact` vs `Policy mode`: 0G stores the artifact; UI exposes mode and parameters.
- `Canonical ClearIntent payload` vs wallet-specific rendering: frontend, MetaMask, Ledger metadata, webhook, CLI, and 0G must derive from the same payload.

## Milestone cadence

### 6.1 Governance and workspace opening

**Files likely owned:**

- Modify: `REPO_PROFILE.json`
- Modify: `docs/FILE_TREE.md`
- Modify: `package.json`
- Modify: `tsconfig.json` or add app-local TypeScript config as needed
- Modify: `docs/roadmaps/README.md`
- Modify: `ROADMAP.md`
- Modify: `docs/roadmaps/ROADMAP.md`
- Modify: `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`

**Expected outcome:**

- `apps/web/` is no longer forbidden early scope once implementation begins.
- Package/workspace strategy is explicit before parallel workers create app files.
- Root scripts define the intended web commands when the app scaffold lands.

### 6.2 Frontend scaffold and visual system

**Files likely owned:**

- Create: `apps/web/`
- Create: `apps/web/package.json`
- Create: `apps/web/src/app/` or equivalent Next.js app structure
- Create: `apps/web/src/components/`
- Create: `apps/web/src/lib/`

**Expected outcome:**

- Local web app boots.
- Dark operational layout exists with sidebar, top status strip, Overview page, and empty-state components.
- No fake completed authority data appears by default.

### 6.3 State model and evidence surfaces

**Files likely owned:**

- Create: `apps/web/src/lib/clearintent-state.ts`
- Create: `apps/web/src/lib/evidence-model.ts`
- Create: `apps/web/src/components/evidence/`
- Create: `apps/web/src/components/overview/`

**Expected outcome:**

- App can represent `unconnected`, `connected-unconfigured`, `partially-configured`, `configured`, `degraded`, and `demo` states.
- Overview cards display real or explicitly missing values for parent wallet, agent account, ENS, 0G, KeeperHub, policy, audit, session authority, and escalation.
- The value explanation is concise and operational, not a marketing hero.

### 6.4 Wallet connection and software-wallet validator

**Files likely owned:**

- Create: `apps/web/src/lib/wallet/`
- Create: `apps/web/src/lib/alchemy/`
- Create: `apps/web/src/components/wallet/`
- Create: `apps/web/src/components/payload-preview/`
- Modify: `docs/providers/Wallets/software/metamask/README.md` if evidence requirements are narrowed
- Modify: `docs/providers/Wallets/smart-accounts/README.md` if the Account Kit boundary is narrowed

**Expected outcome:**

- Parent wallet connection exists or is stubbed behind a clear adapter boundary.
- Generic EIP-1193/MetaMask is the default Phase 5C validation path unless a later assignment selects Reown explicitly.
- The app can render the canonical ClearIntent payload and prepare/display the EIP-712 request shape for operator testing.
- If Account Kit credentials are not configured yet, the app reports `Alchemy not configured` rather than failing obscurely.

### 6.5 Midpoint audit

**Audit artifact:**

- Create: `docs/audits/phase-6-authority-wallet-validator/6.5-midpoint-audit.md`

**Audit target:**

- Overview does not show fake completion data.
- Dashboard does not request secrets.
- Frontend state model separates connected, configured, degraded, and demo states.
- Wallet validation does not claim 5C evidence until operator testing records it.
- Alchemy integration is isolated from ClearIntent authority semantics.
- The dashboard states the KeeperHub claim boundary correctly: workflow execution proof, no onchain transaction proof.

### 6.6 Provider reads and event ingest

**Files likely owned:**

- Create: `apps/web/src/app/api/keeperhub/events/route.ts`
- Create: `apps/web/src/lib/events/keeperhub-event.ts`
- Create: `apps/web/src/components/events/`
- Create: `apps/web/src/lib/providers/ens.ts`
- Create: `apps/web/src/lib/providers/zerog.ts`
- Create: `apps/web/src/lib/providers/keeperhub.ts`

**Expected outcome:**

- Frontend provider modules are thin wrappers over `packages/ens-identity`, `packages/zerog-memory`, and `packages/keeperhub-adapter` exports or documented read-only boundaries.
- `POST /api/keeperhub/events` validates the KeeperHub event payload shape and returns deterministic JSON.
- The ingest route has an explicit authenticity plan: token/signature validation, timestamp or nonce replay protection, and source binding before events can be treated as trusted evidence.
- Until authenticity is proven, UI labels latest events as reported/non-authoritative.
- No long-term private DB authority is introduced. If temporary in-memory or local display state is used, it is labeled non-authoritative.

### 6.7 Phase 5C validation pass

**Files likely owned:**

- Modify: `docs/roadmaps/phase-5-signer-readable-approval/5C_SOFTWARE_WALLET_METAMASK_VALIDATION_PLAN.md`
- Create or modify: Phase 5C audit artifact if operator evidence exists
- Modify: wallet provider notes as needed

**Expected outcome:**

- Phase 5C can be tested through a real wallet-facing dashboard path.
- Evidence is labeled `signer-only` or `testnet-integrated`.
- No WalletConnect/mobile or hardware-wallet claim is made from Phase 6.

### 6.8 Demo readiness and docs hardening

**Files likely owned:**

- Modify: `docs/hackathon/submission-checklist.md`
- Modify: `docs/hackathon/wallet-demo-strategy.md`
- Modify: `docs/providers/KeeperHub/README.md`
- Modify: `docs/architecture/ARCHITECTURE.md`
- Modify: `CHANGELOG.md`
- Modify: `DECISIONS.md` and `docs/decisions/2026-05-02.md` if authority or phase-boundary decisions change

**Expected outcome:**

- Local dev server runs once app scripts exist.
- Dashboard displays actual validated evidence or missing/degraded states:
  - configured ENS name such as `guardian.agent.clearintent.eth`
  - 0G refs
  - policy hash
  - KeeperHub workflow `r8hbrox9eorgvvlunk72b`
  - KeeperHub run `089to8oqegw0r48i63vbj`
  - no transaction hash
- Webhook can remain disabled until deploy, but route implementation exists.
- Phase 7 setup wizard scope is routed clearly.

### 6.9 Closeout audit

**Audit artifact:**

- Create: `docs/audits/phase-6-authority-wallet-validator/6.9-closeout-audit.md`

**Audit target:**

- App boots locally.
- Overview behaves correctly in unconnected and connected states.
- No dummy authority state is shown as real.
- `/api/keeperhub/events` validates KeeperHub events and labels unauthenticated events correctly.
- Wallet validation path can support Phase 5C evidence capture.
- Alchemy setup state is clear and does not overclaim session-key enforcement.
- Docs route the Phase 7 setup wizard and later Guardian Agent demo work.

## Parallel agent ownership

Use disjoint write scopes if multiple agents work in parallel:

- Worker A: `apps/web/src/components/overview/`, layout shell, visual system.
- Worker B: `apps/web/src/lib/clearintent-state.ts`, `apps/web/src/lib/evidence-model.ts`, state fixtures.
- Worker C: `apps/web/src/app/api/keeperhub/events/route.ts`, event schema, event display components.
- Worker D: `apps/web/src/lib/wallet/`, `apps/web/src/lib/alchemy/`, wallet/account-kit adapter boundary only.
- Worker E: docs/audit updates only after implementation evidence exists.

No two workers should edit the same component folder unless explicitly coordinated.

## Validation commands

Baseline repo gates:

```bash
npm run validate:scaffold
npm run validate:contracts
npm run validate:center-cli
npm test
npm run typecheck
```

Frontend gates to add once app scripts exist:

```bash
npm run web:dev
npm run web:typecheck
npm run web:lint
npm run web:test
```

Before declaring UI complete, use browser verification or Playwright screenshots for desktop and mobile widths. Text must not overlap, and the app must show clear unconnected/configured/degraded states.

## Environment placeholders

Do not commit secrets. Expected public/client-safe env names should be documented during implementation. Likely examples:

```env
NEXT_PUBLIC_CLEARINTENT_ENS_NAME=
NEXT_PUBLIC_ALCHEMY_CHAIN=
NEXT_PUBLIC_ALCHEMY_API_KEY=
NEXT_PUBLIC_ALCHEMY_WALLET_CONFIG_ID=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_KEEPERHUB_WORKFLOW_ID=
```

Server-only values, if needed, stay outside repo or in deployment secrets:

```env
KEEPERHUB_WEBHOOK_TOKEN=
```

The exact Alchemy env contract should be finalized by the separate Alchemy setup thread and then wired into `apps/web/src/lib/alchemy/`.

## Stop conditions

Stop and document a blocker if:

- Account Kit requires a different app architecture than the selected frontend stack.
- The app would need parent private keys, seed phrases, or unrestricted agent keys.
- The frontend would become the only place where policy truth lives.
- The dashboard cannot distinguish demo data from live provider data.
- The implementation would require onchain transaction claims not yet supported by Phase 4B evidence.
- Phase 5C validation would claim wallet-rendered evidence without operator-run proof.

## Deferred scope

- Phase 7 setup wizard and operator flow.
- Full smart-account/session-key enforcement.
- Ledger hardware-wallet validation.
- WalletConnect/mobile validation.
- Guardian Agent planner/critic/executor implementation.
- x402 payment flow.
- MCP server.
- Hosted API authority beyond the KeeperHub event ingest stub.
- Notification fanout to Discord/Telegram/email beyond validated event ingest.
- Marketplace or iNFT surfaces.
