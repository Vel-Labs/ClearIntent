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
- per-transaction intent, policy, verification, receipt, and replay evidence in the dashboard or CLI logs
- wallet-gated Next.js audit dashboard
- Reown wallet authentication and human approval entrypoint
- ENS, 0G, Alchemy/onchain, and KeeperHub evidence reconstruction without a traditional database
- smart alert / conditional human-review gates for fringe or thresholded autonomous actions

## Non-goals

- general marketplace
- autonomous live fund management
- unbounded strategy complexity
- generic admin dashboard
- private backend database as the source of authority
- editable policy management in the first dashboard pass
- silent escalation rules that are not visible in the policy/audit trail

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

Implementation plan: `docs/roadmaps/phase-6-guardian-agent-example/6.6_FRONTEND_DASHBOARD_PLAN.md`

Build a lightweight Next.js dashboard for the clear chain of intent. The dashboard must be wallet-gated through Reown and read authority context from verifiable sources: wallet session, ENS identity records, 0G policy/audit artifacts, onchain authority contract state/events through Alchemy, and KeeperHub receipts. It should show proposed intent, policy check, risk report, human review checkpoint, signature, onchain verification, execution, and audit evidence as a single timeline.

Current implementation direction: use the dark operational dashboard visual direction selected during May 2 planning. Overview is the initial page and should explain value while showing real connected-wallet/provider state; Wizard is the setup path. Alchemy Account Kit is the preferred smart-account path, with parent-owned agent smart account language. Reown remains a possible wallet-connection reference, not a locked implementation requirement for this phase.

If conditional human-review gates are in scope for the final demo, the dashboard should also show why a specific autonomous action was interrupted for review, such as order size, value threshold, new executor, elevated risk, policy mismatch, or degraded audit evidence.

The demo should distinguish two risk-tolerance lanes: default human-in-the-loop mode, where every transaction requires review, and power-user conditional-autonomy mode, where routine actions can proceed inside policy bounds while thresholded actions stop for human approval. Both modes must display the full transaction audit trail and replayable intent evidence.

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
- threshold-triggered human review is visible as policy behavior, not a hidden notification side effect
- both default full-review mode and optional power-user conditional-autonomy mode preserve per-transaction audit/replay evidence
