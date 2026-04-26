# Intent Lifecycle

## 1. User goal

A human gives the agent a goal.

Example:

```text
Prepare a safe onchain action under my current Guardian policy.
```

## 2. Identity resolution

The agent identity is resolved through ENS.

Expected outputs:

- agent address or controller
- agent card URI
- policy URI
- policy hash
- audit URI
- role/subname data if enabled

## 3. Policy load

The policy is loaded from its resolved source, preferably 0G.

Policy should define:

- allowed action types
- allowed targets
- max spend or value bounds
- signer requirements
- executor requirements
- risk review requirements
- deadline rules

## 4. Proposal

The agent proposes an action. At this stage, the action is not authorized.

## 5. Risk review

A critic checks the proposal against policy and common failure modes.

## 6. Intent creation

The framework creates a typed intent with:

- signer
- agent identity
- policy hash
- action hash
- executor
- nonce
- deadline
- chain ID
- verifying contract

## 7. Human-readable approval

The user sees a clear preview. If a hardware signer is used, display limitations or blind-signing fallback must be visible.

## 8. Signature

The signer signs the bounded intent.

## 9. Verification

The verifier checks signature, nonce, deadline, policy hash, executor, and action bounds.

## 10. Execution

KeeperHub or another executor submits the verified action.

## 11. Audit

The result is written to an audit artifact.

Expected audit bundle:

- prompt
- resolved identity
- policy
- risk report
- typed intent
- signature
- execution receipt
- final status
