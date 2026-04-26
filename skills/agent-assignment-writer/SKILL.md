---
name: agent-assignment-writer
description: Use when preparing bounded human or agent workstream assignments, fresh-session handoffs, or parallel-agent prompts for ClearIntent.
---

# Agent Assignment Writer

Agent assignment writing turns a repo need into a bounded, auditable workstream another human or agent can execute without widening scope or colliding with other work.

## Read First

- `REPO_PROFILE.json`
- `docs/governance/multi-agent-workflow.md`
- `docs/governance/worktree-governance.md`
- `skills/agent-assignment-writer/templates/agent-assignment.md`
- `skills/agent-assignment-writer/templates/fresh-agent-handoff.md`

## Workflow

1. Identify the smallest workstream one agent can own.
2. State the branch or worktree if one is required.
3. List allowed files and forbidden files.
4. Name dependencies, upstream contracts, and blocked decisions.
5. Pull validation commands from `REPO_PROFILE.json`.
6. Include docs, decisions, changelog, and audit files to update.
7. Add stop conditions that prevent scope drift.
8. Require final closeout with exact commands and results.

## Quality Bar

Assignments should be narrow enough that multiple agents can work without touching the same files unless a human explicitly coordinates the overlap. If the assignment changes governance doctrine, architecture boundaries, or core contracts, call that out as governance-locked.

## Output

Use the templates in `templates/` as the starting point. Preserve allowed files, forbidden files, validation, docs updates, stop conditions, and closeout evidence.
