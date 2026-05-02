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
- Phase 4B KeeperHub live execution is unblocked but not complete.
- Phase 5A/5B signer payload and ERC-7730 metadata are complete locally.
- Phase 5C/5D/5E wallet validation remains open.

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

Build or validate CLI routes such as:

```bash
npm run clearintent -- keeperhub live-status
npm run clearintent -- keeperhub live-submit
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
- `KEEPERHUB_FEEDBACK.md`
- `docs/providers/KeeperHub/README.md`
- roadmap/current-state updates
- `CHANGELOG.md`

Done when:

- Phase 4B has live KeeperHub run or transaction evidence.
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

## Step 3: Build ClearIntent Frontend Wizard

Goal: make the setup process human-usable while preserving stateless/non-custodial authority boundaries.

Wizard flow:

1. Connect parent wallet.
2. Create or select parent-owned agent smart account.
3. Name the agent account, for example `velcrafting.agent.clearintent.eth`.
4. Create/update ENS subname records:
   - agent wallet address
   - `agent.card`
   - `policy.uri`
   - `policy.hash`
   - `audit.latest`
   - `clearintent.version`
5. Store policy, agent card, and audit pointers through 0G.
6. Select KeeperHub execution path.
7. Configure webhook/escalation destination if available.
8. Generate SDK install instructions and an agent intro prompt.
9. Run a test intent.
10. Show ready state.

Ready-state display should include:

- parent authority wallet
- agent smart account
- ENS name
- 0G policy URI/hash
- latest audit URI
- KeeperHub workflow/executor
- session authority status and expiry where implemented
- escalation channel
- policy mode

Done when:

- a user can understand what account controls what
- no frontend database is treated as authority truth
- all important state resolves from wallet session, ENS, 0G, onchain state, and KeeperHub evidence

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
