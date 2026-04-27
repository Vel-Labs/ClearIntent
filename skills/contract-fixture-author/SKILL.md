---
name: contract-fixture-author
description: Use when adding or updating ClearIntent contract schemas, valid fixtures, invalid fixtures, and contract validation test coverage.
---

# Contract Fixture Author

Contract fixture authoring keeps examples and schemas aligned with canonical authority truth.

## Read First

- `contracts/README.md`
- `contracts/authority-lifecycle.md`
- `contracts/schemas/`
- `contracts/examples/`
- `scripts/validate-contracts.ts`
- `tests/contracts/validate-contracts.test.ts`
- `skills/contract-steward/SKILL.md`

## Workflow

1. Identify the schema or lifecycle rule being exercised.
2. Add or update the schema in `contracts/schemas/`.
3. Add at least one valid fixture when introducing a new shape.
4. Add invalid fixtures for fail-closed behavior where practical.
5. Update `scripts/validate-contracts.ts` mappings and semantic assertions when needed.
6. Update `tests/contracts/` to consume contract files from disk, not duplicate contract truth.
7. Update docs, decisions, changelog, and audits when contract meaning changes.

## Validation

Run:

```bash
npm run validate:contracts
npm run test:contracts
npm test
npm run typecheck
```

Use `npm run check` when scaffold routing or templates changed too.
