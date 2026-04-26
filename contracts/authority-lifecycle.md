# Authority Lifecycle Contract

This file defines the required ClearIntent authority lifecycle.

Every adapter, demo, and core implementation must preserve these gates unless this contract is deliberately revised.

## Lifecycle states

```text
proposed
  -> policy_checked
  -> reviewed
  -> human_approved
  -> signed
  -> verified
  -> submitted
  -> executed
  -> audited
```

## State meanings

| State | Meaning | Blocking evidence |
| --- | --- | --- |
| `proposed` | An agent proposed an action. It is not authorized. | Agent proposal and action draft. |
| `policy_checked` | A policy was loaded and matched by hash. | Policy URI and policy hash. |
| `reviewed` | A risk report was produced. | `RiskReport` with decision and reasons. |
| `human_approved` | A human explicitly approved the exact intent hash. | `HumanReviewCheckpoint`. |
| `signed` | A signer produced a signature over the bounded payload. | Signature and signer status. |
| `verified` | Signature, nonce, deadline, executor, policy hash, and bounds passed verification. | Verification result. |
| `submitted` | A verified intent was handed to an executor. | Executor submission ID or workflow ID. |
| `executed` | Executor returned terminal execution evidence. | `ExecutionReceipt`. |
| `audited` | Evidence was bundled for replay or inspection. | `AuditBundle`. |

## Required fail-closed behavior

ClearIntent must block privileged execution when any of these are missing or mismatched:

- ENS identity for privileged flows
- policy URI
- policy hash
- nonce
- deadline
- approved executor
- approved signer
- human review checkpoint
- signature
- matching intent hash
- verification result

Missing audit write creates a degraded state and must be visible. It must not be silently treated as success.

## Human intervention checkpoint

Human review is a first-class lifecycle state.

The checkpoint must include:

- review ID
- reviewer identifier
- decision
- timestamp
- reviewed intent hash
- policy hash
- visible summary
- display warnings

Allowed decisions:

- `approved`
- `rejected`
- `needs_changes`

Only `approved` can advance to signing.

## Provider boundaries

- ENS resolves identity and policy/audit pointers.
- 0G stores policy, risk, intent, receipt, and audit artifacts.
- Signer adapters produce signatures and display-status evidence.
- KeeperHub submits and monitors execution only after verification.

None of these providers own the authority lifecycle. They implement specific boundaries around it.
