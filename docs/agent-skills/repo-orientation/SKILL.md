# Repo Orientation

Use this scaffold skill when a local agent needs to understand ClearIntent before making changes.

## Objective

Build a repo-grounded orientation from the current checkout. Do not infer product or architecture details from memory alone.

## Inputs

- `AGENTS.md`
- `REPO_PROFILE.json`
- `README.md`
- `contracts/README.md`
- `contracts/authority-lifecycle.md`
- `ARCHITECTURE.md`
- `REPO_BOUNDARIES.md`
- `ROADMAP.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`

## Workflow

1. Read the files in `REPO_PROFILE.json` `readFirstFiles`.
2. Identify canonical paths, planned paths, and out-of-scope areas.
3. Run `npm run validate:scaffold` if the task touches onboarding, governance, templates, docs routing, or quality gates.
4. Report implemented, documented-only, planned, and forbidden early-scope areas separately.

## Output

Return a concise orientation with:

- current repo state
- canonical authority layer
- next implementation layer
- commands to run
- stop conditions
- files likely relevant to the requested task
