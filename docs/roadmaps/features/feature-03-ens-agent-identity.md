# Feature 03: ENS Agent Identity

## Purpose

Make ENS the canonical identity and discovery layer for ClearIntent agents.

## Dependencies

- Feature 01 policy and intent fields
- Feature 02 artifact URI conventions if using 0G pointers

## Goals

- resolve agent ENS name
- read address and text records
- load agent card URI
- load policy URI and hash
- load audit pointer
- support subname role-gate proof if feasible

## Non-goals

- full marketplace
- complex rotating resolver infrastructure
- production identity registry migration

## Subphases

### 3.1 Agent card schema

Define fields for agent name, capabilities, policy, audit, and version.

### 3.2 Resolver adapter

Implement ENS lookup interface.

### 3.3 Text record mapping

Support records such as `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, `clearintent.version`.

### 3.4 Fixture and test records

Add local/mock ENS fixtures for deterministic tests.

### 3.5 Midpoint audit

Audit target: identity-critical fields are not hard-coded.

### 3.6 Subname role proof

Add optional roles such as `executor`, `auditor`, `signer`, or `session`.

### 3.7 Intent binding

Bind ENS-derived policy hash or identity fields into the intent.

### 3.8 Docs and demo prep

Document how ENS improves identity, discoverability, and access control.

### 3.9 Closeout audit

Audit target: ENS is materially used in the execution lifecycle.

## Success criteria

- demo resolves agent identity through ENS or mock-to-live path
- policy or audit pointer is resolved rather than hard-coded
- creative ENS use is documented
