# Agent Assignment Writer

Use this scaffold skill to prepare a bounded assignment for another human or coding agent.

## Objective

Create a handoff that names ownership, files, validation, dependencies, and stop conditions before work starts.

## Required reading

- `REPO_PROFILE.json`
- `docs/governance/multi-agent-workflow.md`
- `docs/governance/worktree-governance.md`
- `docs/templates/AGENT_ASSIGNMENT_TEMPLATE.md`
- `docs/templates/FRESH_AGENT_HANDOFF_TEMPLATE.md`

## Workflow

1. State the workstream and goal.
2. Declare allowed files and files not to touch.
3. Name dependencies and any blocked upstream decisions.
4. Require validation commands from `REPO_PROFILE.json`.
5. Include stop conditions and closeout requirements.

## Output

Return a ready-to-paste assignment. Keep scopes disjoint when multiple agents are involved.
