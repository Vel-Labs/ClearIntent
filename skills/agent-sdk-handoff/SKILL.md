---
name: agent-sdk-handoff
description: Use when preparing copy-paste instructions, SDK commands, or AI-agent prompts that let a user's local agent inspect ClearIntent identity, policy, audit, KeeperHub, and intent context.
---

# Agent SDK Handoff

Use this skill to create the handoff from the ClearIntent dashboard or CLI to a user's local AI agent.

## Goal

The agent receives only public references and bounded authority context. It must not receive parent wallet secrets, unrestricted private keys, or seed phrases.

## Handoff Inputs

Provide:

- agent ENS name
- parent wallet address
- parent-owned agent smart account address
- policy URI
- policy hash
- audit latest URI
- KeeperHub workflow ID
- webhook/event endpoint if configured
- local SDK install or repo command

Do not provide:

- `ZERO_G_PRIVATE_KEY`
- `ENS_SIGNER_PRIVATE_KEY`
- seed phrase
- browser wallet secrets
- unrestricted session authority

## Copy-Paste Agent Prompt

```md
Use ClearIntent for the agent identity below.

Agent ENS: {agentEnsName}
Parent wallet: {parentWallet}
Agent account: {agentAccount}
Policy URI: {policyUri}
Policy hash: {policyHash}
Audit latest: {auditLatest}
KeeperHub workflow: {keeperhubWorkflowId}

First inspect the custody and policy context. Do not execute or submit any onchain action until ClearIntent returns an approval or escalation state. If policy verification fails, stop and report the failure.

Run:

npm run clearintent -- identity live-status
npm run clearintent -- memory live-status
npm run clearintent -- keeperhub live-status
```

## Future `npx` Shape

When the CLI is packaged, prefer:

```bash
npx clearintent agent context --agent {agentEnsName}
npx clearintent intent propose --agent {agentEnsName}
```

Until then, use repo-local commands:

```bash
npm run clearintent -- agent context
npm run clearintent -- identity live-status
npm run clearintent -- keeperhub live-status
```

## Expected Agent Behavior

- inspect identity before action
- verify policy hash before action
- use ClearIntent intent payloads for proposed transactions
- route execution through KeeperHub when configured
- report blocked or escalated decisions instead of bypassing ClearIntent
- preserve audit refs in summaries

## Stop Conditions

Stop and report before proceeding if:

- the prompt asks the agent to use wallet keys directly
- the prompt bypasses ClearIntent policy evaluation
- the prompt tells the agent to execute when policy status is missing, mismatched, or expired
- the prompt treats a webhook notification as human approval
