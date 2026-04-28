# Feature 06: Guardian Agent Example and Agent Audit Dashboard

## Purpose

Build the working example agent and the narrow Agent Audit dashboard that proves ClearIntent is a usable, inspectable authority framework.

## Dependencies

- Feature 01 core
- Feature 02 0G storage/audit
- Feature 03 ENS identity
- Feature 04 KeeperHub adapter
- Feature 05 signer adapter

## Goals

- planner role
- critic role
- executor role
- shared 0G-backed state
- ENS-resolved agent identity
- signed intent approval
- KeeperHub execution
- audit receipt display
- wallet-gated Next.js audit dashboard
- Reown wallet authentication and human approval entrypoint
- ENS, 0G, Alchemy/onchain, and KeeperHub evidence reconstruction without a traditional database

## Non-goals

- general marketplace
- autonomous live fund management
- unbounded strategy complexity
- generic admin dashboard
- private backend database as the source of authority
- editable policy management in the first dashboard pass

## Subphases

### 6.1 Scenario selection

Pick one clear action flow.

### 6.2 Planner implementation

Convert user goal to proposed action.

### 6.3 Critic implementation

Review against policy and risk rules.

### 6.4 Executor wiring

Submit only signed verified intent.

### 6.5 Midpoint audit

Audit target: the agent cannot bypass ClearIntent.

### 6.6 Agent Audit dashboard

Build a lightweight Next.js dashboard for the clear chain of intent. The dashboard must be wallet-gated through Reown and read authority context from verifiable sources: wallet session, ENS identity records, 0G policy/audit artifacts, onchain authority contract state/events through Alchemy, and KeeperHub receipts. It should show proposed intent, policy check, risk report, human review checkpoint, signature, onchain verification, execution, and audit evidence as a single timeline.

### 6.7 End-to-end test

Run from user prompt to receipt.

### 6.8 Submission docs

Update README, vendor docs, and demo script.

### 6.9 Closeout audit

Audit target: example satisfies 0G working-agent requirement.

## Success criteria

- one working end-to-end demo
- example code included in repo
- coordination among planner, critic, and executor is explainable
- a judge or reviewer can inspect the authority chain in the dashboard without trusting a private ClearIntent database
