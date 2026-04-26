---
name: repo-orientation
description: Use when orienting a new human or agent to ClearIntent, auditing implemented vs planned surfaces, or preparing a first safe action.
---

# Repo Orientation

Repo orientation builds a checkout-grounded map before changing files. It should separate implemented truth, documented-only plans, and forbidden early scope.

## Read First

- `AGENTS.md`
- `REPO_PROFILE.json`
- `README.md`
- `docs/agents/START_HERE.md`
- `contracts/README.md`
- `contracts/authority-lifecycle.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/REPO_BOUNDARIES.md`
- `ROADMAP.md`
- `docs/roadmaps/ROADMAP.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `DECISIONS.md`

## Workflow

1. Read `REPO_PROFILE.json` and its `readFirstFiles`.
2. Confirm the checkout state with `git status --short`.
3. Identify canonical paths, planned paths, and out-of-scope areas.
4. Run `npm run validate:scaffold` if the task touches onboarding, governance, templates, docs routing, or quality gates.
5. Report implemented, documented-only, planned, and forbidden early-scope areas separately.

## Output

Return a concise orientation with:

- current repo state
- canonical authority layer
- next implementation layer
- commands to run
- stop conditions
- files likely relevant to the requested task
