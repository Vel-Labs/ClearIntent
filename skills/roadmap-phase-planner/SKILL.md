---
name: roadmap-phase-planner
description: Use when turning a ClearIntent roadmap feature or phase into an executable implementation plan with scope, dependencies, audits, and validation.
---

# Roadmap Phase Planner

Roadmap phase planning converts roadmap intent into a concrete, bounded work package before implementation starts.

## Read First

- `REPO_PROFILE.json`
- `ROADMAP.md`
- `docs/roadmaps/ROADMAP.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- relevant `docs/roadmaps/features/` file
- `docs/governance/phase-cadence.md`
- `docs/templates/PHASE_IMPLEMENTATION_TEMPLATE.md`
- `skills/roadmap-phase-planner/templates/phase-plan.md`

## Workflow

1. Identify the feature, phase id, current state, and stop point.
2. Separate implemented, documented-only, planned, and explicitly deferred work.
3. Name dependencies and upstream contract truth.
4. Define workstreams with likely file ownership.
5. For any Center CLI behavior, require direct human command, agent JSON command, and bare `npm run clearintent` wizard coverage, or explicitly document the wizard gap as deferred.
6. Include midpoint and closeout audit expectations.
7. Include validation commands from `REPO_PROFILE.json`.
8. Route downstream work into deferred scope instead of expanding the phase.

## Output

Use the local template when writing a new plan. Keep it executable enough that another agent can implement from it without reopening scope.
