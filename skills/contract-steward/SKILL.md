---
name: contract-steward
description: Use when changing ClearIntent contracts, schemas, lifecycle gates, examples, contract validation, or fail-closed authority rules.
---

# Contract Steward

Contract stewardship keeps canonical authority truth in `contracts/` and prevents drift into tests, docs, or implementation packages.

## Read First

- `REPO_PROFILE.json`
- `contracts/README.md`
- `contracts/authority-lifecycle.md`
- `docs/governance/stability-handoff.md`
- `docs/architecture/intent-lifecycle.md`
- `tests/README.md`
- `scripts/validate-contracts.ts`

## Workflow

1. Identify the canonical truth change and confirm it belongs in `contracts/`.
2. Update lifecycle docs, schemas, examples, and validation together when meaning changes.
3. Keep `HumanReviewCheckpoint` as an explicit gate; signing is not a substitute for review.
4. Add valid and invalid examples when behavior or shape changes.
5. Update tests under `tests/` as consumers of `contracts/`, not as duplicate truth.
6. Update `DECISIONS.md` and the relevant `docs/decisions/` daily file only for durable authority or architecture decisions.
7. Update `CHANGELOG.md` for concrete changes.

## Stop Conditions

Stop before changing governance doctrine, widening downstream implementation scope, or redefining canonical truth outside `contracts/`.

## Contract Law

When `contracts/`, implementation packages, and tests disagree, `contracts/` wins unless the contract layer is deliberately updated with docs, changelog, decision, and validation coverage.

## Validation

Run:

```bash
npm run validate:contracts
npm run test:contracts
npm test
npm run typecheck
```

Use `npm run check` when scaffold or docs routing changed too.
