---
name: clearintent-post-transaction-audit
description: Use after any submitted, attempted, simulated, failed, or executed ClearIntent transaction to reconcile intent, policy, signature, KeeperHub, transaction, and audit evidence.
---

# ClearIntent Post-Transaction Audit

Use this skill after any transaction attempt, including failed, simulated, render-only, wallet-request-only, submitted, or executed flows.

## Audit Checklist

Capture:

- parent wallet
- agent account
- agent ENS name
- policy URI
- policy hash
- audit latest before action
- intent payload
- intent hash
- evaluation result
- human review checkpoint
- wallet/signature evidence
- KeeperHub workflow ID
- KeeperHub run ID and status
- transaction hash, if submitted
- transaction receipt, if available
- audit latest after action
- webhook or notification result

## Reconciliation

Verify:

- intent hash matches submitted/executed payload
- policy hash matches current policy context
- action target, chain, and value match evaluated intent
- signer or executor matches expected route
- audit write was updated or degraded state is explicit

## Result Labels

Use one:

- `render-only`
- `simulation-only`
- `wallet-requested`
- `submitted`
- `executed`
- `failed`
- `blocked`
- `degraded`

## Stop Conditions

Escalate if:

- transaction hash exists without matching intent hash
- policy hash changed between evaluation and execution
- receipt is missing after an execution claim
- audit persistence failed
- KeeperHub status conflicts with transaction status
- notification failure violates policy requirements
