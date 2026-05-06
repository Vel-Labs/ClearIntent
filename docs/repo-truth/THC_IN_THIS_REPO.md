# THC In ClearIntent

## Purpose

This document maps the general THC Methodology onto ClearIntent.

THC stands for:

- Truth
- Hardening
- Clarity

ClearIntent is an authority system for autonomous agents. That means hidden trust is not a documentation problem. It is a security problem.

## Truth in this repo

Truth is grounded in explicit artifacts.

Examples:

- `AGENTS.md` defines how humans and coding agents operate.
- `docs/architecture/ARCHITECTURE.md` defines the system planes and lifecycle.
- `docs/architecture/REPO_BOUNDARIES.md` defines which layer owns which responsibility.
- `ROADMAP.md`, `docs/roadmaps/ROADMAP.md`, and `docs/roadmaps/features/` define dependency-aware sequencing.
- `DECISIONS.md` indexes durable architecture choices; dated entries live under `docs/decisions/`.
- `docs/hackathon/` records prize targets, rules, and eligibility claims.
- future `contracts/`, `schemas/`, and `packages/core/` artifacts should define machine-verifiable authority truth.

Truth should not live only in a chat transcript, an agent scratchpad, or a contributor's memory.

## Hardening in this repo

Hardening is deliberate pressure against drift, ambiguity, and unsafe authority.

Examples:

- midpoint and closeout audits for roadmap phases
- fail-closed execution rules
- explicit signer and executor boundaries
- deterministic fixtures for intent verification
- clear separation between agent proposal and execution authority
- worktree governance for parallel agents
- changelog and decision records for traceability

Hardening should expose weak assumptions before they become demo failures or security claims.

## Clarity in this repo

Clarity means another builder can inspect the repo and understand:

- what ClearIntent does
- what it does not do yet
- how agents are allowed to act
- where policy lives
- where identity resolves from
- what was signed
- what was executed
- what was audited
- what is still a stretch feature

If the system gets harder to explain as it grows, that is a reliability issue.

## THC artifact mapping

| THC pillar | ClearIntent expression |
| --- | --- |
| Truth | contracts, schemas, ENS records, 0G artifacts, roadmap docs, decisions |
| Hardening | audits, verification, fail-closed checks, worktree isolation, threat modeling |
| Clarity | docs indexes, readable intent previews, demo script, architecture diagrams, audit receipts |

## THC-BOT artifact boundary

ClearIntent uses local THC-BOT artifacts as first-party preparation evidence.

- `docs/thc/LOCAL_CHECK.md` is the human executive summary and readiness checklist.
- `docs/thc/THC-BOT.history.json` and `docs/thc/runs/<run-id>/` are the structured local run ledger.
- `docs/thc/THC-BOT.html` is an optional visualization generated from canonical artifacts.

These artifacts help future reviewers find evidence faster. They are not public certification, endorsement, or independent verification. Public or leaderboard review must still verify the cited files and current repository state independently.

## Operating implication

Every feature should answer three questions:

1. What is true and where is it recorded?
2. How did we harden that truth?
3. Can another builder inspect it without trusting us?
