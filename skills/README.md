# Skills

This folder contains ClearIntent repo-local skills in a Claude-style skill layout.

```text
skills/
  skill-name/
    SKILL.md
    templates/
```

These skills are scaffold assets. They are not globally installed automatically. To activate one in an agent runtime, copy or symlink the desired skill folder into that runtime's configured skills directory.

## Directory

| Skill | Purpose | Templates |
| --- | --- | --- |
| `repo-orientation` | Build a checkout-grounded map for a new human or agent before first action. | None |
| `repo-doc-router` | Keep docs, templates, skills, roadmap, decisions, and repo taxonomy discoverable after moves or additions. | None |
| `roadmap-phase-planner` | Convert roadmap features or phases into executable implementation plans. | `templates/phase-plan.md` |
| `agent-assignment-writer` | Create bounded human or agent assignments with ownership, validation, docs updates, and stop conditions. | `templates/agent-assignment.md`, `templates/fresh-agent-handoff.md` |
| `feature-implementation-runner` | Execute approved feature or phase plans while preserving scope and validation discipline. | None |
| `contract-steward` | Preserve `contracts/` as canonical authority truth while updating schemas, fixtures, lifecycle rules, and validation. | None |
| `contract-fixture-author` | Add or update contract schemas, valid fixtures, invalid fixtures, and contract validation tests. | None |
| `core-enforcement` | Implement planned `packages/core/` enforcement logic against canonical contracts without drifting into adapters or demos. | None |
| `center-cli-operator` | Operate, extend, test, or document the Center CLI human lane and AI-readable command lane. | None |
| `adapter-scaffold` | Isolate provider behavior behind typed adapter boundaries for ENS, 0G, KeeperHub, signer, OpenCleaw, or x402 work. | None |
| `phase-closeout-audit` | Close phases or scaffold passes with scope, evidence, findings, follow-up, and decision/changelog routing. | `templates/closeout-audit.md` |
| `pre-commit-quality-gate` | Check commit, push, handoff, or merge readiness and proactively catch regressions. | `templates/quality-gate-report.md` |
| `hackathon-submission-auditor` | Check prize/vendor eligibility, demo claims, feedback files, and disclosure readiness. | None |
| `credential-safety` | Check credential, `.env`, wallet, live-provider, and operator setup safety before testnet or wallet work. | None |
| `local-operator-setup` | Guide local SDK setup, external secrets creation, 0G live binding, and dashboard resume from public artifact bundles. | None |
| `zerog-credential-safety` | Preserve 0G live-write custody boundaries across local SDK, hosted publishing, and Vercel deployment modes. | None |
| `agent-sdk-handoff` | Prepare copy-paste SDK commands and AI-agent prompts without exposing parent wallet or operator secrets. | None |
| `frontend-wizard-operator-mode` | Design hosted wizard lanes for browser wallet signing, local SDK artifact publishing, and hosted backend publishing. | None |
| `clearintent-agent-operator` | Instruct an AI agent to inspect custody, policy, audit, and KeeperHub context before proposing or submitting onchain actions. | None |
| `clearintent-intent-author` | Draft canonical ClearIntent intent payloads for wallet review, webhook alerts, and audit artifacts. | None |
| `clearintent-executor-gate` | Route approved intents through KeeperHub or another adapter without allowing policy bypass. | None |
| `clearintent-escalation-review` | Handle blocked, mismatched, or degraded intents without treating notifications as approvals. | None |
| `clearintent-transaction-runner` | Gate any signing, submission, execution, simulation, or demo transaction path behind canonical ClearIntent intent creation, evaluation, and evidence preservation. | None |
| `clearintent-wallet-discovery` | Discover parent-wallet-linked agent accounts, ENS identities, 0G refs, and KeeperHub routes without treating browser cache as authority. | None |
| `clearintent-provider-evidence-refresh` | Refresh ENS, 0G, KeeperHub, signer, wallet, and payload evidence before showing configured, ready, verified, or complete status. | None |
| `clearintent-demo-intent-runner` | Run render-only, simulation-only, wallet-request-only, or safe demo intent flows without overstating execution proof. | None |
| `clearintent-policy-change-review` | Review policy, destination, chain, value, escalation, session-authority, or executor-binding changes before they expand or alter agent authority. | None |
| `clearintent-operator-export-handoff` | Export SDK, CLI, dashboard, or agent handoff context with public references only and no secrets. | None |
| `clearintent-emergency-freeze` | Stop execution and preserve evidence when policy, intent, wallet, webhook, executor, or transaction evidence is suspicious or mismatched. | None |
| `clearintent-post-transaction-audit` | Reconcile intent, policy, signature, KeeperHub, transaction, receipt, notification, and 0G audit evidence after any attempted transaction. | None |

## Suggested Workflow

```text
repo-orientation
-> roadmap-phase-planner
-> agent-assignment-writer
-> feature-implementation-runner
-> contract-steward / contract-fixture-author / core-enforcement / adapter-scaffold / repo-doc-router
-> pre-commit-quality-gate
-> phase-closeout-audit
-> hackathon-submission-auditor
```

## Maintenance Rule

Create or update a repo-local skill when a workflow is likely to recur, has fragile ordering, requires repeated validation evidence, or would otherwise be re-explained in prompts. Keep skills narrow and trigger-focused.

When adding or changing a skill:

1. Use `skills/<skill-name>/SKILL.md`.
2. Keep the frontmatter `description` focused on when to use the skill.
3. Put repeatable artifacts under `skills/<skill-name>/templates/`.
4. Update this directory table.
5. Update `REPO_PROFILE.json` placeholder allowlist if new template placeholders are introduced.
6. Run `npm run validate:scaffold`.
