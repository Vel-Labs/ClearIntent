# Repository Boundaries

## What this repo owns

- ClearIntent authority lifecycle
- Intent, policy, risk report, and receipt schemas
- Framework interfaces and adapters
- Example Guardian Agent
- Hackathon documentation and eligibility evidence
- Governance, audits, and phase planning
- Open-source contribution discipline

## What the core package owns

- typed intent construction
- policy validation interfaces
- authority lifecycle state machine
- adapter contracts
- local deterministic test fixtures

## What ENS adapter owns

- ENS name resolution
- text record lookup
- agent card and policy pointer resolution
- subname or role resolution
- degraded states for missing or inconsistent records

## What 0G adapter owns

- storage writes and reads
- policy, audit, and state persistence
- risk reflection calls if 0G Compute is implemented
- failure/degraded-state reporting

## What signer adapters own

- hardware or wallet connection
- EIP-712 signing
- display metadata status
- user rejection handling
- timeout and device error handling

## What KeeperHub adapter owns

- workflow creation
- execution submission
- execution monitoring
- receipt collection
- feedback documentation for KeeperHub integration

## What agents own

- planning
- tool selection
- proposed action generation
- explanations for why an action is useful

## What agents do not own

- private keys
- hidden execution authority
- policy bypasses
- signer bypasses
- hard-coded privileged values
- final claims about execution success without receipts

## What the demo app owns

- presentation
- interactive walkthrough
- local configuration
- human-readable lifecycle display

## What the demo app does not own

- canonical policy truth
- canonical signature truth
- canonical onchain verification truth
- audit truth

## Fold-in rule

External code, examples, or generated work may enter the repo only when it lands behind a clear boundary:

- `packages/<adapter>/`
- `packages/core/`
- `examples/<example-name>/`
- `docs/repo-truth/source-material/`
- `docs/hackathon/`

Do not recreate a monolith inside the new repo.
