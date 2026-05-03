# ClearIntent KeeperHub Adapter

`packages/keeperhub-adapter` is the execution-adapter boundary between verified ClearIntent intents and KeeperHub workflows.

ClearIntent used KeeperHub as the reliable workflow/execution layer after ClearIntent resolves identity, loads policy, builds an intent, checks authority, and verifies signature evidence. KeeperHub does not replace ClearIntent policy verification; it receives work only after the ClearIntent gate approves or reports a blocked/degraded state.

## Provider usage

For the hackathon, KeeperHub was used to:

- model approved intent execution as a workflow
- submit a ClearIntent-gated workflow run
- monitor execution/run status
- convert workflow response data toward ClearIntent execution receipt shape
- preserve a provider-specific boundary around workflow IDs, run IDs, status, logs, and transaction hash evidence

Phase 4B reached `keeperhub-live-submitted`: a live workflow was submitted and the corrected run reached terminal workflow status. No transaction hash was recorded, so transaction-backed autonomous execution remains a near-term goal, not a current claim.

## Claim boundary

Current proof is workflow-execution proof, not onchain transaction proof. The adapter must not report execution success unless run status and transaction/receipt evidence exist. Webhook or notification delivery is not authority approval.

## CLI

```bash
npm run clearintent -- keeperhub status
npm run clearintent -- keeperhub live-status
npm run clearintent -- keeperhub live-submit
npm run clearintent -- keeperhub live-run-status
```

Live submit is gated by `KEEPERHUB_ENABLE_LIVE_SUBMIT=true`. The run-status route reads configured execution/run IDs and does not submit another workflow run.

## Read next

- `docs/providers/KeeperHub/README.md`
- `contracts/schemas/execution-receipt.schema.json`
- `contracts/authority-lifecycle.md`
