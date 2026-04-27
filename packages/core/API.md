# ClearIntent Core API

This document defines the current callable API for `packages/core`.

It is not an HTTP API. There are no ambiguous `GET` or `POST` routes in this layer. Future CLI commands, webhooks, local services, adapters, and demos should call these TypeScript primitives or wrap them with their own transport-specific contract.

## API rule

`packages/core` consumes canonical truth from `contracts/`. If a future surface exposes HTTP, JSON-RPC, CLI, MCP, webhook, or GUI behavior, that surface must preserve these core semantics instead of inventing new authority rules.

## Public modules

Import from:

```ts
import {
  advanceIntentLifecycle,
  assertLifecycleAdvance,
  createContractValidator,
  deriveCoreStateSnapshot,
  hashAction,
  hashIntentPayload,
  hashPolicy,
  inspectLifecycle,
  stableStringify,
  verifyAuthority
} from "./packages/core/src";
```

## Contract Validation

### `createContractValidator(options?)`

Loads JSON schemas from `contracts/schemas/` and returns a validator for known contract families.

Purpose:

- prove a payload matches canonical contract schema
- keep adapters and CLI modules from validating against private copies
- return structured failures instead of throwing for ordinary schema mismatch

Input:

```ts
{
  contractsDir?: string
}
```

Usage:

```ts
const validator = await createContractValidator();
const result = validator.validateContract("AgentIntent", payload);
```

Result:

```ts
CoreResult<unknown>
```

Known contract kinds:

- `AgentIntent`
- `AgentPolicy`
- `RiskReport`
- `HumanReviewCheckpoint`
- `ExecutionReceipt`
- `AuditBundle`

## Lifecycle

### `assertLifecycleAdvance(from, to)`

Checks whether one lifecycle state may advance directly to the next state.

Allowed sequence:

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

This function only checks transition order. It does not inspect evidence.

### `inspectLifecycle(intent, evidence?)`

Returns the current lifecycle status for an intent and tells callers what evidence is missing for the next state.

Purpose:

- power future CLI status output
- tell agents what evidence they must provide next
- prevent hidden lifecycle jumps

Result shape:

```ts
{
  currentState: LifecycleState;
  nextState?: LifecycleState;
  canAdvance: boolean;
  missingEvidence: LifecycleEvidenceKey[];
  blockingIssues: ResultIssue[];
}
```

Evidence keys:

- `policy`
- `risk_report`
- `human_review`
- `signature`
- `verification`
- `submission_receipt`
- `execution_receipt`
- `audit_bundle`

### `advanceIntentLifecycle(intent, evidence?)`

Returns a copied intent with the next lifecycle state when required evidence is present and bound to the intent. It advances only one state per call.

This is the function future CLI wrappers should use before presenting an updated lifecycle state to a human or agent.

## State Snapshot API

The state snapshot API turns intent lifecycle plus available evidence into one machine-readable object future Center CLI, webhook, adapter, and demo layers can render.

The state API must remain callable TypeScript. It must not define HTTP `GET`/`POST`, JSON-RPC, MCP, webhook, CLI, or GUI transport behavior.

### `deriveCoreStateSnapshot(input)`

Derives the current lifecycle state, evidence summary, missing evidence, blocking issues, next action, and degraded signals for an intent.

Input:

```ts
{
  intent: AgentIntent;
  evidence?: LifecycleEvidence;
}
```

Result:

```ts
type CoreStateSnapshot = {
  intentId: string;
  currentState: LifecycleState;
  nextState?: LifecycleState;
  canAdvance: boolean;
  executionBlocked: boolean;
  evidence: CoreStateEvidenceSummary;
  missingEvidence: LifecycleEvidenceKey[];
  blockingIssues: ResultIssue[];
  nextAction?: CoreNextAction;
  degradedSignals: string[];
};

type CoreStateEvidenceSummary = {
  policy: "present" | "missing" | "mismatched";
  riskReport: "present" | "missing" | "mismatched" | "blocked";
  humanReview: "approved" | "missing" | "rejected" | "needs_changes" | "mismatched";
  signature: "present" | "missing" | "mismatched";
  verification: "present" | "missing" | "mismatched";
  executionReceipt: "present" | "missing" | "submitted" | "executed" | "failed" | "degraded" | "mismatched";
  auditBundle: "present" | "missing" | "audited" | "blocked" | "degraded" | "mismatched";
};

type CoreNextAction = {
  code: string;
  label: string;
  requiredEvidence: LifecycleEvidenceKey[];
};
```

Behavior:

- reports `executionBlocked: true` until the intent has reached `verified`, unless terminal evidence shows clean completion
- reports mismatched evidence through stable `blockingIssues` codes
- keeps degraded execution and audit reasons visible in `degradedSignals`
- returns a structured `nextAction` such as `load_policy`, `request_human_review`, `verify_authority`, `submit_execution`, or `write_audit_bundle`
- treats `audited` as terminal with no next action

This is the preferred core API for future CLI status rendering. CLI code should render this snapshot rather than re-deriving lifecycle rules.

## Hashing

### `stableStringify(value)`

Serializes objects with stable key ordering so hash inputs are deterministic.

### `hashAction(action)`

Returns a deterministic `0x`-prefixed SHA-256 hash for action payloads.

### `hashIntentPayload(intentPayload)`

Returns a deterministic `0x`-prefixed SHA-256 hash for intent payload material.

### `hashPolicy(policy)`

Returns a deterministic `0x`-prefixed SHA-256 hash for policy payload material.

Current note: these helpers are local deterministic hashes for fixture and core enforcement work. Future EIP-712 signing work must define the typed-data digest separately and document that boundary.

## Authority Verification

### `verifyAuthority(input)`

Fail-closed verifier for the authority evidence needed before privileged execution.

Input:

```ts
{
  intent: AgentIntent;
  policy: AgentPolicy;
  riskReport?: RiskReport;
  humanReview?: HumanReviewCheckpoint;
  signature?: SignatureEvidence;
  now?: Date | string;
}
```

Checks:

- intent policy hash matches loaded policy hash
- ENS identity and controller match the policy subject
- action type is allowed
- executor is allowed
- signer is allowed
- value limit does not exceed policy maximum
- nonce is a valid unsigned integer
- deadline has not expired
- deadline is after `createdAt`
- deadline does not exceed the policy `deadlineSeconds` window
- intent has reached at least `human_approved`
- required risk report exists and binds intent and policy hashes
- risk decision and severity do not violate policy
- human review exists, is approved, and binds the exact intent hash
- signature exists and signer matches the intent signer

Successful result:

```ts
{
  status: "verified";
  intentHash: string;
  policyHash: string;
}
```

Failure result:

```ts
{
  ok: false;
  issues: ResultIssue[];
}
```

## Result Types

Core APIs use `CoreResult<T>` for ordinary authority decisions.

```ts
type CoreResult<T> =
  | { ok: true; value: T; issues: [] }
  | { ok: false; issues: ResultIssue[] };
```

`ResultIssue` includes:

```ts
{
  code: string;
  message: string;
  path?: string;
}
```

Callers should treat `ok: false` as blocking unless a later contract explicitly marks a degraded state as acceptable.

## Transport Boundary

Do not describe these functions as `GET`, `POST`, or REST routes.

When a future layer adds transport behavior, document it separately:

- CLI commands belong in the future Center CLI contract.
- Webhook events belong in a notification/webhook contract.
- Local OS notifications belong in a notification adapter contract.
- HTTP APIs, if any, must map route behavior back to this core API and name the core function they wrap.
