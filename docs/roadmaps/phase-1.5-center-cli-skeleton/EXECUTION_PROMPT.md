# Phase 1.5 Center CLI Skeleton Execution Prompt

```md
Start Phase 1.5 and execute the Center CLI skeleton in one coordinated run.

Repository:
- `/Users/steven/Desktop/Coding/ClearIntent`

Read first:
- `/Users/steven/Desktop/Coding/ClearIntent/AGENTS.md`
- `/Users/steven/Desktop/Coding/ClearIntent/REPO_PROFILE.json`
- `/Users/steven/Desktop/Coding/ClearIntent/docs/README.md`
- `/Users/steven/Desktop/Coding/ClearIntent/docs/architecture/ARCHITECTURE.md`
- `/Users/steven/Desktop/Coding/ClearIntent/docs/architecture/REPO_BOUNDARIES.md`
- `/Users/steven/Desktop/Coding/ClearIntent/ROADMAP.md`
- `/Users/steven/Desktop/Coding/ClearIntent/docs/roadmaps/ROADMAP.md`
- `/Users/steven/Desktop/Coding/ClearIntent/docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- `/Users/steven/Desktop/Coding/ClearIntent/docs/roadmaps/phase-1.5-center-cli-skeleton/IMPLEMENTATION_PLAN.md`
- `/Users/steven/Desktop/Coding/ClearIntent/packages/core/API.md`
- `/Users/steven/Desktop/Coding/ClearIntent/docs/audits/phase-1-core-authority-kernel/1f-contract-core-stability-handoff-closeout.md`
- `/Users/steven/Desktop/Coding/ClearIntent/DECISIONS.md`
- `/Users/steven/Desktop/Coding/ClearIntent/docs/repo-truth/THC_METHODOLOGY.md`
- `/Users/steven/Desktop/Coding/ClearIntent/docs/repo-truth/THC_IN_THIS_REPO.md`
- `/Users/steven/Desktop/Coding/ClearIntent/docs/governance/multi-agent-workflow.md`
- `/Users/steven/Desktop/Coding/ClearIntent/docs/governance/worktree-governance.md`
- `/Users/steven/Desktop/Coding/ClearIntent/docs/hackathon/vendor-tracks.md`

Goal:
Complete `1.5.1` through `1.5.9` of Phase 1.5 Center CLI Skeleton.

Operating rules:
- The CLI is the product center, not the authority source.
- Consume `packages/core` public primitives. Do not reimplement lifecycle, review, signer, executor, deadline, or audit rules.
- Keep output layering explicit:
  - default human-readable terminal output
  - `--json` or equivalent deterministic AI-readable output
- JSON output must contain no leading prose.
- Keep this phase fixture-backed/local only.
- Do not implement ENS, 0G, KeeperHub, Ledger, signer, webhook delivery, OS notifications, browser UI, hosted service, or demo integration.
- Do not create provider adapter directories.
- Do not edit `contracts/` unless a real contract defect is found; stop and document before doing so.
- Preserve fail-closed behavior when evidence is weak, missing, mismatched, expired, or degraded.
- Do not stage unrelated worktree changes.

Expected implementation:
- Add a repo-local CLI entrypoint, likely under `apps/clearintent-cli/` or `packages/center-cli/`.
- Add npm script(s) for local use.
- Implement command families equivalent to:
  - `clearintent center status`
  - `clearintent center inspect`
  - `clearintent intent validate`
  - `clearintent intent state`
  - `clearintent authority evaluate`
  - `clearintent module list`
  - `clearintent module doctor`
- Use existing fixtures in `contracts/examples/` for skeleton behavior.
- Use `deriveCoreStateSnapshot` and `evaluateCoreAuthority` from `packages/core`.
- Add tests for command routing, human output, JSON output, blocked/missing evidence, and module doctor behavior.
- Add midpoint audit at `docs/audits/phase-1.5-center-cli-skeleton/1.5.5-midpoint-audit.md`.
- Add closeout audit at `docs/audits/phase-1.5-center-cli-skeleton/1.5.9-closeout-audit.md`.
- Update `ROADMAP.md`, `docs/roadmaps/ROADMAP.md`, `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`, `CHANGELOG.md`, and `docs/FILE_TREE.md`.

Verification requirements:
- Run focused tests during implementation.
- Before finalizing, run:
  - `npm run validate:scaffold`
  - `npm run validate:contracts`
  - `npm run test:contracts`
  - `npm test`
  - `npm run typecheck`
  - `npm run check`
- Do not claim completion without concrete command output.

Required final summary:
- what CLI commands landed
- how human-readable and AI-readable output are separated
- what remains fixture-only
- what audits found and how findings were closed
- exact verification run and results
- deferred gaps
- whether provider adapter work can start next
```

