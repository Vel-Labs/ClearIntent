# Agent Start Guide

ClearIntent is a reusable authority layer for autonomous onchain agents. The repo is currently contract-first: `contracts/` is the canonical authority contract, `tests/` and `scripts/` validate that contract, and `packages/core/` is the next planned implementation layer.

## Read-first order

1. `AGENTS.md`
2. `REPO_PROFILE.json`
3. `README.md`
4. `contracts/README.md`
5. `contracts/authority-lifecycle.md`
6. `ARCHITECTURE.md`
7. `REPO_BOUNDARIES.md`
8. `ROADMAP.md`
9. `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
10. `docs/governance/multi-agent-workflow.md`
11. `docs/governance/worktree-governance.md`
12. `docs/governance/code-quality-standards.md`
13. `docs/governance/stability-handoff.md`

## Default commands

```bash
npm install
npm run validate:scaffold
npm run validate:contracts
npm run test:contracts
npm test
npm run typecheck
npm run check
```

`npm run check` is the broad local quality gate. It runs scaffold validation, contract validation, contract-focused tests, all tests, and TypeScript checking.

## Governance-locked areas

Treat these paths as repo law, not casual scratch space:

- `AGENTS.md`
- `REPO_PROFILE.json`
- `contracts/`
- `docs/repo-truth/`
- `docs/governance/`
- `docs/roadmaps/`
- `docs/templates/`
- `docs/agent-skills/`
- `ARCHITECTURE.md`
- `REPO_BOUNDARIES.md`
- `ROADMAP.md`
- `DECISIONS.md`
- `CHANGELOG.md`

Edits here require clear scope, deterministic validation, and matching docs/audit updates when behavior or authority semantics change.

## Allowed first actions

- Confirm the checkout state with `git status --short`.
- Read `REPO_PROFILE.json` and the read-first files.
- Run `npm run validate:scaffold` before changing scaffold docs.
- Run `npm run validate:contracts` before touching `contracts/`.
- Add focused tests before implementation when changing executable behavior.
- Update `CHANGELOG.md` for concrete repo changes.

## Stop conditions

Stop and ask for direction if:

- a requested change weakens policy, nonce, deadline, executor, ENS identity, policy hash, or audit requirements
- adapter, demo, UI, deployment, or stretch-standard work is requested before the contract/core handoff is stable
- `contracts/` and implementation expectations conflict
- a governance-locked file needs a decision that is not already recorded in `DECISIONS.md`
- a validation command fails for a reason unrelated to the current change

## Closeout requirements

Before calling work complete:

- Run the broadest safe gate, preferably `npm run check`.
- Record commands run and results.
- Update docs indexes or routing files when adding docs.
- Update `CHANGELOG.md` for shipped changes.
- Add or update `DECISIONS.md` only for durable architectural decisions.
- Leave deferred work in roadmap/current-state docs instead of expanding scope silently.
