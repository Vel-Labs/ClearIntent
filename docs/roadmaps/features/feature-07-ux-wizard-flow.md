# Feature 07: UX Setup Wizard and Operator Flow

## Purpose

Turn the validated Phase 6 authority dashboard into a guided operator setup flow.

Phase 7 is the UX and wizard layer. It should help a normal operator connect a parent wallet, prepare or select an agent account, configure policy and escalation, bind discoverable references, configure execution routing, and hand scoped context to the SDK/CLI or an agent runtime. It should build on Phase 6 wallet and evidence validation instead of mixing setup/admin behavior into the validator phase.

## Dependencies

- Feature 06 authority dashboard and wallet validator
- Phase 5C software-wallet validation evidence
- Phase 4B KeeperHub claim boundary closed or explicitly labeled as workflow-only evidence
- 0G and ENS evidence already available through configured/provider state

## Goals

- Guided setup wizard with explicit step status.
- Parent-owned agent wallet or smart-account setup UX where implemented.
- Policy parameter UX that creates canonical policy artifacts through approved adapters.
- ENS binding flow for `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, and `clearintent.version`.
- 0G policy/card/audit publish or update flow where operator credentials and wallet approvals are available.
- KeeperHub workflow/executor configuration flow.
- Webhook/escalation setup flow.
- SDK install, CLI handoff, and agent intro prompt generation with references only, never secrets.
- Test-intent flow and ready-state display.

## Non-goals

- Replacing contracts or adapter packages with frontend-local authority truth.
- Requesting seed phrases, parent private keys, or unrestricted hot-wallet keys.
- Silent setup writes that are not wallet-signed, operator-confirmed, or adapter-backed.
- Claiming smart-account/session-key enforcement before the selected account system is implemented and tested.
- Claiming full Guardian Agent planner/critic/executor autonomy unless a later demo phase implements it.

## Subphases

### 7.1 Wizard scope and write-mode map

Classify each setup step as `live-read`, `wallet-signed-action`, `operator-external`, `disabled`, or `deferred`.

### 7.2 Agent account setup path

Create or select a parent-owned agent wallet or smart account where implemented. Missing Account Kit or session-key setup must show degraded/planned state rather than pretending authority exists.

### 7.3 Policy configuration UX

Let the operator configure policy parameters that map to canonical `AgentPolicy` truth. Do not create frontend-only policy semantics.

### 7.4 ENS and 0G binding UX

Publish or update 0G artifacts and ENS records only through approved adapter/wallet paths. Display planned or operator-external steps when live writes are not enabled.

### 7.5 Midpoint audit

Audit target: the wizard does not request secrets, does not perform hidden writes, and does not mark setup ready unless evidence exists.

### 7.6 KeeperHub and escalation setup

Configure workflow/executor references and webhook/escalation routes. KeeperHub remains an executor after ClearIntent verification, not the policy verifier.

### 7.7 SDK/CLI and agent handoff

Generate install commands and agent instructions with scoped references: repo link, SDK/CLI command, ENS identity, policy URI/hash, audit pointer, KeeperHub reference, webhook/escalation reference, and allowed/forbidden action summary.

### 7.8 Test intent and ready state

Run or simulate a test intent through the validated authority path. The ready state must distinguish live, degraded, demo, and deferred evidence.

### 7.9 Closeout audit

Audit target: a normal operator can complete the guided setup flow without relying on hidden repo knowledge, unsafe secrets, or unverifiable authority claims.

## Downstream routing

A later Guardian Agent demo phase should consume the Phase 7 handoff output and implement planner, critic, executor, and end-to-end user-prompt-to-receipt behavior.
