---
name: phase-closeout-audit
description: Use when closing a ClearIntent roadmap phase, scaffold pass, or governance task with verification evidence and follow-up routing.
---

# Phase Closeout Audit

Phase closeout is the evidence pass that turns completed work into inspectable project truth.

## Read First

- `skills/phase-closeout-audit/templates/closeout-audit.md`
- `ROADMAP.md`
- `docs/roadmaps/ROADMAP.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- relevant `docs/roadmaps/features/` file
- `DECISIONS.md`
- `docs/decisions/`
- `CHANGELOG.md`
- `docs/governance/phase-cadence.md`
- `docs/governance/AUDIT_PHILOSOPHY.md`

## Workflow

1. Identify phase id, promised deliverables, and stop point.
2. Inspect changed files against scope.
3. Run the broadest responsible verification, usually `npm run check`.
4. Create or update the closeout audit note.
5. Update roadmap/current-state routing.
6. Update `DECISIONS.md` and a dated decision file when authority or architecture changed.
7. Update `CHANGELOG.md`.
8. State follow-up clearly and keep downstream work deferred unless explicitly authorized.

## Required Evidence

Record exact commands and exact results. Do not mark work done from intent alone.

## Output

Use the template in `templates/`. Keep the audit factual; findings should tie to files, commands, or explicit missing evidence.
