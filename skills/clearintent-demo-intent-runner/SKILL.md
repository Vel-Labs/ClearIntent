---
name: clearintent-demo-intent-runner
description: Use when rendering, simulating, or testing a demo intent, safe transfer, dashboard trigger, wallet prompt, webhook preview, or non-production transaction path.
---

# ClearIntent Demo Intent Runner

Use this skill when a demo or simulation needs to feel real without overstating execution proof.

## Demo Rule

Demo intents still require canonical ClearIntent intent shape and policy context.

Always label the result as one of:

- `render-only`
- `simulation-only`
- `wallet-request-only`
- `submitted`
- `executed`

Only use `submitted` or `executed` when real transaction evidence exists.

## Required Directionality

Show:

- parent wallet
- agent/delegate account
- source address
- destination address
- chain ID
- value or value limit
- policy hash
- human-review requirement

## Required Evidence

For every demo output, preserve:

- intent payload
- intent hash when available
- policy hash
- wallet request evidence, if requested
- KeeperHub run evidence, if used
- transaction hash, only if submitted
- clear statement of what did not happen

## Stop Conditions

Stop before triggering the demo if:

- parent wallet or agent account is ambiguous
- destination address is missing
- policy hash is missing
- the demo could be confused with real execution
- the demo bypasses `intent create` / `intent evaluate`
