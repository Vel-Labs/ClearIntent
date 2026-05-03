# KeeperHub Provider Funnel

KeeperHub is the ClearIntent provider for reliable onchain execution after ClearIntent has resolved identity, loaded policy, created a typed intent, reviewed risk, and collected a valid signature.

Current ClearIntent claim level: `keeperhub-live-submitted`. Phase 4B is closed at the workflow-execution proof boundary after Phase 3B reached `ens-live-bound`. The live submit path was accepted by KeeperHub and the corrected run reached terminal workflow status, but transaction/final onchain execution evidence is still absent.

## Read first

1. [KeeperHub docs](https://docs.keeperhub.com/) - workflow model, plugins, API, CLI, wallet management, and AI tools.
2. [KeeperHub website](https://keeperhub.com/) - product positioning and agent-execution framing.
3. [KeeperHub GitHub repository](https://github.com/KeeperHub/keeperhub) - open-source workflow builder codebase and API shape reference.

## ClearIntent fit

| ClearIntent need | KeeperHub surface | Implementation note |
| --- | --- | --- |
| Execute approved intent | Workflows, direct execution, Web3 actions | Adapter should submit only after ClearIntent verification passes. |
| Monitor result | Executions, runs, logs, analytics | Convert run status/logs into ClearIntent execution receipts. |
| Agent tool interface | MCP server, Claude Code plugin, agentic wallets | Useful if Guardian Agent calls KeeperHub through tools rather than direct REST. |
| Programmatic integration | REST API, CLI | Use API/CLI for deterministic adapter tests and demos. |
| Wallet/gas reliability | Gas management, Turnkey/Para wallet docs | Keep wallet trust model visible; do not hide signer/executor custody implications. |

## Current repo evidence

Phase 4A is complete locally through `packages/keeperhub-adapter/` and Center CLI `execution status` / `keeperhub status`. This proves adapter semantics, workflow mapping, local submit/monitor simulation, and canonical receipt conversion only.

Phase 4B closed live path:

- KeeperHub REST API workflow execution
- live workflow lookup and gated submit
- run/status monitoring through `keeperhub live-run-status`
- workflow-level terminal status evidence
- explicit degraded state for missing executor and transaction evidence

The required 0G/ENS prerequisite is ready: `guardian.agent.clearintent.eth` reached `ens-live-bound` and resolves live 0G policy, audit, and agent-card artifacts.

Phase 4B now has an exported KeeperHub workflow artifact at `docs/providers/KeeperHub/clearintent-execution-gate.workflow.json`. The workflow uses a manual trigger so ClearIntent can invoke it programmatically after verification. The cleaned artifact keeps only the active edge `ClearIntent Execution Gate -> Evaluate ClearIntent Gate`. The `Send ClearIntent Event` webhook node remains present, disabled, and disconnected until `https://clearintent.xyz/api/keeperhub/events` is deployed and authenticated for the frontend event-ingest pass.

Phase 6 added the local Next.js route shape at `apps/web/src/app/api/keeperhub/events/route.ts`. The route validates reported KeeperHub event shape and returns deterministic JSON, but it does not yet authenticate tokens/signatures, enforce timestamp/nonce replay checks, or bind source headers to a configured KeeperHub workflow. Events from that route must be displayed as reported/non-authoritative until those checks are implemented and audited.

The route also accepts the ClearIntent workflow payload version used by the disabled `Send ClearIntent Event` block:

```json
{
  "source": "keeperhub",
  "project": "clearintent",
  "schemaVersion": "clearintent.keeperhub-event.v1",
  "eventType": "{{Evaluate ClearIntent Gate.result.eventType}}",
  "status": "{{Evaluate ClearIntent Gate.result.status}}",
  "error": "{{Evaluate ClearIntent Gate.result.error}}",
  "severity": "{{Evaluate ClearIntent Gate.result.severity}}",
  "shouldExecute": "{{Evaluate ClearIntent Gate.result.shouldExecute}}",
  "parentWallet": "{{Evaluate ClearIntent Gate.result.parentWallet}}",
  "agentAccount": "{{Evaluate ClearIntent Gate.result.agentAccount}}",
  "agentEnsName": "{{Evaluate ClearIntent Gate.result.agentEnsName}}",
  "intentHash": "{{Evaluate ClearIntent Gate.result.intentHash}}",
  "verificationIntentHash": "{{Evaluate ClearIntent Gate.result.verificationIntentHash}}",
  "policyHash": "{{Evaluate ClearIntent Gate.result.policyHash}}",
  "verificationPolicyHash": "{{Evaluate ClearIntent Gate.result.verificationPolicyHash}}",
  "auditLatest": "{{Evaluate ClearIntent Gate.result.auditLatest}}",
  "actionType": "{{Evaluate ClearIntent Gate.result.actionType}}",
  "target": "{{Evaluate ClearIntent Gate.result.target}}",
  "chainId": "{{Evaluate ClearIntent Gate.result.chainId}}",
  "valueLimit": "{{Evaluate ClearIntent Gate.result.valueLimit}}",
  "executor": "{{Evaluate ClearIntent Gate.result.executor}}",
  "signer": "{{Evaluate ClearIntent Gate.result.signer}}",
  "transactionHash": "{{Evaluate ClearIntent Gate.result.transactionHash}}"
}
```

The ingest route rejects unresolved `{{...}}` template values and returns an isolation key derived first from `agentAccount`, then `agentEnsName`, then `parentWallet` as fallback. The agent smart account is the preferred webhook namespace so one parent wallet can operate several agentic wallets with separate intent streams. It does not forward events to user webhooks. User webhook fanout remains disabled until ClearIntent has agent-scoped destination registration, parent-wallet proof for that destination, replay protection, source binding, and per-policy event-type controls.

First live submit evidence:

- workflow ID: `r8hbrox9eorgvvlunk72b`
- first failed execution ID: `p5w6v9tydmv80ss4zfr0r`
- corrected execution ID: `089to8oqegw0r48i63vbj`
- corrected run ID: `089to8oqegw0r48i63vbj`
- submitted status: `running`
- monitored status: `executed`
- log count: 0
- claim level: `keeperhub-live-submitted`
- transaction hash: none
- degraded reasons after monitoring: `unsupported_executor`, `missing_transaction_evidence`

Current CLI routes:

```bash
npm run clearintent -- keeperhub live-status
npm run clearintent -- keeperhub live-submit
npm run clearintent -- keeperhub live-run-status
```

`keeperhub live-status` is read-only unless `KEEPERHUB_ENABLE_LIVE_PROBE=true`, in which case it may call KeeperHub's workflow lookup endpoint. `keeperhub live-submit` is always blocked unless `KEEPERHUB_ENABLE_LIVE_SUBMIT=true`. `keeperhub live-run-status` reads `KEEPERHUB_EXECUTION_ID` or `KEEPERHUB_RUN_ID` and queries KeeperHub execution status plus logs without submitting another run.

Phase 4B environment:

```env
KEEPERHUB_API_BASE_URL=https://app.keeperhub.com/api
KEEPERHUB_API_TOKEN=<external secrets only>
KEEPERHUB_WORKFLOW_ID=
KEEPERHUB_EXECUTION_ID=
KEEPERHUB_EXECUTION_MODE=workflow
KEEPERHUB_EXECUTOR_ADDRESS=
KEEPERHUB_ENABLE_LIVE_PROBE=false
KEEPERHUB_ENABLE_LIVE_SUBMIT=false
```

The first live-status output in the operator environment has token, workflow, and 0G/ENS binding present. The first live-submit was accepted by KeeperHub but failed because the original branched workflow could not evaluate conditions correctly. The simplified workflow then produced corrected execution `089to8oqegw0r48i63vbj`, and `keeperhub live-run-status` reported terminal status `executed` with no transaction hash. This supports workflow-execution proof, not onchain transaction proof.

## Taxonomy

### Workflow model

KeeperHub workflows are built from triggers, actions, and conditions. Triggers include manual, schedule, webhook, blockchain event, and block interval. Actions include Web3 reads/writes, notifications, HTTP/system nodes, loops/aggregation, and math.

ClearIntent usage: represent KeeperHub workflow configuration as an execution adapter output, not as ClearIntent policy truth.

Source: [KeeperHub overview](https://docs.keeperhub.com/).

### Runs and logs

KeeperHub exposes execution runs, status, logs, troubleshooting, and performance monitoring.

ClearIntent usage: the adapter should return a typed receipt with workflow ID, run ID, transaction hash when applicable, status, timestamps, and error context.

Sources: [KeeperHub docs](https://docs.keeperhub.com/), [API executions docs](https://docs.keeperhub.com/api/executions).

### API and direct execution

KeeperHub API docs describe programmatic workflow, execution, analytics, integration, project, chain, organization, API-key, and direct-execution surfaces.

ClearIntent usage: REST API is the likely adapter path for a reproducible demo. Direct execution may be useful for simple contract-call demos, but workflow execution better demonstrates KeeperHub's reliability layer.

Sources: [API overview](https://docs.keeperhub.com/api), [Direct execution API](https://docs.keeperhub.com/api/direct-execution), [Workflows API](https://docs.keeperhub.com/api/workflows).

### CLI

KeeperHub CLI docs list workflow, run, execute, wallet, org, project, protocol, template, auth, and doctor commands.

ClearIntent usage: CLI is useful for operator debugging and deterministic closeout evidence.

Sources: [CLI overview](https://docs.keeperhub.com/cli), [CLI quickstart](https://docs.keeperhub.com/cli/quickstart).

### AI tools

KeeperHub docs include AI tools, a Claude Code plugin, MCP server, and agentic wallet material.

ClearIntent usage: these are relevant if Guardian Agent delegates workflow creation/execution through a tool boundary. ClearIntent still owns policy verification before execution.

Sources: [AI tools overview](https://docs.keeperhub.com/ai-tools), [MCP server](https://docs.keeperhub.com/ai-tools/mcp-server), [Agentic wallets](https://docs.keeperhub.com/ai-tools/agentic-wallet).

## Implementation cautions

- Do not let KeeperHub become the policy verifier. KeeperHub executes after ClearIntent has verified the intent.
- Do not hide wallet custody or gas behavior. Record the execution account/wallet path in receipts.
- Do not mark execution successful until run status and transaction evidence are captured.
- If using MCP, log the exact tool call payload and response in the audit bundle.

## Local follow-ups

- Bind the executor identity or workflow reference into the 0G/ENS evidence path when the live KeeperHub target is selected.
- Capture one live run or transaction and convert it into a canonical `ExecutionReceipt`.
- Run one demo transaction or test intent through the parent-owned agent account path before claiming transaction-backed autonomous execution.
- Implement agent-scoped webhook destination registration before enabling Discord, Telegram, or custom webhook fanout.
