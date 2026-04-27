---
name: feature-implementation-runner
description: Use when executing an approved ClearIntent phase plan or feature implementation after scope and validation are defined.
---

# Feature Implementation Runner

Feature implementation turns an approved plan into scoped code or documentation changes while preserving ClearIntent authority boundaries.

## Read First

- `AGENTS.md`
- `REPO_PROFILE.json`
- `docs/agents/START_HERE.md`
- approved phase plan or assignment
- relevant `docs/roadmaps/features/` file
- relevant skill for the work type, such as `contract-steward`, `core-enforcement`, `adapter-scaffold`, or `repo-doc-router`

## Workflow

1. Confirm the task has an approved scope, allowed files, and stop conditions.
2. Inspect `git status --short` before editing.
3. Add or update tests before behavior when practical.
4. Implement the smallest coherent slice.
5. Update docs, roadmap/current-state, decisions, changelog, and audit evidence when behavior or authority semantics change.
6. Run focused validation first, then the broadest safe gate.
7. Stop if implementation pressure would create adapters, demos, providers, UI, deployment, or stretch features outside the approved phase.

## Output

Return files changed, exact commands and results, skipped commands with reasons, assumptions, and remaining follow-up.
