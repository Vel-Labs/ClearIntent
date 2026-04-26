# CHANGELOG

All notable repo changes should be logged here.

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
