# Phase 1.5 Center CLI Skeleton Implementation Plan

## Purpose

Create the CLI-first product center for ClearIntent over the completed contract/core authority kernel.

The Center CLI should make ClearIntent usable as a local human/agent coordination surface before provider adapters, demo integration, or hosted UI work begins.

## Why now

- Phase 1 closed the contract/core stability handoff.
- Future ENS, 0G, KeeperHub, signer, and demo work need a single operator-facing center instead of separate one-off scripts.
- A CLI skeleton gives both humans and AI agents a stable way to inspect authority state, missing evidence, next actions, and verification results.
- Skipping this phase would push product experience decisions into provider adapters, which would weaken the authority boundary and make later integration less coherent.

## Goals

- Add a CLI skeleton over `packages/core`.
- Define command grouping and output conventions before provider work begins.
- Provide human-readable terminal output for operators.
- Provide AI-readable JSON output for agents and automation.
- Ensure commands consume `packages/core` public primitives instead of re-deriving lifecycle or verification rules.
- Keep provider behavior mocked, local, or fixture-backed only.
- Add tests for command routing, output modes, and fail-closed behavior.
- Document the Center CLI structure and deferred notification/adapters scope.

## Non-goals

- Real ENS resolution.
- Real 0G storage.
- Real KeeperHub execution.
- Real Ledger or hardware signer integration.
- Webhook delivery.
- Local OS notifications.
- Browser UI or hosted service.
- Demo app integration.
- EIP-712 digest implementation or live signature verification.

## Current foundation entering this phase

- `contracts/` defines canonical authority truth.
- `packages/core/` exposes:
  - `createContractValidator`
  - `inspectLifecycle`
  - `advanceIntentLifecycle`
  - `deriveCoreStateSnapshot`
  - `evaluateCoreAuthority`
  - `verifyAuthority`
  - deterministic hashing helpers
- `packages/core/API.md` documents callable core API boundaries.
- Phase 1 closeout audit confirms local contract/core authority behavior.
- Existing fixture data under `contracts/examples/` can power skeleton commands.

## Core intent

This phase makes ClearIntent operable from a terminal without pretending live provider integrations exist.

The CLI should be the product center, but not the authority source. It renders and routes authority state from `packages/core`.

## Canonical distinctions

- Core API vs CLI transport: core owns authority behavior; CLI owns command UX and output formatting.
- Human-readable output vs AI-readable output: interactive terminal summaries and machine JSON must be separate modes over the same core result.
- Fixture-backed skeleton vs live provider integration: this phase may use local fixtures, but must not claim ENS, 0G, KeeperHub, Ledger, webhook, or OS notification completion.
- Notification readiness vs notification delivery: the CLI may expose notification-worthy state, but webhook and OS notification delivery remain later phases.
- Signing readiness vs clear signing: the CLI may show signer requirements and display warnings, but must not claim Ledger clear signing.

## Expected outcome

When Phase 1.5 is complete, a human or agent can run local commands that inspect fixture-backed ClearIntent authority state, see missing evidence and next action, validate contracts, and understand whether execution is blocked.

Expected command families:

- `clearintent center status`
- `clearintent center inspect`
- `clearintent intent validate`
- `clearintent intent state`
- `clearintent authority evaluate`
- `clearintent module list`
- `clearintent module doctor`

Exact names may adjust during implementation, but the command grouping should preserve the distinction between Center/operator commands, intent/state commands, authority evaluation, and module health.

## Human and AI Readability Layering

Human-readable mode:

- default terminal output
- concise labels
- next action summary
- missing evidence list
- blocked/degraded status
- no raw JSON unless requested

AI-readable mode:

- explicit `--json` or equivalent
- deterministic object shape
- no leading prose before JSON
- stable issue codes and next-action codes
- suitable for another agent to parse without text scraping

Rule: both modes must derive from the same `packages/core` result object.

## Milestone cadence

- `1.5.1` through `1.5.4`: CLI scaffold, command grouping, fixture-backed state/evaluation commands, output modes.
- `1.5.5`: midpoint audit.
- `1.5.6` through `1.5.8`: module registry/doctor skeleton, docs hardening, output contract tests.
- `1.5.9`: closeout audit.

## Planned artifacts

- implementation notes in this phase folder
- CLI source files under the selected app/package path
- tests for command behavior and output modes
- midpoint audit at `docs/audits/phase-1.5-center-cli-skeleton/1.5.5-midpoint-audit.md`
- closeout audit at `docs/audits/phase-1.5-center-cli-skeleton/1.5.9-closeout-audit.md`
- final routing updates in roadmap/current-state docs

## Recommended implementation shape

### Workstream `1.5.1`: CLI package scaffold

**Files:**

- Create: `apps/clearintent-cli/` or `packages/center-cli/`
- Modify: `package.json`
- Modify: `tsconfig.json` if needed

**Expected outcome:**

- `clearintent` command entrypoint exists through repo-local npm script.
- CLI imports from `packages/core/src`.
- No provider adapter directories are created.

### Workstream `1.5.2`: Output contract

**Files:**

- Create: CLI output formatter module.
- Create: tests for human and JSON output modes.
- Modify: `packages/core/API.md` only if a core-facing wrapper requirement is discovered.

**Expected outcome:**

- Human output is readable and concise.
- JSON output is deterministic and has no leading prose.

### Workstream `1.5.3`: Center status and inspect commands

**Files:**

- Create or modify CLI command modules.
- Use `deriveCoreStateSnapshot` and fixture inputs.

**Expected outcome:**

- Commands can display current lifecycle state, missing evidence, next action, blocked state, and degraded signals.

### Workstream `1.5.4`: Authority evaluation command

**Files:**

- Create or modify CLI command modules.
- Use `evaluateCoreAuthority`.

**Expected outcome:**

- Command can evaluate fixture-backed intent/policy/evidence and expose stable issue codes.

### Workstream `1.5.5`: Midpoint audit

**Audit artifact:**

- Create during implementation: `docs/audits/phase-1.5-center-cli-skeleton/1.5.5-midpoint-audit.md`

**Audit target:**

- CLI consumes core API rather than reimplementing authority behavior.
- Human and JSON output modes are both tested.
- Provider integrations remain deferred.

### Workstream `1.5.6`: Module list and doctor skeleton

**Files:**

- Add module metadata definitions local to CLI skeleton.
- Add `module list` and `module doctor` fixture/local checks.

**Expected outcome:**

- Future feature modules have a clear registration/health-check shape.
- The shape is documented but does not load real providers yet.

### Workstream `1.5.7`: Documentation and usage examples

**Files:**

- Create CLI README or Center CLI guide.
- Update roadmap/current-state docs.
- Update `CHANGELOG.md`.

**Expected outcome:**

- A human knows how to run the skeleton.
- An AI agent knows which commands are parseable.

### Workstream `1.5.8`: Final hardening

**Files:**

- Tests and docs as needed.

**Expected outcome:**

- `npm run check` passes.
- Command outputs are deterministic.
- Scope remains provider-free.

### Workstream `1.5.9`: Closeout audit

**Audit artifact:**

- Create during implementation: `docs/audits/phase-1.5-center-cli-skeleton/1.5.9-closeout-audit.md`

**Audit target:**

- Prove the CLI skeleton is usable locally.
- State exactly what is still fixture-only.
- State whether provider adapter work may begin.

## Touchpoints

- `ROADMAP.md`
- `docs/roadmaps/ROADMAP.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `docs/roadmaps/phase-1.5-center-cli-skeleton/`
- `docs/audits/phase-1.5-center-cli-skeleton/`
- `packages/core/API.md`
- `CHANGELOG.md`
- `DECISIONS.md` and `docs/decisions/` only if durable architecture decisions change
- `docs/FILE_TREE.md`

