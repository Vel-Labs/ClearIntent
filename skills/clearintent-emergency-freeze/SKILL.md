---
name: clearintent-emergency-freeze
description: Use when intent evidence mismatches, wallet compromise is suspected, webhook spoofing is possible, policy is wrong, execution behaves unexpectedly, or an operator needs a fail-closed pause path.
---

# ClearIntent Emergency Freeze

Use this skill when ClearIntent should stop execution and preserve evidence.

## Immediate Actions

1. Stop new intent submission.
2. Stop executor or KeeperHub execution where possible.
3. Preserve current dashboard, CLI, KeeperHub, wallet, ENS, 0G, and audit evidence.
4. Mark affected setup as frozen/degraded in operator-facing summaries.
5. Escalate to parent-wallet human review.

## Freeze Triggers

- intent hash mismatch
- policy hash mismatch
- unknown executor
- unexpected transaction hash
- missing audit write after execution
- suspected wallet compromise
- suspected webhook spoofing
- KeeperHub run differs from submitted intent
- agent tries to bypass ClearIntent
- user reports unexpected execution

## Evidence To Preserve

- parent wallet
- agent account
- agent ENS name
- policy URI and hash
- audit latest URI
- intent payload and hash
- evaluation result
- KeeperHub workflow/run/logs
- transaction hash and receipt, if any
- notification delivery evidence
- exact freeze reason

## Stop Conditions

Do not resume execution until:

- human review identifies the freeze cause
- policy and intent hashes reconcile
- executor route is verified
- audit evidence is updated or explicitly marked degraded
- operator explicitly unfreezes the setup
