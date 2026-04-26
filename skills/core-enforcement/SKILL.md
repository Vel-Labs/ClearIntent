---
name: core-enforcement
description: Use when implementing ClearIntent packages/core enforcement logic against canonical contracts before adapters, demos, providers, UI, or deployment work.
---

# Core Enforcement

Core enforcement is the executable layer that consumes canonical authority truth and makes it usable by future ClearIntent packages.

## Read First

- `REPO_PROFILE.json`
- `contracts/README.md`
- `contracts/authority-lifecycle.md`
- `docs/governance/stability-handoff.md`
- `docs/roadmaps/features/feature-01-core-authority-kernel.md`
- `tests/README.md`

## Workflow

1. Confirm the canonical contract already exists in `contracts/`.
2. Implement only reusable enforcement in `packages/core/`.
3. Keep modules small and extracted before they become broad orchestrators.
4. Return structured fail-closed results where practical.
5. Add focused tests under `tests/core/` when core behavior exists.
6. Update architecture, roadmap/current-state, decisions, changelog, and audit evidence when authority behavior changes.

## Boundaries

`packages/core/` must not own adapters, demos, provider integrations, deployment, UI, or canonical schema definitions. It consumes `contracts/`; it does not redefine authority semantics.

## Design Bias

Prefer small modules, explicit result types, deterministic file reads, and clear errors over clever abstractions. Core should be boring, inspectable, and easy for future packages to consume.

## Validation

Run the broadest safe gate:

```bash
npm run validate:contracts
npm run test:contracts
npm test
npm run typecheck
npm run check
```
