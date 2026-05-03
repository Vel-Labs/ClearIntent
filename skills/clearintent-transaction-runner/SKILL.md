---
name: clearintent-transaction-runner
description: Use before any AI agent, operator flow, CLI route, wallet path, KeeperHub workflow, or demo attempts to sign, submit, execute, simulate, or trigger an onchain transaction.
---

# ClearIntent Transaction Runner

Use this skill whenever an agent may move from analysis into transaction intent, signing, submission, execution, simulation, or demo-trigger behavior.

## Hard Rule

No transaction path is allowed without a canonical ClearIntent intent and a recorded evaluation result.

The agent must not bypass ClearIntent by calling a wallet, executor, KeeperHub workflow, RPC client, script, contract method, or hosted API directly.

## Required Sequence

Run or verify this sequence before submission:

```bash
npm run clearintent -- agent context
npm run clearintent -- identity live-status
npm run clearintent -- keeperhub live-status
npm run clearintent -- intent create --template safe-test-transfer
npm run clearintent -- intent evaluate
```

Only continue after evaluation is verified:

```bash
npm run clearintent -- intent submit
npm run clearintent -- intent execute
```

Treat execution as fail-closed unless the executor adapter records the required approval and receipt evidence.

## Required Intent Fields

Every transaction intent must carry:

- `agentEnsName`
- `parentWallet`
- `agentAccount`
- `policyUri`
- `policyHash`
- `auditLatest`
- `intentHash`
- `action.actionType`
- `action.target`
- `action.chainId`
- `action.valueLimit`
- human-readable summary

## Required Evidence To Preserve

Record these in the response, audit artifact, or handoff:

- parent wallet
- agent account
- agent ENS name
- policy URI
- policy hash
- audit latest URI
- intent hash
- evaluation status
- human review checkpoint
- signer or wallet request evidence
- KeeperHub workflow ID and run ID, if used
- transaction hash, if actually submitted
- degraded or missing evidence

## Demo And Simulation Rule

Demo intents and simulations still require the same ClearIntent payload shape.

If no real transaction is submitted, say `render-only`, `simulation-only`, or `not submitted` clearly. Do not present demo rendering, webhook delivery, or KeeperHub workflow acceptance as onchain execution.

## Escalation Boundary

Webhook, email, Discord, Telegram, and dashboard notifications are not approvals.

Escalate to human review when:

- evaluation is blocked or degraded
- policy hash mismatches
- intent hash mismatches
- destination, value, chain, gas, or action type exceeds policy
- ENS identity is missing or mismatched
- 0G policy or audit references are missing
- executor or KeeperHub route is unknown
- transaction evidence is required but absent
- wallet display would require blind trust in opaque calldata

## Stop Conditions

Stop before signing, submission, or execution if:

- ClearIntent context is incomplete
- any required intent field is missing
- `intent evaluate` does not return verified/pass
- the user asks to run directly from the wallet or RPC without ClearIntent
- a notification is being treated as approval
- the action cannot be summarized in plain language
- the agent cannot preserve audit evidence
