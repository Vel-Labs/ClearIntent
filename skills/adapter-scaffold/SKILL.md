---
name: adapter-scaffold
description: Use when creating or reviewing ClearIntent provider adapters such as ENS, 0G, KeeperHub, signer hardware, OpenCleaw, or x402.
---

# Adapter Scaffold

Adapter scaffolding isolates vendor behavior while preserving the shared ClearIntent authority contract.

## Read First

- `REPO_PROFILE.json`
- `contracts/README.md`
- `contracts/authority-lifecycle.md`
- `docs/architecture/REPO_BOUNDARIES.md`
- `docs/governance/stability-handoff.md`
- relevant `docs/providers/` folder
- relevant roadmap feature file

## Workflow

1. Confirm adapter work is allowed by the current roadmap state.
2. Define the narrow adapter interface before implementation.
3. Consume contract/core types and results; do not redefine intent, policy, risk, receipt, or audit shapes locally.
4. Return typed success, failure, and degraded states.
5. Treat missing evidence as failure or degraded state, not success.
6. Keep vendor SDK quirks behind the adapter boundary.
7. Add focused tests or deterministic validation where practical.
8. Update provider docs, roadmap/current-state, decisions, changelog, and hackathon eligibility notes when claims change.

## Stop Conditions

Stop if the adapter would bypass policy verification, human review, signer visibility warnings, audit writes, or contract/core enforcement.
