# Phase 1A Contract Authority Baseline Audit

## Audit type

- closeout audit

## Status

- pass with follow-up

## Scope

Phase 1A established the top-level `contracts/` folder as the canonical ClearIntent authority contract layer before implementation packages or provider adapters begin.

## Fresh evidence

- `contracts/README.md`
- `contracts/authority-lifecycle.md`
- `contracts/schemas/agent-intent.schema.json`
- `contracts/schemas/agent-policy.schema.json`
- `contracts/schemas/risk-report.schema.json`
- `contracts/schemas/human-review-checkpoint.schema.json`
- `contracts/schemas/execution-receipt.schema.json`
- `contracts/schemas/audit-bundle.schema.json`
- valid fixtures under `contracts/examples/`
- invalid fixtures for missing policy, expired deadline, and policy hash mismatch
- directive updates in `AGENTS.md`, `README.md`, `REPO_BOUNDARIES.md`, `ARCHITECTURE.md`, and roadmap docs

## Audit actions executed

- Inspected repo governance and roadmap docs before edits.
- Added top-level contract docs, schemas, and fixtures.
- Updated agent-facing directive docs to require reading `contracts/` before shaping authority behavior.
- Ran deterministic JSON parsing and schema-subset validation for valid fixtures.
- Ran semantic checks for invalid fixtures and contract hash bindings.
- Ran local Markdown link validation.
- Ran ASCII scan over new and changed contract/directive files.

## Inputs reviewed

- `AGENTS.md`
- `README.md`
- `REPO_BOUNDARIES.md`
- `ARCHITECTURE.md`
- `ROADMAP.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `docs/roadmaps/features/feature-01-core-authority-kernel.md`
- `docs/architecture/intent-lifecycle.md`
- `docs/governance/code-quality-standards.md`
- `contracts/`

## Findings

- Low: The validation pass used a local schema-subset validator because the Python `jsonschema` package is not installed in this environment. Phase 1B should add repo-local validation tooling so contract checks are not embedded in ad hoc shell scripts.
- Low: `invalid-expired-deadline.json` and `invalid-policy-hash.json` are semantically invalid but still schema-valid. Phase 1B core validators must enforce deadline freshness and policy hash matching.

## Verification evidence

Commands run:

```bash
python3 - <<'PY'
# parsed all contract JSON files, validated valid fixtures against schemas,
# confirmed invalid-missing-policy is schema-rejected, confirmed expired
# deadline and policy-hash mismatch are semantically flagged, and confirmed
# human review and audit bundle hash bindings.
PY
```

Result:

```text
PASS schema valid-agent-intent.json -> agent-intent.schema.json
PASS schema valid-agent-policy.json -> agent-policy.schema.json
PASS schema valid-risk-report.json -> risk-report.schema.json
PASS schema valid-human-review-checkpoint.json -> human-review-checkpoint.schema.json
PASS schema valid-execution-receipt.json -> execution-receipt.schema.json
PASS schema valid-audit-bundle.json -> audit-bundle.schema.json
PASS invalid-missing-policy rejected: $: missing required policy
PASS invalid-expired-deadline flagged semantically
PASS invalid-policy-hash flagged semantically
PASS human review binds exact intent hash
PASS audit bundle binds intent and policy hashes
contract checks ok
```

```bash
python3 - <<'PY'
# checked local Markdown links across repo docs
PY
```

Result:

```text
local markdown links ok
```

```bash
LC_ALL=C rg -n "[^\\x00-\\x7F]" contracts AGENTS.md README.md REPO_BOUNDARIES.md ARCHITECTURE.md ROADMAP.md docs/README.md docs/architecture/intent-lifecycle.md docs/governance/code-quality-standards.md docs/roadmaps/CURRENT_STATE_AND_NEXT.md docs/roadmaps/features/feature-01-core-authority-kernel.md DECISIONS.md CHANGELOG.md
```

Result: no non-ASCII matches.

## Git disposition

- local only

## Decision

- pass with follow-up

## Next action

Start Phase 1B: implement `packages/core/` from `contracts/`, including repo-local schema validation tooling and semantic validators for deadline, nonce, signer, executor, human review, and policy hash checks.
