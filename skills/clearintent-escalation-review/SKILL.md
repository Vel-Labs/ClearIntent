---
name: clearintent-escalation-review
description: Use when a ClearIntent intent fails verification, exceeds policy, needs human review, or must notify a user without treating notification as approval.
---

# ClearIntent Escalation Review

Use this skill when policy evaluation blocks or degrades an intent.

## Review Boundary

Webhook, Discord, Telegram, and email events are notifications. They are not authority approval unless the approval path is explicitly signed or otherwise recorded as a ClearIntent review checkpoint.

## Required Failure Summary

Report:

- `eventType`
- `status`
- `error`
- `severity`
- `shouldExecute`
- `agentEnsName`
- `parentWallet`
- `agentAccount`
- `intentHash`
- `policyHash`
- `verificationPolicyHash`, when available
- `transactionHash`, if any

## Command Path

```bash
clearintent intent evaluate
clearintent keeperhub live-run-status
```

## Stop Conditions

Stop and wait for human review if:

- verification status is not `verified`
- intent hash mismatches
- policy hash mismatches
- value, gas, destination, or action type exceeds policy
- a transaction was submitted without a matching ClearIntent payload
- a notification failed and the policy requires notification before execution
