# Contract/Core Stability Handoff

This pattern defines the point where ClearIntent becomes safe for feature implementation and parallel adapter work.

## Purpose

For authority-sensitive projects, do not let implementation packages, provider adapters, or demos become the first place where core truth appears. Stabilize the handoff in two layers first:

1. `contracts/`: canonical, reviewable truth.
2. `packages/core/`: executable enforcement of that truth.

Everything after that should consume or wrap those layers.

## Layer Responsibilities

| Layer | Responsibility | Must not do |
| --- | --- | --- |
| `contracts/` | Define lifecycle, schemas, examples, required evidence, fail-closed states, and audit expectations. | Import implementation code or provider assumptions. |
| `packages/core/` | Implement typed validators, lifecycle transitions, hashing, verification helpers, and a small reusable API. | Redefine contract shapes or add provider-specific semantics. |
| Adapters | Translate provider behavior into the core interfaces. | Own authority truth or bypass verification. |
| Demo/app | Compose the validated flow for users. | Hard-code authority-critical values that should come from contracts, core, or adapters. |

## Required Baseline Before Adapter Work

Before ENS, 0G, KeeperHub, signer, Ledger, or demo work starts:

- `contracts/README.md` explains the contract source of truth.
- Lifecycle documentation exists and names required gates.
- Schemas or typed contracts exist for shared data shapes.
- Valid and invalid examples exist.
- Repo-local validation reads from `contracts/`.
- `tests/` acts as the shared local quality gate.
- `packages/core/` consumes the contract artifacts and exposes the only reusable authority API.
- The roadmap names provider adapters and demo work as downstream consumers.
- `CHANGELOG.md`, `DECISIONS.md`, and the relevant `docs/decisions/` daily file describe the boundary.

## Quality Gate

The minimum ClearIntent gate is:

```bash
npm install
npm run validate:contracts
npm run test:contracts
npm test
npm run typecheck
```

Future projects should adapt the commands to their stack, but the rule is stable: one install command, one contract validation command, one focused contract/core test command, one all-tests command, and one static/type check command.

## Completion Signal

The stability handoff is complete when a new agent can answer these questions from repo files without guessing:

- What is canonical truth?
- What implements that truth?
- Which commands prove the baseline?
- What is allowed to start next?
- What remains explicitly deferred?

For ClearIntent, `contracts/` and `packages/core/` are the final stability handoff before provider adapters and demo integration proceed.
