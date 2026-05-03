---
name: clearintent-executor-gate
description: Use when routing an approved ClearIntent intent into KeeperHub or another execution adapter without letting the agent bypass policy verification.
---

# ClearIntent Executor Gate

Use this skill when an agent is ready to move from an intent draft to an execution provider.

## Required Sequence

```bash
clearintent agent context
clearintent intent create --template safe-test-transfer
clearintent intent evaluate
clearintent intent submit
clearintent intent execute
```

The final command is intentionally fail-closed unless a real executor adapter has recorded the needed evidence.

## KeeperHub Boundary

KeeperHub is an execution workflow, not parent-wallet approval by itself. A KeeperHub run can prove workflow handling only when run ID, status, and logs are recorded. Onchain execution needs transaction evidence.

## Evidence To Preserve

- intent hash
- policy hash
- agent ENS
- parent wallet
- agent account
- KeeperHub workflow ID
- KeeperHub run ID
- transaction hash, if any
- audit URI
- webhook delivery result, if any

## Stop Conditions

Stop if:

- `intent evaluate` returns blocked
- `intent submit` returns missing approved evaluation
- executor address/workflow is unknown
- transaction evidence is required but absent
- the request asks for direct wallet execution outside the configured adapter
