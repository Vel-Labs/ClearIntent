# Fresh Agent Handoff: Complete Phase 1D Core Lifecycle/State API

Repository:

- `/Users/steven/Desktop/Coding/ClearIntent`

Phase:

- Phase 1D: Core Lifecycle/State API

Objective:

- Complete Phase 1D by turning the Phase 1C lifecycle/status primitives into a stable, documented, tested state API that future Center CLI, webhook, adapter, and demo layers can consume without inventing lifecycle semantics.
- Keep this core-only. Do not implement the CLI skeleton, webhook system, OS notifications, provider adapters, signer adapters, demo app, or UI.

Read first:

1. `AGENTS.md`
2. `REPO_PROFILE.json`
3. `docs/agents/START_HERE.md`
4. `contracts/README.md`
5. `contracts/authority-lifecycle.md`
6. `packages/core/API.md`
7. `packages/core/README.md`
8. `docs/audits/phase-1-core-authority-kernel/1c-core-package-closeout.md`
9. `docs/roadmaps/features/feature-01-core-authority-kernel.md`
10. `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
11. `docs/roadmaps/ROADMAP.md`
12. `docs/governance/stability-handoff.md`

Current state:

- Phase 1A complete: canonical authority contracts live in `contracts/`.
- Phase 1B complete: repo-local contract validation and tests are present.
- Phase 1C complete: `packages/core/` exists with:
  - schema-backed contract validation
  - lifecycle transition checks
  - lifecycle status and missing-evidence inspection
  - one-step lifecycle advancement
  - deterministic local hashing helpers
  - fail-closed authority verification for policy, identity, signer, executor, nonce, deadline, value, risk report, human review, and signature evidence
  - callable API documentation in `packages/core/API.md`
  - 19 passing tests
- Phase 1D is ready to start.

Allowed files:

- `packages/core/src/`
- `packages/core/API.md`
- `packages/core/README.md`
- `tests/core/`
- `docs/roadmaps/features/feature-01-core-authority-kernel.md`
- `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `docs/roadmaps/ROADMAP.md`
- `ROADMAP.md`
- `docs/audits/phase-1-core-authority-kernel/`
- `CHANGELOG.md`
- `DECISIONS.md`
- `docs/decisions/`
- `docs/FILE_TREE.md`
- `REPO_PROFILE.json` only if canonical paths or commands change

Do not touch:

- `contracts/` unless you discover an actual contract defect. If that happens, stop and document the defect before editing contracts.
- `packages/ens-identity/`
- `packages/zerog-memory/`
- `packages/zerog-compute/`
- `packages/keeperhub-adapter/`
- `packages/signer-hardware/`
- `packages/opencleaw-adapter/`
- `packages/x402-adapter/`
- `examples/guardian-agent/`
- `apps/`
- deployment, hosted-service, browser UI, or demo integration files

Out of scope:

- Center CLI commands
- CLI module registry
- webhook notification delivery
- local OS notification delivery
- ENS resolution
- 0G reads/writes
- KeeperHub execution
- Ledger or hardware signer integration
- EIP-712 digest/signature verification implementation
- HTTP, JSON-RPC, MCP, or REST API routes

Implementation requirements:

1. Keep `contracts/` as canonical truth.
2. Keep `packages/core` adapter-neutral and transport-neutral.
3. Define state API additions as callable TypeScript primitives, not `GET`/`POST` routes.
4. Add an explicit state snapshot API. Use names close to these unless a better repo-consistent name emerges:
   - `CoreStateSnapshot`
   - `CoreStateEvidenceSummary`
   - `CoreNextAction`
   - `deriveCoreStateSnapshot(input)`
5. The snapshot must be machine-readable and suitable for future CLI rendering. It should include, at minimum:
   - intent id
   - current lifecycle state
   - next lifecycle state when applicable
   - whether execution is currently blocked
   - evidence present by key
   - missing evidence by key
   - blocking issue codes
   - recommended next action as structured data, not prose only
   - degraded/audit visibility if execution or audit evidence is degraded
6. Preserve existing public APIs unless a change is clearly necessary:
   - `createContractValidator`
   - `assertLifecycleAdvance`
   - `inspectLifecycle`
   - `advanceIntentLifecycle`
   - `verifyAuthority`
   - hashing helpers
7. Prefer small modules. If `status.ts` grows too broad, extract state snapshot logic into a new file such as `state.ts`.
8. Use stable issue codes. Future CLI/adapters should not need to parse human message strings.
9. Update `packages/core/API.md` for every public callable API change.
10. Add focused tests for both happy path and fail-closed behavior.

Required test coverage:

- incomplete/proposed state reports missing policy evidence
- ready-to-advance state reports `canAdvance: true`
- blocked state reports stable blocking issue codes
- human-review-needed state identifies human approval as next action
- signed-but-unverified state identifies verification as next action
- verified-but-unsubmitted state identifies submission as next action
- degraded receipt/audit state is visible and not silently treated as clean success
- executed state can point toward audit bundle creation
- audited state is terminal
- malformed or mismatched evidence produces structured failures

Expected deliverables:

- core state snapshot type(s)
- public derivation function for state snapshots
- tests under `tests/core/`
- updated `packages/core/API.md`
- updated `packages/core/README.md` if the public package summary changes
- Phase 1D closeout audit under `docs/audits/phase-1-core-authority-kernel/`
- roadmap/current-state updates marking Phase 1D complete or blocked
- `CHANGELOG.md` update
- `DECISIONS.md` and `docs/decisions/2026-04-26.md` update only if you make durable architecture/API decisions beyond the existing core API decision
- `docs/FILE_TREE.md` update for any added file

Validation commands:

Run the broadest safe gate:

```bash
npm run check
```

If debugging, focused commands are:

```bash
npm run validate:scaffold
npm run validate:contracts
npm run test:contracts
npm test
npm run typecheck
```

Closeout requirements:

- Report exact commands and exact results.
- State whether Phase 1D is complete, blocked, or passed with follow-up.
- If complete, update routing so the next action is the next approved phase, likely the Center CLI skeleton planning/build phase.
- Do not claim CLI readiness unless the state API is documented, tested, and suitable for machine-readable CLI consumption.

Stop conditions:

- Stop before editing `contracts/` unless a real contract defect is documented.
- Stop before adding provider-specific fields or behavior.
- Stop before implementing any CLI/webhook/notification transport behavior.
- Stop before changing authority semantics that are not backed by `contracts/authority-lifecycle.md`.

Final answer checklist:

- Files changed
- Core API additions
- Tests added
- Commands run and results
- Audit path
- Next recommended phase

