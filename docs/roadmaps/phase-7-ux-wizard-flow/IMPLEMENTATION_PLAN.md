# Phase 7 UX Setup Wizard Implementation Plan

## Purpose

Build the guided operator setup flow after Phase 6 proves the authority dashboard and wallet validator.

Phase 7 turns validated authority evidence into an operator-friendly workflow. It should help a user configure ClearIntent without requiring repo knowledge, unsafe secrets, or manual stitching across wallet, ENS, 0G, KeeperHub, SDK, and agent handoff surfaces.

## Dependencies

- Phase 6 authority dashboard and wallet validator
- Phase 5C software-wallet evidence path
- Phase 4B KeeperHub claim boundary closed or explicitly labeled workflow-only
- Completed 0G and ENS evidence surfaces

## Goals

- Add a guided setup wizard with clear step status.
- Connect parent wallet.
- Create or select a parent-owned agent wallet or smart account where implemented.
- Configure policy parameters using canonical contract shapes.
- Publish or update 0G policy/card/audit refs through approved adapter/operator paths.
- Bind ENS records through wallet-signed or operator-confirmed flows.
- Configure KeeperHub workflow/executor references.
- Configure webhook/escalation references.
- Generate SDK/CLI install and agent intro prompt with scoped references only.
- Run or simulate a test intent and display ready/degraded/demo state honestly.

## Non-goals

- Redefining policy, risk, receipt, or audit semantics in the frontend.
- Requesting seed phrases, parent private keys, or unrestricted hot-wallet keys.
- Hidden writes or silent admin actions.
- Full Guardian Agent planner/critic/executor autonomy unless a later demo phase implements it.
- Stretch standards or monetization surfaces.

## Required write-mode map

Before implementation, classify each wizard step:

- `live-read`: reads provider/configured state only.
- `wallet-signed-action`: requires interactive wallet approval.
- `operator-external`: requires operator configuration outside the app.
- `disabled`: visible but unavailable in the current environment.
- `deferred`: out of Phase 7 scope.

## Milestone cadence

### 7.1 Wizard scope and state map

Define wizard steps, write modes, stop conditions, and ready/degraded state vocabulary.

### 7.2 Agent account setup path

Create or select a parent-owned agent wallet or smart account where implemented. Missing Account Kit/session-key capability must show planned or degraded state.

### 7.3 Policy configuration UX

Map UI controls to canonical `AgentPolicy` fields. Policy changes must create canonical artifacts, not frontend-only state.

### 7.4 ENS and 0G binding UX

Publish/update artifacts and records only through approved adapter, wallet-signed, or operator-confirmed paths.

### 7.5 Midpoint audit

Audit target: the wizard does not request secrets, does not perform hidden writes, and does not mark setup ready without evidence.

### 7.6 KeeperHub and escalation setup

Configure workflow/executor references and escalation routes while preserving the rule that KeeperHub executes after ClearIntent verification.

### 7.7 SDK/CLI and agent handoff

Generate a handoff containing references only: repo link, SDK/CLI command, agent ENS identity, policy URI/hash, audit pointer, KeeperHub route, webhook/escalation route, allowed/forbidden action summary, and instruction to stop on ClearIntent block.

### 7.8 Test intent and ready state

Run or simulate a test intent through the validated authority path. Ready state must distinguish live, degraded, demo, and deferred evidence.

### 7.9 Closeout audit

Audit target: a normal operator can complete the guided setup flow without relying on hidden repo knowledge or unverifiable authority claims.

## Deferred scope

- Full Guardian Agent planner/critic/executor implementation.
- Marketplace or hosted agent catalog.
- x402, iNFT, zk, ERC-8004, and other stretch standards.
