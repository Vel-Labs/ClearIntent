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
