# KeeperHub Builder Feedback

Submission target: KeeperHub Builder Feedback Bounty. Based on ClearIntent's live `ClearIntent Execution Gate` integration.

## UX / UI Friction

- The AI workflow builder repeatedly generated broken intent/condition layers for a simple gate: manual trigger -> evaluate verified ClearIntent payload -> webhook result. With docs, repo context, GPT-5.5/Codex, and KeeperHub's own AI tooling available, the generated path still failed. Lost time: roughly 60+ minutes before replacing it with one `code/run-code` block.
- Conditional webhook fanout was not possible in the builder shape we needed: branch webhooks -> one normalized final webhook. Workaround: collapse intent logic into code and leave `Send ClearIntent Event` disabled/disconnected.
- Run ID vs execution ID was unclear. Corrected run `089to8oqegw0r48i63vbj` appeared as both execution ID and run ID, costing about 15 minutes to confirm which value status/log APIs expected.

## Reproducible Bugs

1. Zero-log failed run.
   - Steps: submit workflow `r8hbrox9eorgvvlunk72b` via `POST /workflow/{id}/execute`; monitor `p5w6v9tydmv80ss4zfr0r` via `/status` and `/logs`.
   - Expected: failed node, last input, condition/code error, or stack trace.
   - Actual: terminal `failed`, `0` logs. Local receipt summary: `KeeperHub live run failed before executable receipt evidence was available.`
   - Time-to-discover: 20-30 minutes because there was no clue whether the issue was graph wiring, payload shape, condition syntax, or runtime failure.

2. Zero-log successful run.
   - Steps: simplify to `ClearIntent Execution Gate -> Evaluate ClearIntent Gate`; submit and monitor `089to8oqegw0r48i63vbj`.
   - Expected: trigger input, code output, timings, and terminal result.
   - Actual: `executed`, `0` logs, no transaction hash. This proves workflow execution, not auditable onchain execution.

3. Webhook templating mismatch.
   - Steps: configure `Send ClearIntent Event` with `{{Evaluate ClearIntent Gate.result.status}}` and related fields.
   - Actual export: stringified JSON with unresolved `{{...}}` templates. ClearIntent had to reject unresolved templates and normalize string booleans/null-like values locally.

## Documentation Gaps

- Needed exact execute/status/log response schemas; built defensive `keeperhub live-submit` and `keeperhub live-run-status`.
- Needed a recommended live-execution safety pattern; found none, so ClearIntent invented `KEEPERHUB_ENABLE_LIVE_SUBMIT=true`.
- Needed examples for code-block output references, conditional branches, and webhook payload resolution; used code blocks for intent logic and webhook shaping.
- Needed AI builder limits documented: when condition/webhook graphs are unsupported and when to use code blocks.

## Feature Requests

- Programmatic workflow push/import, e.g. `PUT /workflows/{id}` with canonical JSON validation. This would have saved several hours and enabled Git review.
- Failed-run observability: last attempted node, input/output, condition result, safe stack trace, and an "explain failure" panel.
- Native webhook lifecycle: signed deliveries, per-agent tokens, timestamp/nonce replay protection, retries, dead-letter queue, history, and replay.
- Branch aggregation/merge node for "many conditional outcomes -> one normalized webhook/receipt."
- AI builder guardrails that warn when generated templates cannot resolve or branches cannot unify output.

## Evidence

- Workflow: `r8hbrox9eorgvvlunk72b`; runs: `p5w6v9tydmv80ss4zfr0r`, `089to8oqegw0r48i63vbj`.
- Audit: `docs/audits/phase-4-keeperhub-execution-adapter/4b.9-closeout-audit.md`.
- Artifact/routes: `docs/providers/KeeperHub/clearintent-execution-gate.workflow.json`, `apps/web/src/app/api/keeperhub/events/route.ts`, `apps/web/src/app/api/events/route.ts`.
- Commits: `d65539d`, `41c220b`, `dd96e5a`, `e325f48`, `c08c844`, `d8aa252`.
