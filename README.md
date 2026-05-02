# ClearIntent

ClearIntent is an authority layer for autonomous onchain agents.

The project goal is to let agents reason, plan, and coordinate without giving them unchecked execution authority. Agents produce bounded intents. Humans and approved operators review those intents through readable signing flows. Onchain contracts verify the authority, policy, nonce, deadline, and execution bounds before KeeperHub or any other executor can act.

ClearIntent supports signer adapters across injected wallets, WalletConnect wallets, smart wallets, and hardware-backed wallets. The baseline integration target is EIP-712 typed intent signing plus ClearIntent's own human-readable approval metadata. Wallet-specific rendering and secure-screen guarantees are reported separately by tested capability level.

ClearIntent is not betting on one wallet. It makes agent authority portable across wallet surfaces, while reporting the assurance level honestly.

## Current Repository State

This scaffold is documentation, contracts, and validation tooling first. Phase 1 established the canonical `contracts/` authority layer and executable `packages/core/` authority primitives. Phase 1.5 added the Center CLI. Phase 2A added local 0G policy memory/audit semantics. Phase 3A added the local ENS identity scaffold at `ens-local-fixture` claim level. Phase 4A added the local KeeperHub execution scaffold at `keeperhub-local-fixture` claim level. Phase 2B live 0G proof, Phase 3B live ENS binding, and Phase 4B live KeeperHub/onchain execution remain unproven.

The first implementation target is a working example agent that demonstrates:

1. ENS-resolved agent identity and metadata.
2. 0G-backed policy memory, audit storage, and risk reflection.
3. Bounded EIP-712 intent generation.
4. Human-readable approval metadata.
5. Software wallet, WalletConnect, smart-account, or hardware-backed signing through explicit signer adapters.
6. KeeperHub execution after policy and signature verification.

## What this repo should become

```text
ClearIntent
  -> framework primitive
  -> example Guardian Agent
  -> reusable adapters
  -> wallet-neutral signer support
  -> audit-first open-source project
```

The framework primitive is the important part. The example agent proves the primitive works, but the repo should remain useful to other builders who want safe agent execution without copying our whole app.

## Intended product flow

The preferred user path is hosted-dashboard first, SDK/CLI second:

```text
connect parent wallet in ClearIntent dashboard
  -> create or connect a dedicated agent wallet / smart account
  -> configure policy and escalation rules
  -> store/resolve policy and audit pointers through 0G and ENS
  -> run the ClearIntent SDK or CLI with scoped references
  -> agent proposes intents without receiving parent-wallet secrets
```

The hosted dashboard should be a stateless interface over wallet-owned authority, decentralized policy/audit records, and user-configured execution providers. It should not custody keys or become the canonical policy database.

The agent-facing runtime should receive only scoped configuration: ENS identity, 0G policy/audit pointers, KeeperHub executor settings, allowed action parameters, and scoped agent-wallet/session-key identifiers where implemented. Users should not provide an LLM agent with a seed phrase, parent private key, unrestricted hot-wallet key, or raw secret stored in an agent-readable workspace.

## Repository map

```text
AGENTS.md                         operating rules for humans and coding agents
REPO_PROFILE.json                 machine-readable repo taxonomy, commands, and scaffold rules
docs/architecture/ARCHITECTURE.md                   top-level system design
docs/architecture/REPO_BOUNDARIES.md                layer ownership and authority boundaries
ROADMAP.md                        high-visibility roadmap index
DECISIONS.md                      high-visibility decision index
CHANGELOG.md                      chronological repo changes
CONTRIBUTING.md                   contributor expectations
AI_USAGE.md                       AI tooling disclosure log
.claude/                          Claude-specific bootstrap pointers
skills/                           repo-local scaffold skill templates

docs/
  README.md                       documentation index
  agents/                         agent start guide and onboarding routing
  repo-truth/                     durable truth, methodology, boundaries, source materials
  governance/                     audits, multi-agent workflow, worktrees, quality standards
  hackathon/                      objectives, rules, vendor tracks, submission plan
  architecture/                   technical architecture references
  decisions/                      dated decision logs
  roadmaps/                       roadmap detail, current state, and feature packages
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

packages/
  core/                           executable authority primitives
  center-cli/                     local human/JSON operator surface
  ens-identity/                   Phase 3A local ENS identity scaffold
  keeperhub-adapter/              Phase 4A local KeeperHub execution scaffold
  zerog-memory/                   Phase 2A local 0G memory/audit scaffold

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

Before a phase closeout, these commands should pass locally. Live provider claims still require phase-specific live evidence; local scaffold tests are not live ENS, 0G, KeeperHub, or signer proof.

## Repo-local skills

ClearIntent keeps reusable agent guidance in root `skills/`. These are repo-local scaffold assets, not automatically installed global skills.

| Skill | Use when |
| --- | --- |
| `repo-orientation` | Orienting a new human or agent to ClearIntent before first action. |
| `repo-doc-router` | Adding, moving, indexing, or reorganizing docs, templates, skills, roadmap files, decisions, or repo taxonomy. |
| `roadmap-phase-planner` | Turning a roadmap feature or phase into an executable implementation plan. |
| `agent-assignment-writer` | Preparing bounded human or agent workstream assignments, fresh-session handoffs, or parallel-agent prompts. |
| `feature-implementation-runner` | Executing an approved phase plan or feature implementation. |
| `contract-steward` | Changing contracts, schemas, lifecycle gates, examples, validation, or fail-closed authority rules. |
| `contract-fixture-author` | Adding or updating contract schemas, valid fixtures, invalid fixtures, and contract tests. |
| `core-enforcement` | Implementing `packages/core` enforcement logic against canonical contracts. |
| `adapter-scaffold` | Creating or reviewing ENS, 0G, KeeperHub, signer, OpenCleaw, or x402 adapters. |
| `phase-closeout-audit` | Closing a roadmap phase, scaffold pass, or governance task with verification evidence. |
| `pre-commit-quality-gate` | Checking commit, push, handoff, or merge readiness after changes. |
| `hackathon-submission-auditor` | Checking hackathon submission readiness, vendor eligibility, demo claims, feedback files, and disclosure requirements. |

See `skills/README.md` for the skill directory and maintenance rules.

## Start here

Read in this order:

1. `AGENTS.md`
2. `REPO_PROFILE.json`
3. `docs/agents/START_HERE.md`
4. `docs/README.md`
5. `docs/repo-truth/THC_METHODOLOGY.md`
6. `docs/repo-truth/THC_IN_THIS_REPO.md`
7. `docs/architecture/ARCHITECTURE.md`
8. `docs/architecture/REPO_BOUNDARIES.md`
9. `ROADMAP.md`
10. `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
11. `DECISIONS.md`
12. `docs/hackathon/README.md`
13. `docs/hackathon/vendor-tracks.md`
14. `docs/hackathon/rules.md`

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

ClearIntent should stay vendor-neutral. Ledger hardware, Trezor, Tangem, MetaMask, WalletConnect, Rainbow, ENS, 0G, KeeperHub, ERC-7730, EIP-712, ERC-8004, ERC-7857, and x402 are integrations or standards, not the product identity.

## Status

Local contract/core, Center CLI, 0G memory, ENS identity, and KeeperHub execution scaffolds are complete through Phase 4A. Live 0G, ENS, KeeperHub/onchain, signer, Guardian Agent, dashboard, and deployment claims remain gated on future phases and live evidence.
