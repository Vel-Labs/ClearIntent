# Code Quality Standards

## Primary rule

Readable code wins.

ClearIntent is a security-adjacent authority system. A clever implementation that future contributors cannot inspect is a liability.

## File size guidance

- Under 300 lines: preferred.
- 300-400 lines: acceptable when cohesive.
- 400-500 lines: justify and consider extraction.
- Over 500 lines: treat as a hotspot requiring extraction or written justification.

This is guidance, not dogma. A schema file, generated file, or intentionally centralized registry may be larger when purpose-driven.

## Comments

Comments should feel human.

Good comments explain:

- why a boundary exists
- what can go wrong
- what is intentionally not supported
- what a future maintainer should not break

Bad comments merely repeat the line below them.

## Naming

Prefer names that reveal authority and state:

- `proposedIntent`
- `verifiedIntent`
- `policyHash`
- `resolvedAgentIdentity`
- `degradedSignerStatus`
- `executionReceipt`

Avoid names that hide authority:

- `data`
- `payload`
- `doIt`
- `magic`
- `handleEverything`

## Interfaces

Interfaces should be narrow:

```ts
resolveAgentIdentity(name): ResolvedAgentIdentity
loadPolicy(pointer): AgentPolicy
createIntent(goal, policy): ProposedIntent
signIntent(intent): SignedIntent
executeIntent(intent, signature): ExecutionReceipt
```

Interfaces that touch authority state must consume the shared contracts in `contracts/`. Do not create adapter-local substitutes for intent, policy, risk, human review, receipt, or audit shapes.

## Error handling

Fail closed when authority is unclear.

- unknown policy: block
- unknown signer: block
- unknown executor: block
- missing receipt: degraded
- signer display uncertainty: warn visibly

## Tests

`tests/` is the shared pre-commit quality gate. A fresh checkout should install dependencies with `npm install` and pass:

```bash
npm run validate:contracts
npm run test:contracts
npm test
npm run typecheck
```

Contract and core tests must consume `contracts/` as source truth. They should not create parallel intent, policy, risk, review, receipt, or audit definitions.

Prefer deterministic tests for:

- intent hash stability
- policy hash stability
- nonce reuse rejection
- deadline expiry
- executor mismatch
- signer mismatch
- missing human review checkpoint
- ENS resolution fallback
- audit artifact shape
