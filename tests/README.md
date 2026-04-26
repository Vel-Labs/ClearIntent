# Tests

This folder is the shared human and agent pre-commit quality gate for ClearIntent.

Install dependencies before running local checks:

```bash
npm install
```

Run all repo-local checks:

```bash
npm test
```

Run scaffold validation:

```bash
npm run validate:scaffold
```

Run only contract validation tests:

```bash
npm run test:contracts
```

Run the concise contract validation script used for audit evidence:

```bash
npm run validate:contracts
```

Run TypeScript checking for repo-local scripts and tests:

```bash
npm run typecheck
```

`contracts/` remains the source of truth. Tests consume schemas and fixtures from `contracts/schemas/` and `contracts/examples/`; they should not redefine contract shapes locally.

Before committing, run `npm run check` when practical. At minimum, run `npm run validate:scaffold`, `npm run validate:contracts`, `npm run test:contracts`, `npm test`, and `npm run typecheck`. Contract test failures mean either the contract artifact is inconsistent or the validation tooling has found an authority regression that needs an explicit contract, documentation, changelog, and audit update.
