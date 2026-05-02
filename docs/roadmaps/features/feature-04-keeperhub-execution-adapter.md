# Feature 04: KeeperHub Execution Adapter

## Purpose

Use KeeperHub as the reliable execution layer for approved ClearIntent intents.

## Dependencies

- Feature 01 verified intent shape
- Feature 02 receipt/audit shape
- Phase 2B live 0G closeout before claiming live audit persistence
- Phase 3B live ENS closeout before claiming ENS-bound execution identity

## Goals

- create KeeperHub workflow from verified intent
- submit execution request
- monitor status
- capture receipt
- write feedback notes

## Non-goals

- unrestricted agent execution
- custody of user keys
- execution before signature verification

## Subphases

Phase 4 is intentionally split so local execution shape can move independently from live KeeperHub/onchain execution, which waits for credentials, funding, and selected runtime path:

- **Phase 4A: KeeperHub Execution Local Scaffold** is complete locally. It defines the adapter interface, local workflow mapping, mock submit/monitor behavior, typed receipt conversion, blocked/degraded states, fixtures, tests, Center CLI status, and honest `keeperhub-local-fixture` claim level.
- **Phase 4B: Live KeeperHub / Onchain Execution** uses config-driven KeeperHub API/CLI/MCP or direct-execution integration, monitors a live run, captures receipt evidence, and updates feedback docs.

Implementation plan: `../phase-4-keeperhub-execution-adapter/IMPLEMENTATION_PLAN.md`

## Phase 4A: KeeperHub Execution Local Scaffold

Status: complete locally. Midpoint audit: `../../audits/phase-4-keeperhub-execution-adapter/4a.5-midpoint-audit.md`. Closeout audit: `../../audits/phase-4-keeperhub-execution-adapter/4a.9-closeout-audit.md`.

### 4A.1 Adapter interface

Define `ExecutionAdapter`, claim-level constants, status/result types, and issue codes.

### 4A.2 Workflow mapping

Map verified intent fixtures to KeeperHub workflow/direct-execution request fixtures.

### 4A.3 Local submit/monitor

Implement local/mock submit and monitor behavior without live KeeperHub calls.

### 4A.4 Receipt integration

Return typed `ExecutionReceipt` fixture output compatible with `contracts/`.

### 4A.5 Midpoint audit

Audit target: adapter cannot submit unsigned, unverified, expired, executor-mismatched, or otherwise unverifiable intents.

### 4A.6 Degraded states

Report missing verification, missing signature, unsupported executor, missing workflow ID, failed run, missing transaction evidence, missing receipt, and unavailable live provider explicitly.

### 4A.7 Center CLI status or deferred gap

Add a thin execution/KeeperHub status route if it fits the Center CLI shape. If not, document the CLI gap in the audit.

### 4A.8 Docs and hardening

Document local fixture semantics, claim level, 4B prerequisites, custody boundaries, and receipt limitations.

### 4A.9 Closeout audit

Audit target: local workflow mapping, local submit/monitor simulation, typed receipt output, tests, claim boundaries, and remaining 4B gates.

## Phase 4B: Live KeeperHub / Onchain Execution

Status: open. Phase 4B is unblocked by the Phase 2B/3B storage and identity prerequisites, but it is not complete until KeeperHub live execution evidence is captured.

Current prerequisite evidence:

- Phase 2B live 0G smoke reached `0g-write-read-verified`.
- Phase 3B live ENS binding reached `ens-live-bound` for `guardian.agent.clearintent.eth`.
- ENS records now bind the ClearIntent policy, audit pointer, and agent card to live 0G artifacts.

Network posture:

- Run testnet KeeperHub/onchain execution first.
- Prefer a livenet/mainnet follow-up after testnet run monitoring, transaction evidence, and receipt conversion pass.
- Do not claim livenet/mainnet execution from testnet run evidence.

### 4B.1 Live configuration

Use config-driven KeeperHub API/CLI/MCP or direct-execution path. Do not commit credentials or mutable live logs.

### 4B.2 Live readiness

Check credentials, selected project/workflow/direct-execution target, executor/custody model, and network funding without submitting.

### 4B.3 Live submit

Submit only a verified ClearIntent intent through the selected KeeperHub path.

### 4B.4 Monitor path

Capture run status, logs, transaction hash when applicable, timestamps, and error context.

### 4B.5 Midpoint audit

Audit target: live execution claim boundaries, custody/gas model, and no execution before ClearIntent verification.

### 4B.6 Receipt conversion

Convert live run/transaction evidence into canonical `ExecutionReceipt`.

### 4B.7 Center CLI live readout

Show local fixture, live readiness, degraded live lookup, and verified live execution states distinctly in human-readable and JSON modes if execution commands are added.

### 4B.8 Feedback and demo prep

Update `KEEPERHUB_FEEDBACK.md`, provider docs, and demo-prep notes with exact live behavior.

### 4B.9 Closeout audit

Audit target: KeeperHub integration is meaningful, reusable, and supported by live evidence for any live/onchain claims.

## Success criteria

- execution path works or is demonstrably wired to KeeperHub workflow
- feedback file is specific and actionable
- receipt is included in audit bundle
- local claims remain `keeperhub-local-fixture` until live run evidence exists
- live execution claims identify the exact KeeperHub path, run evidence, receipt fields, and audit persistence level
