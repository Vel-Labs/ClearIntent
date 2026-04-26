# Tests

This folder is the shared human and agent pre-commit quality gate for ClearIntent.

Run all repo-local checks:

```bash
npm test
```

Run only contract validation tests:

```bash
npm run test:contracts
```

Run the concise contract validation script used for audit evidence:

```bash
npm run validate:contracts
```

`contracts/` remains the source of truth. Tests consume schemas and fixtures from `contracts/schemas/` and `contracts/examples/`; they should not redefine contract shapes locally.

Before committing, contract test failures mean either the contract artifact is inconsistent or the validation tooling has found an authority regression that needs an explicit contract, documentation, changelog, and audit update.
