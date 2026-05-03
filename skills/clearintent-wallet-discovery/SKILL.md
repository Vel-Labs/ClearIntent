---
name: clearintent-wallet-discovery
description: Use when a parent wallet connects, reconnects, imports setup evidence, or needs linked agent accounts, ENS identities, 0G refs, and KeeperHub routes discovered without treating browser cache as authority.
---

# ClearIntent Wallet Discovery

Use this skill when the dashboard, CLI, or agent runtime needs to identify what ClearIntent setups belong to a parent wallet.

## Discovery Order

1. Read the connected parent wallet address.
2. Check browser-local or imported setup indexes for linked agent setups.
3. Resolve ENS identity and ClearIntent text records when an agent ENS name is known.
4. Load 0G policy and audit references from discovered records.
5. Check KeeperHub route or run evidence.
6. Mark each source as `provider-verified`, `imported`, `browser-local`, `demo`, `missing`, or `degraded`.

## Required Output

Report:

- parent wallet
- discovered agent accounts
- discovered ENS names
- `agent.card`
- `policy.uri`
- `policy.hash`
- `audit.latest`
- `clearintent.version`
- KeeperHub workflow/run references
- discovery source for every field
- missing or stale evidence

## Authority Boundary

Browser-local discovery is a resume index only. It can route the user back into the dashboard, but provider receipts, ENS records, signed payloads, and 0G artifacts remain canonical authority evidence.

## Stop Conditions

Stop and report degraded discovery if:

- parent wallet is missing
- discovered agent account does not match the ENS/address evidence
- policy hash is absent or mismatched
- 0G refs are missing
- KeeperHub evidence is missing where execution claims depend on it
- the flow tries to infer ownership from cache alone
