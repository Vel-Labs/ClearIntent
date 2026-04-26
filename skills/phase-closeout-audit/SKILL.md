# Phase Closeout Audit

Use this scaffold skill when closing a roadmap phase or subphase.

## Objective

Verify that implementation, docs, contracts, tests, and roadmap routing agree before a phase is called complete.

## Required reading

- `ROADMAP.md`
- `docs/roadmaps/ROADMAP.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- relevant `docs/roadmaps/features/` file
- `docs/governance/phase-cadence.md`
- `docs/governance/AUDIT_PHILOSOPHY.md`
- `docs/templates/CLOSEOUT_AUDIT_TEMPLATE.md`

## Workflow

1. Identify phase id, promised deliverables, and stop point.
2. Compare changed files against the phase scope.
3. Verify docs, decisions, changelog, and audit artifacts are current.
4. Run the broadest safe validation gate.
5. Record blockers, degraded states, deferred work, and follow-up routing.

## Output

Create or update an audit under `docs/audits/` using `docs/templates/CLOSEOUT_AUDIT_TEMPLATE.md`.
