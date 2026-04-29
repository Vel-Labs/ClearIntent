# Phase 4 KeeperHub Execution Adapter Implementation Plan

## Purpose

Make KeeperHub the ClearIntent execution adapter without letting it become the authority source.

Phase 4 should mirror the local-first pattern used by Phase 2 and Phase 3: define and test the adapter shape locally first, then replace the backend with live KeeperHub/onchain evidence when credentials and runtime conditions are ready.

## Why now

- Phase 1 and `packages/core/` already define authority verification, lifecycle state, and canonical `ExecutionReceipt` contract truth.
- Phase 1.5 established the Center CLI human/JSON operator surface.
- Phase 2A established local memory/audit artifact semantics; Phase 2B is live-gated.
- Phase 3A established local ENS identity/discovery semantics; Phase 3B is live-gated on Phase 2B.
- KeeperHub can be scaffolded locally now because adapter interfaces, workflow mapping, receipt shape, blocked states, tests, and Center CLI status do not require live execution.

Skipping 4A would force live KeeperHub work to define contracts, fixtures, operator output, and audit semantics under time pressure.

## Phase split

### Phase 4A: KeeperHub Execution Local Scaffold

Goal: define and test the reusable execution adapter shape locally.

Allowed scope:

- `packages/keeperhub-adapter/` scaffold
- `tests/keeperhub-adapter/`
- typed `ExecutionAdapter` interface and local/mock implementation
- verified-intent-to-workflow mapping fixtures
- local submit/monitor simulation
- typed execution result and receipt conversion compatible with `contracts/schemas/execution-receipt.schema.json`
- explicit blocked/degraded states for missing verification, missing signature, unsupported executor, missing workflow ID, failed run, missing transaction evidence, missing receipt, and live provider unavailable
- Center CLI execution/KeeperHub status route if it stays thin and honest
- midpoint and closeout audits under `docs/audits/phase-4-keeperhub-execution-adapter/`

Claim level:

- `keeperhub-local-fixture`

Stop point:

- midpoint audit proves the adapter cannot submit unsigned, unverified, or executor-mismatched intents
- closeout audit proves workflow mapping, local submit/monitor simulation, typed receipt output, Center CLI readout if added, and no live KeeperHub/onchain claim

### Phase 4B: Live KeeperHub / Onchain Execution

Goal: replace the 4A local backend with a real KeeperHub execution path and capture live run/transaction evidence.

Required before starting:

- Phase 4A closeout
- local KeeperHub API/CLI/MCP credentials or selected live path
- selected workflow/direct-execution target
- explicit executor/wallet/custody model documented
- testnet funds/gas where needed
- Phase 2B closeout if execution receipts or audit bundles will claim live 0G persistence
- Phase 3B closeout if the live execution claim depends on ENS-derived identity or policy records

Allowed scope:

- config-driven KeeperHub live adapter behind the Phase 4A interface
- live workflow create/submit or direct execution path
- run status monitoring
- transaction/run evidence capture
- typed `ExecutionReceipt` conversion
- audit bundle inclusion when the backing memory layer can support the claim level
- `KEEPERHUB_FEEDBACK.md` updates with setup friction, docs gaps, bugs, and useful surfaces
- Center CLI live/degraded execution readout

Claim levels:

- `keeperhub-live-ready` after credentials/config/tooling check passes without submitting
- `keeperhub-live-run` after a KeeperHub run is created and monitored
- `keeperhub-live-executed` only after transaction or terminal execution evidence is captured and converted into a typed receipt

Stop point:

- closeout audit proves which live KeeperHub path was used, which receipt fields are real, which audit persistence claims are live, and which fields remain local or mocked

## Goals

- Preserve ClearIntent verification as the gate before execution.
- Keep KeeperHub isolated behind an adapter interface.
- Convert verified intents into reusable KeeperHub workflow or direct-execution requests.
- Return typed receipt data that can flow into the audit bundle.
- Make local readiness visible through tests and, if included, Center CLI status.
- Produce useful KeeperHub feedback once live integration begins.

## Non-goals

- Executing unsigned, unreviewed, unverified, expired, or executor-mismatched intents.
- Custodying private keys inside ClearIntent.
- Treating KeeperHub as policy truth, signer truth, or audit truth.
- Live KeeperHub submission in 4A.
- Live onchain transaction claims in 4A.
- Guardian Agent example wiring in 4A unless it is only a documented fixture boundary.
- Agent Audit dashboard implementation.
- Phase 2C 0G Compute.

## Current foundation entering this phase

- `contracts/schemas/execution-receipt.schema.json` defines the canonical receipt shape.
- `contracts/authority-lifecycle.md` requires `verified` before `submitted` and `ExecutionReceipt` before `executed`.
- `packages/core/` provides verification and state APIs that identify missing signature, verification, executor, nonce, deadline, and policy evidence.
- `packages/zerog-memory/` can store local audit artifacts at `local-adapter` claim level.
- `packages/ens-identity/` can resolve local fixture identity at `ens-local-fixture` claim level.
- `packages/center-cli/` already has human and JSON lanes for local module status.

## Core intent

Phase 4 makes ClearIntent capable of handing a verified intent to an execution system and getting back a receipt. It must not pretend that KeeperHub approval, workflow creation, or a successful local simulation replaces ClearIntent policy verification, human review, signing, onchain evidence, or audit proof.

## Canonical distinctions

- verified intent vs proposed intent
- workflow request vs execution receipt
- local fixture run vs live KeeperHub run
- live KeeperHub run vs onchain transaction evidence
- executor authorization vs KeeperHub account/wallet custody
- receipt capture vs audit persistence

## Expected outcome

After 4A, a developer or agent can inspect a local KeeperHub execution scaffold, see exactly why unverified intents are blocked, map a verified fixture intent to a local workflow request, simulate submit/monitor locally, and produce a typed receipt fixture without any live execution claim.

After 4B, the same interface can submit through a selected live KeeperHub path, monitor execution, capture run/transaction evidence, convert it into an `ExecutionReceipt`, and document the exact claim level reached.

## Human and agent surfaces

If Center CLI behavior is added in 4A or 4B, implementation must cover:

- direct human command, such as `npm run clearintent -- execution status` or `npm run clearintent -- keeperhub status`
- agent-readable JSON command, such as `npm run --silent clearintent -- execution status --json`
- guided wizard route through bare `npm run clearintent`

If 4A keeps KeeperHub package-only, document the CLI wizard gap in the midpoint and closeout audits and do not call the operator surface complete.

## Milestone cadence

### Phase 4A

- `4A.1`: package scaffold, interface, status/result types, and claim-level constants
- `4A.2`: verified-intent-to-workflow mapping fixture
- `4A.3`: local/mock submit and monitor implementation
- `4A.4`: typed receipt conversion compatible with canonical `ExecutionReceipt`
- `4A.5`: midpoint audit for fail-closed execution boundaries
- `4A.6`: blocked/degraded state coverage
- `4A.7`: Center CLI execution/KeeperHub status route or documented deferred gap
- `4A.8`: docs, tests, feedback placeholder review, and roadmap routing updates
- `4A.9`: closeout audit

### Phase 4B

- `4B.1`: live KeeperHub configuration and selected integration path
- `4B.2`: live readiness/status command without submission
- `4B.3`: workflow create/submit or direct-execution path
- `4B.4`: live run monitoring
- `4B.5`: midpoint audit for live execution claim boundaries and custody model
- `4B.6`: typed receipt conversion from live evidence
- `4B.7`: Center CLI live/degraded execution readout
- `4B.8`: `KEEPERHUB_FEEDBACK.md`, docs, and demo-prep updates
- `4B.9`: closeout audit

## Planned artifacts

- `packages/keeperhub-adapter/`
- `tests/keeperhub-adapter/`
- `docs/audits/phase-4-keeperhub-execution-adapter/4a.5-midpoint-audit.md`
- `docs/audits/phase-4-keeperhub-execution-adapter/4a.9-closeout-audit.md`
- `docs/audits/phase-4-keeperhub-execution-adapter/4b.5-midpoint-audit.md`
- `docs/audits/phase-4-keeperhub-execution-adapter/4b.9-closeout-audit.md`
- `KEEPERHUB_FEEDBACK.md` updates during 4B, and during 4A only if local source review finds actionable notes
- roadmap/current-state updates after each closeout

## Recommended implementation shape

### Workstream 4A adapter package

Files:

- Create: `packages/keeperhub-adapter/src/types.ts`
- Create: `packages/keeperhub-adapter/src/workflow-mapping.ts`
- Create: `packages/keeperhub-adapter/src/local-execution-adapter.ts`
- Create: `packages/keeperhub-adapter/src/receipt.ts`
- Create: `packages/keeperhub-adapter/src/index.ts`
- Create: `tests/keeperhub-adapter/keeperhub-adapter.test.ts`

Expected outcome:

- local adapter maps only verified fixture inputs and blocks unsafe submissions with explicit issue codes.

### Workstream 4A Center CLI

Files:

- Modify: `packages/center-cli/src/commands.ts`
- Modify or create: `packages/center-cli/src/execution-status.ts`
- Modify: `packages/center-cli/src/modules.ts`
- Modify: `packages/center-cli/src/output.ts`
- Modify: `packages/center-cli/src/wizard.ts`
- Modify: `scripts/validate-center-cli.ts`
- Modify: `tests/center-cli/center-cli.test.ts`

Expected outcome:

- human and JSON execution/KeeperHub status is available without implying live execution or authority approval.

### Workstream 4A docs and audits

Files:

- Create: `docs/audits/phase-4-keeperhub-execution-adapter/4a.5-midpoint-audit.md`
- Create: `docs/audits/phase-4-keeperhub-execution-adapter/4a.9-closeout-audit.md`
- Modify: `ROADMAP.md`
- Modify: `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- Modify: `docs/roadmaps/ROADMAP.md`
- Modify: `docs/roadmaps/features/feature-04-keeperhub-execution-adapter.md`
- Modify: `REPO_PROFILE.json`
- Modify: `docs/FILE_TREE.md`
- Modify: `CHANGELOG.md`

Expected outcome:

- repo truth names the reached 4A claim level and routes 4B live execution separately.

## Touchpoints

- `contracts/schemas/execution-receipt.schema.json`
- `contracts/authority-lifecycle.md`
- `packages/core/src/`
- `packages/center-cli/`
- `packages/zerog-memory/` only if local receipt/audit-bundle fixtures need storage refs
- `KEEPERHUB_FEEDBACK.md`
- `docs/providers/KeeperHub/`
- `docs/hackathon/vendor-tracks.md` only if prize claims change

## Validation

Minimum 4A validation:

```bash
npm run validate:scaffold
npm run validate:contracts
npm run validate:center-cli
npm test
npm run typecheck
npm run check
```

Minimum 4B validation:

```bash
npm run validate:scaffold
npm run validate:contracts
npm run validate:center-cli
npm test
npm run typecheck
npm run --silent clearintent -- memory live-status --json
npm run --silent clearintent -- execution live-status --json
```

If live KeeperHub, live onchain, live ENS, or live 0G commands cannot run in the current environment, the audit must say why and preserve the lower claim level.
