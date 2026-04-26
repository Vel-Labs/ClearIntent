# Contract Steward

Use this scaffold skill for changes that touch ClearIntent authority contracts, schemas, fixtures, validation, or tests.

## Objective

Preserve `contracts/` as the canonical authority contract. Implementation packages and adapters must consume or wrap these contracts, not redefine them.

## Required reading

- `contracts/README.md`
- `contracts/authority-lifecycle.md`
- `docs/governance/stability-handoff.md`
- `docs/architecture/intent-lifecycle.md`
- `tests/README.md`
- `scripts/validate-contracts.ts`

## Workflow

1. Confirm the requested change belongs in `contracts/`.
2. Update schema, fixture, lifecycle docs, and validation together when behavior changes.
3. Keep human review as an explicit gate. Signing is not a substitute for `HumanReviewCheckpoint`.
4. Add or update contract tests when contract behavior changes.
5. Update `DECISIONS.md` only for durable architecture decisions.
6. Update `CHANGELOG.md` for concrete changes.

## Validation

Run:

```bash
npm run validate:contracts
npm run test:contracts
npm test
npm run typecheck
```

Use `npm run check` when scaffold or docs routing changed too.
