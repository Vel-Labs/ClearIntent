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

Run the Center CLI shell contract validation:

```bash
npm run validate:center-cli
```

This check executes the actual npm AI lane and verifies that JSON starts at byte one, `commandOk` and `authorityOk` are separated, blocked fixture readouts exit `0`, CLI errors exit nonzero, and bare `npm run clearintent` exposes the human and AI lanes.

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

Before committing, run `npm run check` when practical. At minimum, run `npm run validate:scaffold`, `npm run validate:contracts`, `npm run validate:center-cli`, `npm run test:contracts`, `npm test`, and `npm run typecheck`. Contract test failures mean either the contract artifact is inconsistent or the validation tooling has found an authority regression that needs an explicit contract, documentation, changelog, and audit update.
