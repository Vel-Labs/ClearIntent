---
name: clearintent-provider-evidence-refresh
description: Use before displaying configured, ready, verified, or complete status in dashboard, CLI, handoff, or audit surfaces that depend on ENS, 0G, KeeperHub, signer, wallet, or payload evidence.
---

# ClearIntent Provider Evidence Refresh

Use this skill before any surface claims that a ClearIntent setup is configured, ready, verified, or complete.

## Refresh Checklist

- Confirm parent wallet connection or imported parent-wallet reference.
- Resolve agent ENS address and ClearIntent text records.
- Confirm required records: `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, `clearintent.version`.
- Load or verify 0G policy and audit artifacts when available.
- Compare the resolved policy hash with the expected policy hash.
- Check KeeperHub workflow, executor, run, or route status.
- Check signer/wallet request evidence without claiming wallet-rendered preview unless proven.
- Check canonical payload shape and intent hash when an intent is involved.

## State Labels

Use explicit labels:

- `present`
- `missing`
- `degraded`
- `demo`
- `reported-only`
- `browser-local`
- `provider-verified`

## Required Summary

Report what is established, what is missing, and what cannot be claimed yet.

Do not collapse partially verified evidence into a generic success state.

## Stop Conditions

Stop before showing `ready` or `complete` if:

- policy hash cannot be verified
- ENS identity is missing or mismatched
- 0G audit latest is missing for privileged execution
- KeeperHub evidence is only reported but displayed as verified
- browser-local cache is the only source for an authority claim
- signer display evidence is overstated
