# ClearIntent Contracts

This folder is the canonical authority contract for ClearIntent.

`contracts/` is intentionally above `packages/`. Code implements these contracts; it does not define them by accident.

## Contract rule

These files are non-negotiable information contracts for the repo:

- provider adapters must consume these shapes
- `packages/core/` must enforce these shapes
- demo flows must display these checkpoints
- audits must cite these shapes when judging authority behavior

If implementation behavior conflicts with this folder, the implementation is wrong unless this folder is deliberately updated with docs, changelog, and decision coverage.

## Contents

```text
contracts/
  README.md                         this file
  authority-lifecycle.md            required lifecycle and human intervention gates
  schemas/                          machine-checkable contract schemas
  examples/                         valid and invalid contract fixtures
```

## Repo-local validation

Install the Node toolchain dependencies:

```bash
npm install
```

Run the concise contract validation script:

```bash
npm run validate:contracts
```

Run only contract validation tests:

```bash
npm run test:contracts
```

Run all repo-local tests:

```bash
npm test
```

Run TypeScript checking for validation scripts and tests:

```bash
npm run typecheck
```

The validation tooling reads schemas and fixtures from this folder. It must not redefine contract truth outside `contracts/`.

## Contract families

| Contract | Purpose |
| --- | --- |
| `AgentIntent` | The bounded action an agent proposes for authorization. |
| `AgentPolicy` | The user's authority policy for allowed actions, signers, executors, and limits. |
| `RiskReport` | The review output that explains whether a proposed intent is acceptable. |
| `HumanReviewCheckpoint` | The explicit human intervention gate before signing or execution. |
| `ExecutionReceipt` | The result of submitting an approved intent to an executor. |
| `AuditBundle` | The replayable evidence package linking identity, policy, risk, review, intent, signature, and receipt. |

## Claim level

Current status: `Tooled scaffold`.

These contracts establish repo truth for Phase 1A and are covered by repo-local Phase 1B validation tooling. They do not prove live ENS, 0G, KeeperHub, or Ledger integrations.

## Change discipline

Changes to this folder must update:

- `ARCHITECTURE.md` when lifecycle or plane boundaries change
- `docs/architecture/intent-lifecycle.md` when step order or human review gates change
- `docs/roadmaps/features/feature-01-core-authority-kernel.md` when Phase 1 scope changes
- `CHANGELOG.md`
- `DECISIONS.md` for durable architecture decisions

## Human intervention rule

ClearIntent requires an explicit `HumanReviewCheckpoint` before signing and before any executor submission. Signing is not a substitute for review. The checkpoint must bind the review decision to the exact intent hash the human inspected.
