# ClearIntent

ClearIntent is an authority layer for autonomous onchain agents.

The project goal is to let agents reason, plan, and coordinate without giving them unchecked execution authority. Agents produce bounded intents. Humans and approved operators review those intents through readable signing flows. Onchain contracts verify the authority, policy, nonce, deadline, and execution bounds before KeeperHub or any other executor can act.

## Current repository state

This scaffold is documentation and governance first. It is meant to create an orderly, auditable project foundation before implementation begins.

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
ARCHITECTURE.md                   top-level system design
ROADMAP.md                        feature roadmap and dependency order
DECISIONS.md                      durable architectural decisions
CHANGELOG.md                      chronological repo changes
CONTRIBUTING.md                   contributor expectations
AI_USAGE.md                       AI tooling disclosure log
.claude/                          Claude-specific bootstrap pointers

docs/
  README.md                       documentation index
  repo-truth/                     durable truth, methodology, boundaries, source materials
  governance/                     audits, multi-agent workflow, worktrees, quality standards
  hackathon/                      objectives, rules, vendor tracks, submission plan
  architecture/                   technical architecture references
  roadmaps/                       feature-level roadmap packages
  templates/                      phase, audit, and prompt templates
  audits/                         midpoint and closeout audit outputs
```

## Start here

Read in this order:

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/repo-truth/THC_METHODOLOGY.md`
4. `docs/repo-truth/THC_IN_THIS_REPO.md`
5. `ARCHITECTURE.md`
6. `REPO_BOUNDARIES.md`
7. `ROADMAP.md`
8. `docs/hackathon/README.md`
9. `docs/hackathon/vendor-tracks.md`
10. `docs/hackathon/rules.md`

## Core doctrine

- Agents may propose. Authority must be bounded.
- Identity must resolve from durable records, not hidden configuration.
- Policies must be inspectable and versioned.
- Signed intents must be replayable and auditable.
- Execution must fail closed when evidence is missing.
- Code must be readable before it is clever.
- Documentation is part of delivery, not post-delivery cleanup.

## Naming posture

ClearIntent should stay vendor-neutral. Ledger hardware, ENS, 0G, KeeperHub, ERC-7730, EIP-712, ERC-8004, ERC-7857, and x402 are integrations or standards, not the product identity.

## Status

Pre-implementation governance scaffold.
