# KeeperHub Provider Funnel

KeeperHub is the ClearIntent provider for reliable onchain execution after ClearIntent has resolved identity, loaded policy, created a typed intent, reviewed risk, and collected a valid signature.

Current ClearIntent claim level: `Planned`.

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

- Define a minimal KeeperHub adapter interface in `packages/core/` before implementation.
- Decide whether Phase 4 uses REST API, CLI, MCP, or a layered adapter supporting more than one.
- Add fixtures for workflow creation, manual run, failed run, and receipt capture.
