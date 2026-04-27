# Hackathon Objective

## Project

ClearIntent: authority primitives for autonomous agents.

## Core submission thesis

Autonomous agents should be able to reason and coordinate, but they should not receive unchecked authority to move value. ClearIntent gives open agent builders a reusable authority kernel:

```text
ENS identity
  -> 0G policy memory and audit trail
  -> typed agent intent
  -> human-readable approval
  -> wallet or hardware-backed signature
  -> KeeperHub execution
  -> auditable receipt
```

## Target partner prizes

Primary partner selections:

1. 0G
2. ENS
3. KeeperHub

## MVP definition

A successful MVP proves:

- one working example agent built with the framework
- ENS resolves the agent identity and policy/audit metadata
- 0G stores policy, risk, intent, or receipt artifacts
- a bounded EIP-712 intent is created
- a human-readable approval view is shown
- a software wallet, WalletConnect wallet, smart account, or hardware signer adapter signs the intent
- KeeperHub executes or meaningfully orchestrates the approved workflow
- the final result is auditable

## Demo sentence

The agent can propose an action, but it cannot execute beyond the authority the human signed.

## Submission posture

Do not overclaim. Strong hackathon submissions are clear about what works, what is scaffolded, and what is next.
