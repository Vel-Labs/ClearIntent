---
name: clearintent-operator-export-handoff
description: Use when exporting dashboard, SDK, CLI, or agent handoff context that includes parent wallet, agent account, ENS, 0G, policy, audit, KeeperHub, webhook, or setup references.
---

# ClearIntent Operator Export Handoff

Use this skill when packaging ClearIntent setup context for an operator, agent runtime, SDK, CLI, or fresh session.

## Export Rule

Export public references only. Never include parent private keys, seed phrases, raw wallet credentials, provider secrets, webhook secrets, API tokens, or unredacted `.env` values.

## Required Fields

Include:

- parent wallet
- agent account
- agent ENS name
- `agent.card`
- `policy.uri`
- `policy.hash`
- `audit.latest`
- `clearintent.version`
- KeeperHub workflow/run references
- webhook route or user-bound event route, if public
- source and freshness for each field
- degraded or missing evidence

## Output Shapes

Prefer both:

- human-readable handoff summary
- deterministic JSON object for agent/CLI use

## Stop Conditions

Stop before export if:

- export includes secrets
- policy hash is missing
- parent wallet or agent account is ambiguous
- the export would imply authority proof from browser-local cache alone
- the receiving agent could execute without first running the transaction gate
