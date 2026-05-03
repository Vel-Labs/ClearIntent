---
name: clearintent-policy-change-review
description: Use when changing policy limits, destinations, chains, allowed actions, escalation rules, session authority, executor bindings, or any setting that can expand or alter agent authority.
---

# ClearIntent Policy Change Review

Use this skill whenever a change may alter what an agent is allowed to do.

## Review Scope

Policy-sensitive changes include:

- value limits
- gas limits
- destinations
- chains
- allowed action types
- session-key scope
- expiry/deadline
- escalation thresholds
- notification requirements
- KeeperHub executor/workflow bindings
- audit persistence requirements

## Required Comparison

Before applying a change, compare:

- current policy URI
- current policy hash
- proposed policy URI or payload
- proposed policy hash
- authority expansion or reduction
- affected parent wallet
- affected agent account
- affected ENS identity

## Human Review Rule

Any authority expansion requires an explicit human review checkpoint before it is used for signing or execution.

Signing a transaction is not a substitute for the policy-change review unless the signed payload clearly includes the policy change and review checkpoint.

## Stop Conditions

Stop and escalate if:

- proposed policy hash is missing
- proposed change expands authority silently
- destination, chain, value, or action changes are unclear
- audit update cannot be recorded
- the dashboard or CLI would continue using stale policy evidence
