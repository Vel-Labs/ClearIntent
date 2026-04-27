---
name: pre-commit-quality-gate
description: Use before committing, pushing, handoff, or merge-readiness checks after ClearIntent code, contract, docs, scaffold, or workflow changes.
---

# Pre-Commit Quality Gate

The pre-commit quality gate is a regression shield before commit, push, branch handoff, or merge.

## Read First

- `REPO_PROFILE.json`
- `AGENTS.md`
- `docs/agents/START_HERE.md`
- `skills/pre-commit-quality-gate/templates/quality-gate-report.md`

## Workflow

1. Inspect scope:
   - `git status --short`
   - `git diff --stat`
   - `git diff --check`
2. Identify risk areas:
   - contracts or schemas
   - `packages/core`
   - adapters or providers
   - scaffold validation
   - docs routing
   - package scripts or CI
   - governance-locked paths
3. Run commands from `REPO_PROFILE.json`, usually:
   - `npm run validate:scaffold`
   - `npm run validate:contracts`
   - `npm run test:contracts`
   - `npm test`
   - `npm run typecheck`
   - `npm run check`
4. Check for stale `docs/FILE_TREE.md`, stale `REPO_PROFILE.json`, unregistered placeholders, missing changelog entries, and missing decision logs.
5. Confirm no unrelated files, secrets, runtime state, generated logs, auth material, or `node_modules` are staged.
6. Report readiness as `ready`, `ready with caveat`, or `not ready`.

## Output

Use the local report template when the task is explicitly about commit/push readiness. Always include exact commands and results.
