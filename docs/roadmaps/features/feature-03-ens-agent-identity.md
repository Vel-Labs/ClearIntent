# Feature 03: ENS Agent Identity

## Purpose

Make ENS the canonical identity and discovery layer for ClearIntent agents.

## Dependencies

- Feature 01 policy and intent fields
- Feature 02 artifact URI conventions if using 0G pointers
- Phase 2B closeout evidence before live ENS records claim live 0G-backed policy or audit artifacts

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

Phase 3 is intentionally split so local ENS shape can move now while live records wait for funded testnet evidence:

- **Phase 3A: ENS Agent Identity Local Scaffold** defines the full local/mock shape and tests it deterministically. Status: complete locally at `ens-local-fixture` claim level.
- **Phase 3B: Live ENS Binding** reads live ENS/testnet records and binds ENS-derived identity or policy evidence after Phase 2B proves live 0G Storage persistence.

Implementation plan: `../phase-3-ens-agent-identity/IMPLEMENTATION_PLAN.md`

## Phase 3A: ENS Agent Identity Local Scaffold

### 3.1 Agent card schema

Define fields for agent name, capabilities, policy, audit, and version.

### 3.2 Resolver adapter

Implement ENS lookup interface.

### 3.3 Text record mapping

Support records such as `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, `clearintent.version`.

### 3.4 Fixture and test records

Add local/mock ENS fixtures for deterministic tests.

### 3.5 Midpoint audit

Audit target: identity-critical fields are not hard-coded and live ENS/0G claims are not made from local fixtures.

### 3.6 Degraded states

Report missing name, missing resolver, missing record, unsupported network, policy hash mismatch, and unavailable live lookup as explicit degraded or blocked states.

### 3.7 Center CLI status or deferred gap

Add a thin identity module/status readout if it fits the existing Center CLI shape. If not, document the CLI wizard gap in the audit and keep 3A package-only.

### 3.8 Docs and hardening

Document local fixture semantics, record names, claim level, and 3B live-binding prerequisites.

### 3.9 Closeout audit

Audit target: local ENS fixture resolution, policy pointer/hash extraction, audit pointer extraction, tests, claim boundaries, and remaining 3B gates.

Status: complete. Midpoint audit: `../../audits/phase-3-ens-agent-identity/3a.5-midpoint-audit.md`. Closeout audit: `../../audits/phase-3-ens-agent-identity/3a.9-closeout-audit.md`.

## Phase 3B: Live ENS Binding

Status: complete at `ens-live-bound`. Closeout audit: `../../audits/phase-3-ens-agent-identity/3b.9-closeout-audit.md`.

Validated evidence:

- ENS name: `guardian.agent.clearintent.eth`
- Resolved address: `0x00DAfA45939d6Ff57E134499DB2a5AE28cc25ad7`
- ENS transaction: `0x1dce685d1af441208b5ae22f890cbf3e7ed38b2865c04701c874e1f40d5f861b`
- ENS block: `25005501`
- Claim level: `ens-live-bound`
- Live 0G claim: `bound`
- Required records: `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, `clearintent.version`

Network posture:

- Run live/testnet record reads first against the selected ENS-compatible test environment.
- Prefer a livenet/mainnet follow-up after testnet record read and policy/audit pointer binding succeed.
- Do not claim livenet/mainnet ENS-bound identity from testnet records.

### 3B.1 Live resolver configuration

Use config-driven ENS name/resolver/network values. Do not hard-code demo names, wallet addresses, policy hashes, audit URIs, or 0G artifact refs.

### 3B.2 Live address and text-record read

Read address and text records through the Phase 3A resolver interface.

### 3B.3 Live record evidence

Capture which records were read without committing secrets or mutable live logs.

### 3B.4 Intent binding

Bind ENS-derived policy hash or identity fields into the intent when compatible with `contracts/` and `packages/core/`.

### 3B.5 Midpoint audit

Audit target: live-record claim boundaries, 0G pointer truth, and no hard-coded identity-critical values.

### 3B.6 Optional subname role proof

Add optional roles such as `executor`, `auditor`, `signer`, or `session` if feasible without destabilizing the demo.

### 3B.7 Center CLI live readout

Show local fixture, live lookup, degraded lookup, and verified binding states distinctly in human-readable and JSON modes if identity commands are added.

### 3B.8 Docs and demo prep

Document how ENS improves identity, discoverability, and access control, including which claims are live and which remain mocked.

### 3B.9 Closeout audit

Audit target: ENS is materially used in the execution lifecycle.

## Success criteria

- 3A resolves agent identity through local/mock ENS fixtures without hard-coded identity-critical values
- 3B resolves agent identity through live ENS/testnet records or records an explicit degraded live lookup state
- policy or audit pointer is resolved rather than hard-coded
- creative ENS use is documented
- live 0G-backed ENS records are not claimed until Phase 2B upload/readback/hash evidence exists
