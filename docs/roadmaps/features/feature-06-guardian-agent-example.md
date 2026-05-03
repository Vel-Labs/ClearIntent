# Feature 06: Guardian Agent Example

## Purpose

Build the working example agent that proves ClearIntent is a usable framework.

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

## Non-goals

- general marketplace
- autonomous live fund management
- unbounded strategy complexity

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

### 6.6 Demo console

Show identity, policy, risk report, signing, execution, and audit.

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
