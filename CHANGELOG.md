# CHANGELOG

All notable repo changes should be logged here.

## 2026-04-26

- Started Phase 1C by adding `packages/core/` with schema-backed contract validation, lifecycle transition helpers, lifecycle status/missing-evidence inspection, deterministic hashing, fail-closed authority verification, and focused `tests/core/` coverage.
- Added `packages/core/API.md` to define the callable core API and avoid HTTP `GET`/`POST` ambiguity before CLI, webhook, or service wrappers exist.
- Completed Phase 1C with additional fail-closed semantic checks for nonce, policy deadline window, value limit, risk decision/severity, human review, signature, lifecycle evidence mismatch, a closeout audit, and a Phase 1D fresh-session handoff prompt.
- Expanded the Phase 1D handoff prompt and `packages/core/API.md` with explicit completion criteria and the target core state snapshot API.
- Completed Phase 1D by adding the `deriveCoreStateSnapshot` API with evidence summaries, next-action codes, degraded-signal visibility, terminal-state handling, tests, and closeout routing.
- Completed Phase 1E by adding `evaluateCoreAuthority`, stable public API guidance, and module-facing tests that compose state snapshots, lifecycle advancement, and authority verification.
- Completed Phase 1F by closing the contract/core stability handoff and routing the next implementation target to a Phase 1.5 Center CLI skeleton over `packages/core`.
- Added implementation-facing repo-local skills for roadmap phase planning, feature implementation, contract fixture authoring, adapter scaffolding, repo doc routing, hackathon submission auditing, and pre-commit quality gates.
- Added explicit repo-local skill discovery and maintenance guidance to `AGENTS.md`, root `README.md`, and `skills/README.md`.
- Modernized root repo-local skills with YAML frontmatter, clearer trigger descriptions, skill-local templates, and a `core-enforcement` skill for the planned `packages/core/` implementation layer.
- Converted root `ROADMAP.md` and `DECISIONS.md` into high-visibility indexes, moved detailed roadmap scope into `docs/roadmaps/ROADMAP.md`, and split durable decisions into dated logs under `docs/decisions/`.
- Moved top-level architecture and repo-boundary docs into `docs/architecture/`, moved repo-local skill templates to root `skills/`, and updated scaffold routing/validation references.
- Added a machine-readable `REPO_PROFILE.json`, scaffold validation command, agent start guide, repo-local skill templates, handoff templates, minimal GitHub hygiene, and docs routing for agent-friendly onboarding.
- Hardened the Phase 1B package and documentation baseline with a first-class `npm run typecheck` script, clearer install and validation instructions, explicit `tests/` quality-gate expectations, and updated Phase 1 routing toward `packages/core/`.
- Added a contract/core stability handoff governance doc and reusable scaffold prompt so future projects can establish canonical truth, executable core enforcement, and local quality gates before adapter or demo work.

## 2026-04-25

- Added initial ClearIntent governance and documentation scaffold.
- Added root README, AGENTS, architecture, repository boundaries, roadmap, decisions, changelog, contribution, and AI usage docs.
- Added `.claude/` bootstrap folder pointing Claude to `AGENTS.md` as the canonical operating guide.
- Added docs index under `docs/README.md`.
- Added repo-truth docs for THC methodology, ClearIntent-specific THC mapping, source material, operating doctrine, and truth boundaries.
- Added governance docs for audit philosophy, multi-agent workflow, worktree governance, code quality standards, phase cadence, and open-source posture.
- Added hackathon docs for objective, rules, vendor-track eligibility, judging strategy, demo plan, and submission checklist.
- Added feature-level roadmap files with dependencies and subphases.
- Added reusable phase, audit, and execution prompt templates.
- Added provider documentation funnels for 0G, ENS, KeeperHub, and Ledger under `docs/providers/`, plus a repo-truth provider source intake note.
- Added Phase 1A contract authority baseline under `contracts/`, including lifecycle docs, JSON schemas, fixtures, and directive updates requiring agents to treat `contracts/` as canonical authority truth.
- Added Phase 1B repo-local TypeScript contract validation tooling with `npm run validate:contracts`, Vitest contract tests, shared `tests/` quality-gate docs, and a closeout audit.
