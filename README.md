# ClearIntent

ClearIntent is an authority layer for autonomous onchain agents.

The project goal is to let agents reason, plan, and coordinate without giving them unchecked execution authority. Agents produce bounded intents. Humans and approved operators review those intents through readable signing flows. Onchain contracts verify the authority, policy, nonce, deadline, and execution bounds before KeeperHub or any other executor can act.

## Current Repository State

This scaffold is documentation, contracts, and validation tooling first. Phase 1A established the canonical `contracts/` authority layer. Phase 1B established repo-local TypeScript/Node validation and Vitest contract checks. The immediate next build step is `packages/core/`, which must implement and enforce `contracts/` without redefining authority shapes.

The first implementation target is a working example agent that demonstrates:

1. ENS-resolved agent identity and metadata.
2. 0G-backed policy memory, audit storage, and risk reflection.
3. Bounded EIP-712 intent generation.
4. Human-readable approval metadata.
5. Hardware-backed signing as a signer adapter, not a product identity.
6. KeeperHub execution after policy and signature verification.

## What this repo should become

```text
ClearIntent
  -> framework primitive
  -> example Guardian Agent
  -> reusable adapters
  -> audit-first open-source project
```

The framework primitive is the important part. The example agent proves the primitive works, but the repo should remain useful to other builders who want safe agent execution without copying our whole app.

## Repository map

```text
AGENTS.md                         operating rules for humans and coding agents
REPO_PROFILE.json                 machine-readable repo taxonomy, commands, and scaffold rules
ARCHITECTURE.md                   top-level system design
ROADMAP.md                        feature roadmap and dependency order
DECISIONS.md                      durable architectural decisions
CHANGELOG.md                      chronological repo changes
CONTRIBUTING.md                   contributor expectations
AI_USAGE.md                       AI tooling disclosure log
.claude/                          Claude-specific bootstrap pointers

docs/
  README.md                       documentation index
  agents/                         agent start guide and onboarding routing
  agent-skills/                   repo-local scaffold skill templates
  repo-truth/                     durable truth, methodology, boundaries, source materials
  governance/                     audits, multi-agent workflow, worktrees, quality standards
  hackathon/                      objectives, rules, vendor tracks, submission plan
  architecture/                   technical architecture references
  roadmaps/                       feature-level roadmap packages
  templates/                      phase, audit, and prompt templates
  audits/                         midpoint and closeout audit outputs

contracts/
  README.md                       canonical authority contract overview
  authority-lifecycle.md          lifecycle states and human intervention gates
  schemas/                        machine-checkable intent, policy, risk, review, receipt, and audit schemas
  examples/                       valid and invalid fixtures for contract-first implementation

scripts/
  validate-scaffold.ts            repo-local scaffold and taxonomy validation command
  validate-contracts.ts           repo-local contract validation command

tests/
  README.md                       shared local quality gate for humans and agents
  contracts/                      contract validation tests
```

## Local Setup and Validation

Install dependencies:

```bash
npm install
```

Run the contract validation script:

```bash
npm run validate:scaffold
npm run validate:contracts
```

Run contract-only tests:

```bash
npm run test:contracts
```

Run all repo-local tests:

```bash
npm test
```

Run TypeScript checking for scripts and tests:

```bash
npm run typecheck
```

Run the full local quality gate:

```bash
npm run check
```

Before `packages/core/` implementation begins, these commands should pass locally. Provider adapters and demo integrations are deferred until the core authority kernel consumes the contract layer cleanly.

## Start here

Read in this order:

1. `AGENTS.md`
2. `REPO_PROFILE.json`
3. `docs/agents/START_HERE.md`
4. `docs/README.md`
5. `docs/repo-truth/THC_METHODOLOGY.md`
6. `docs/repo-truth/THC_IN_THIS_REPO.md`
7. `ARCHITECTURE.md`
8. `REPO_BOUNDARIES.md`
9. `ROADMAP.md`
10. `docs/hackathon/README.md`
11. `docs/hackathon/vendor-tracks.md`
12. `docs/hackathon/rules.md`

## Core doctrine

- Agents may propose. Authority must be bounded.
- `contracts/` defines the non-negotiable information contract for authority shapes.
- `packages/core/` implements and enforces the contracts; it does not invent authority semantics independently.
- `contracts/` plus `packages/core/` are the stability handoff before provider adapters and demo work.
- Identity must resolve from durable records, not hidden configuration.
- Policies must be inspectable and versioned.
- Signed intents must be replayable and auditable.
- Execution must fail closed when evidence is missing.
- Code must be readable before it is clever.
- Documentation is part of delivery, not post-delivery cleanup.

## Naming posture

ClearIntent should stay vendor-neutral. Ledger hardware, ENS, 0G, KeeperHub, ERC-7730, EIP-712, ERC-8004, ERC-7857, and x402 are integrations or standards, not the product identity.

## Status

Contract and validation baseline complete. Ready for `packages/core/` implementation against the Phase 1B quality gate; not ready to claim provider integration readiness.
