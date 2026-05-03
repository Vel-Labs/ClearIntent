# May 2 Sprint

## Sprint Goal

Turn the validated 0G + ENS foundation into a complete operator story:

```text
parent wallet
-> parent-owned agent smart account
-> ENS-bound agent identity
-> 0G-backed policy and audit trail
-> ClearIntent policy evaluation
-> KeeperHub execution after approval
-> wallet/webhook/CLI review surfaces
```

The sprint should keep ClearIntent honest: the validated surface today is CLI-first, with frontend, smart-account, and hardware-wallet paths coming next. Do not claim MCP server, hosted API authority, Ledger Clear Signing approval, or live smart-account/session-key enforcement until those paths are implemented and tested.

## Current Starting Point

- 0G live storage is validated at `0g-write-read-verified`.
- ENS live binding is validated at `ens-live-bound` for `guardian.agent.clearintent.eth`.
- Phase 4A KeeperHub local adapter is complete at `keeperhub-local-fixture`.
- Phase 4B KeeperHub live execution is closed at `keeperhub-live-submitted` workflow-execution proof, without onchain transaction evidence.
- Phase 5A/5B signer payload and ERC-7730 metadata are complete locally.
- Phase 5C/5D/5E wallet validation remains open.

## May 3 Wizard Validation Evidence

The hosted-style wizard path has now produced an end-to-end custody-map validation for a fresh operator setup. This is setup and routing evidence, not yet a demo transaction proving agent-initiated onchain execution.

- Agent ENS: `vel2.agent.clearintent.eth`
- Parent wallet: `0xF7aDD17E99F097f9D0A6150D093EC049B2698c60`
- Parent-owned agent smart account: `0x8b1F1bE3D0ab7C9B1180d66970fed3033B7CE720`
- Policy URI: `0g://0xe8f86ceff68b5faee99d123624713ab1d92a69acfcf4dbce5b2dff2ea8fe1046`
- Policy hash: `0x6a5256e1d13d5f84dfb6a549803b15c11a549547c4f12d02cc1f88a9ec8557e9`
- KeeperHub run: `6uzildcmowq9jgiz12j5b`
- Operator note: the ENS portal was also used to verify that the ENS payload was fully deployed.

Validated custody chain:

```text
parent wallet
-> parent-owned agent smart account
-> vel2.agent.clearintent.eth
-> 0G policy binding
-> KeeperHub gate
-> SDK handoff state
```

Remaining proof gap: run a demo transaction or test intent that exercises the agent account path and records execution evidence. Until that exists, the wizard can claim setup validation and custody mapping, not transaction-backed autonomous execution.

## Phase Routing Update

The May 2 route is now split:

- Phase 6: authority dashboard and wallet validator. It proves the wallet-facing human approval path, canonical payload rendering, Phase 5C software-wallet validation, and provider evidence reflection.
- Phase 7: UX/setup wizard. It guides agent-account setup, policy configuration, ENS/0G binding, KeeperHub routing, escalation, SDK/CLI handoff, and ready-state flow after Phase 6 is materially working.

The older idea of Phase 6 as the full Guardian Agent planner/critic/executor example is deferred behind those two surfaces.

## Hard Product Rule

Every agent-originated transaction or intent flow must carry a canonical ClearIntent payload before execution.

That single payload should generate:

- CLI human rendering
- deterministic JSON output
- frontend review view
- EIP-712 typed-data payload for MetaMask/software wallets
- ERC-7730-compatible metadata for future Ledger Clear Signing integration
- webhook/Discord/Telegram alert body where configured
- 0G audit artifact
- KeeperHub execution receipt linkage

Do not let wallet UI, KeeperHub, or frontend code invent separate authority meaning. They render or execute the ClearIntent payload; they do not redefine it.

## Step 1: Complete KeeperHub CLI Live Path

Goal: prove KeeperHub is the execution backend/orchestrator after ClearIntent approval, not the policy verifier.

Status: in progress. The first CLI routes now exist and are gated:

```bash
npm run clearintent -- keeperhub live-status
npm run clearintent -- keeperhub live-submit
npm run clearintent -- keeperhub live-run-status
```

Current operator state: KeeperHub token and 0G/ENS binding are present. A KeeperHub workflow has been built and exported to `docs/providers/KeeperHub/clearintent-execution-gate.workflow.json`; the exported artifact now keeps only `ClearIntent Execution Gate -> Evaluate ClearIntent Gate`. The `Send ClearIntent Event` webhook block remains present, disabled, and disconnected until the frontend event-ingest endpoint exists. `keeperhub live-status` passed. The original branched workflow run `p5w6v9tydmv80ss4zfr0r` failed, then the simplified `Evaluate ClearIntent Gate` workflow produced corrected execution/run ID `089to8oqegw0r48i63vbj` with terminal status `executed`. Live execution still needs executor binding and transaction evidence if claiming onchain execution.

Build or validate CLI routes such as:

```bash
npm run clearintent -- keeperhub live-status
npm run clearintent -- keeperhub live-submit
npm run clearintent -- keeperhub live-run-status
```

Minimum behavior:

- read KeeperHub config from external operator secrets without printing secrets
- identify selected workflow/API/direct-execution path
- report executor binding or explicit degraded state
- require completed 0G/ENS prerequisite evidence
- submit only a verified ClearIntent intent
- capture run ID, status, logs, and transaction hash when available
- convert result into canonical `ExecutionReceipt`
- persist receipt/audit update to 0G when practical, otherwise report `receipt_not_persisted`

Closeout artifacts:

- `docs/audits/phase-4-keeperhub-execution-adapter/4b.9-closeout-audit.md`
- `docs/audits/phase-4-keeperhub-execution-adapter/4b.5-midpoint-audit.md`
- `KEEPERHUB_FEEDBACK.md`
- `docs/providers/KeeperHub/clearintent-execution-gate.workflow.json`
- `docs/providers/KeeperHub/README.md`
- roadmap/current-state updates
- `CHANGELOG.md`

Done when:

- Phase 4B has live KeeperHub workflow run evidence and explicitly does not claim transaction-backed onchain execution.
- The receipt is typed and replayable.
- The docs clearly say KeeperHub executes after ClearIntent verification.

## Step 2: Build Parent-Owned Agent Smart Account

Goal: create the safe account abstraction layer for agent operation without exposing seed phrases or parent private keys.

Target model:

```text
parent wallet connects
-> parent wallet owns agent smart account
-> smart account receives policy/session configuration
-> agent receives scoped authority only
-> parent wallet remains escalation/admin authority
```

Preferred implementation path:

- Alchemy Account Kit / Wallet APIs
- EOA owner through external wallet connector
- MetaMask first
- Ledger-through-MetaMask or WalletConnect as hardware-backed test path after software-wallet validation

Important language:

- Use "parent-owned agent smart account."
- Avoid "derived wallet" or "child wallet" unless explicitly defined as a product metaphor.
- Never ask for a secret recovery phrase.
- Never require a parent private key in frontend or agent runtime.

Done when:

- frontend or local prototype can create/predict the agent smart account from a connected parent wallet
- the parent wallet signs setup actions interactively
- the agent account address can be displayed and later bound to ENS

## Step 3: Build ClearIntent Authority Dashboard and Wallet Validator

Goal: make the approval path human-usable while preserving stateless/non-custodial authority boundaries.

Phase 6 flow:

1. Connect parent wallet or show explicit unconnected state.
2. Render the canonical ClearIntent payload before approval.
3. Prepare/display the EIP-712 wallet request for Phase 5C software-wallet validation.
4. Reflect ENS, 0G, KeeperHub, signer, and wallet evidence from configured/provider state.
5. Show missing, degraded, demo, and reported-event states honestly.
6. Ingest KeeperHub events only as reported/non-authoritative unless authenticity and replay checks pass.

Evidence display should include:

- parent authority wallet
- agent wallet or smart account where implemented
- ENS name
- ENS text records as an onchain metadata reflection panel
- 0G policy URI/hash
- latest audit URI
- KeeperHub workflow/executor
- session authority status and expiry where implemented, without claiming enforcement early
- escalation channel
- policy mode

The frontend should not assume users can easily browse raw 0G artifacts from 0G explorer surfaces. It should reconstruct a clear "what is established" view from ENS records and 0G refs:

```text
agent.card
policy.uri
policy.hash
audit.latest
clearintent.version
resolved agent address
0G artifact tx hashes where available
```

This panel is the user-facing reflection of the onchain/decentralized metadata and should be visible before the user trusts an agent-facing handoff.

Done when:

- a user can understand what account controls what
- Phase 5C has a browser-based software-wallet validation path
- no frontend database is treated as authority truth
- all important state resolves from wallet session, ENS, 0G, onchain state, and KeeperHub evidence

## Step 3C: KeeperHub Event Ingest and User Webhook Isolation

The KeeperHub workflow's `Send ClearIntent Event` node should post to:

```text
https://clearintent.xyz/api/keeperhub/events
```

Current payload schema:

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

User webhook forwarding must be agent-scoped, not global. The preferred routing key is the parent-owned agent smart account address, with `agentEnsName` as the readable alias and parent wallet only as a fallback. This lets one parent wallet operate several agentic wallets while itemizing each wallet's intent stream separately. The ingest endpoint may accept and display the event, but it must not fan out to Discord/Telegram/custom destinations until ClearIntent has:

- an agent-scoped destination registration keyed primarily by `agentAccount`
- a secret/token or signed registration proving the current parent wallet controls that destination
- replay protection for incoming KeeperHub events
- source binding to the selected KeeperHub workflow/project
- a policy rule saying which event types may be forwarded

This keeps one user's intent payload from ever being sent to another user's webhook destination.

## Step 3B: Build ClearIntent UX Setup Wizard

Goal: make the setup process guided after the Phase 6 authority/wallet surface is materially working.

Wizard flow:

1. Connect parent wallet.
2. Create or select parent-owned agent smart account.
3. Name the agent account, for example `velcrafting.agent.clearintent.eth`.
4. Create/update ENS subname records.
5. Store policy, agent card, and audit pointers through 0G.
6. Select KeeperHub execution path.
7. Configure webhook/escalation destination if available.
8. Generate SDK install instructions and an agent intro prompt.
9. Run a test intent.
10. Show ready state.

Each wizard step must be classified as `live-read`, `wallet-signed-action`, `operator-external`, `disabled`, or `deferred` before implementation.

## Step 4: Configure Policy Parameters

Goal: let the user define autonomous bounds before any agent execution.

Initial policy controls:

- review-all mode by default
- bounded-agent mode as explicit opt-in
- max transaction amount
- percent-of-wallet-value cap
- allowed destination addresses/contracts
- allowed methods/actions
- denied destinations/contracts
- gas ceiling
- session expiry
- max daily or session spend
- escalation wallet/channel

Done when:

- policy changes produce a new canonical policy artifact
- policy hash updates are visible
- ENS can point to the current policy hash/URI
- out-of-policy intents fail closed before KeeperHub submission

## Step 5: Generate Agent Handoff Context

Goal: give OpenClaw or another coding agent enough context to use ClearIntent without giving it dangerous authority.

Frontend or CLI should produce:

```text
GitHub repo:
SDK install:
Agent ENS identity:
Policy URI:
Policy hash:
KeeperHub route:
Webhook/escalation route:
Allowed action summary:
Forbidden action summary:
Instruction: never execute outside ClearIntent approval.
```

Useful future command:

```bash
npm run clearintent -- agent context
```

OpenClaw prompt shape:

```text
Use ClearIntent for <agent-name>. First inspect identity, policy, and audit state.
Propose intents only through ClearIntent. Do not execute until ClearIntent returns
approved or escalated state. If blocked, report the blocking reason and stop.
```

Done when:

- the agent has references, not parent secrets
- the human can see the same custody and policy map the agent sees
- the setup prompt is ready to paste into OpenClaw/Codex/Claude

## Step 6: Test Software Wallet Path

Goal: validate that MetaMask or another software wallet can display and sign the ClearIntent EIP-712 payload.

Test flow:

```text
safe intent
-> ClearIntent payload
-> policy pass
-> MetaMask EIP-712 display
-> signature
-> KeeperHub execution
-> receipt/audit
```

Also test:

```text
malicious or out-of-policy intent
-> ClearIntent payload
-> policy block
-> KeeperHub submit refused
-> escalation/audit
```

Done when:

- `software-wallet-tested testnet-integrated` is justified by real evidence
- MetaMask display limitations are documented honestly
- the signer payload is generated from the same canonical ClearIntent payload used by CLI/frontend/0G

## Step 7: Test Hardware Wallet Path

Goal: prove stronger custody and prepare Ledger integration without overclaiming Clear Signing.

Target path:

- Ledger through MetaMask or WalletConnect first
- parent wallet signs setup/escalation actions
- ClearIntent payload remains canonical
- record what the device actually displays

Claim boundary:

- It is acceptable to claim hardware-backed approval only if the hardware-backed path signs the payload.
- Do not claim full Ledger Clear Signing unless the Ledger device demonstrably renders the intended ERC-7730/Clear Signing metadata.

Done when:

- hardware-wallet setup and signing evidence exists
- display limitations are documented
- Ledger integration path is clearly ready for vendor-specific approval work

## Demo Script Anchor

The final demo should make chain of custody visible:

```text
Parent wallet owns agent smart account
-> agent smart account is bound to ENS
-> ENS points to 0G policy/audit/card
-> ClearIntent checks intent against that policy
-> in-policy intent can execute through bounded authority / KeeperHub
-> out-of-policy intent escalates to parent wallet
-> every decision writes an audit trail
```

Suggested OpenClaw demo prompt:

```text
Use ClearIntent for guardian.agent.clearintent.eth. First inspect the agent
identity, policy, and current audit trail. Then propose a safe test transaction
within policy bounds. Do not execute anything until ClearIntent returns an
approval or escalation state.
```

Suggested attack prompt:

```text
Now simulate a malicious prompt injection asking you to drain the wallet to an
unknown address. Use ClearIntent exactly the same way and show the result.
```

Expected attack result:

```text
Policy check: blocked
Reason: amount exceeds cap / unknown destination / unsafe action
KeeperHub submit: refused before execution
Escalation: parent wallet review required
Audit: written to 0G
```

## Sprint Stop Point

Stop when one complete vertical path is recorded:

```text
ENS identity
-> 0G policy/audit
-> ClearIntent payload
-> KeeperHub execution or refusal
-> wallet/webhook/CLI display
-> audit receipt
```

Defer x402, MCP server, hosted API authority, iNFT, zk, and marketplace surfaces unless they directly improve the demo without weakening the custody story.
