# ClearIntent Web App

`apps/web` is the hosted-dashboard and setup/custody wizard surface for ClearIntent.

The app is a wallet-gated interface over ClearIntent evidence. It must not become the authority source, custody wallet secrets, or treat browser-local state as canonical policy truth.

## Hackathon usage

For the hackathon, the web app provides:

- Phase 6 authority dashboard foundation with Overview, provider evidence, intent history, human intervention, and settings surfaces
- canonical ClearIntent payload preview before wallet approval
- EIP-1193/MetaMask-first wallet request construction from the signer adapter shape
- Alchemy Account Kit readiness and parent-owned agent smart account setup/custody flow
- Phase 7 setup/custody wizard evidence for parent wallet, agent smart account, 0G policy URI/hash, ENS payload, and KeeperHub run
- `/api/events` public event ingest for simulation-only ClearIntent demo events
- optional Discord webhook forwarding for operator-configured demo notifications

## Provider usage

- ENS: setup and display of agent subnames and ClearIntent text-record payloads.
- 0G: hosted and local operator paths for policy/audit artifact publishing.
- KeeperHub: workflow/run evidence and reported event ingest.
- Alchemy Account Kit: parent-owned agent smart account setup on Sepolia.
- Discord: demo-only rendering of ClearIntent simulation outcomes to an operator-provided webhook.

## Claim boundary

The web app currently proves dashboard/wizard evidence and demo notification rendering. It does not prove real MetaMask signing, wallet-rendered typed-data display, trusted KeeperHub webhook source binding, session-key enforcement, or transaction-backed autonomous execution.

Discord/webhook events are notifications only. They are not approvals, signatures, execution receipts, or audit truth.

## Commands

```bash
npm run web:dev
npm run web:typecheck
npm run web:lint
npm run web:test
npm --workspace apps/web run build
```

## Read next

- `docs/roadmaps/phase-6-authority-wallet-validator/IMPLEMENTATION_PLAN.md`
- `docs/roadmaps/phase-7-ux-wizard-flow/IMPLEMENTATION_PLAN.md`
- `docs/audits/phase-6-authority-wallet-validator/6.9-closeout-audit.md`
