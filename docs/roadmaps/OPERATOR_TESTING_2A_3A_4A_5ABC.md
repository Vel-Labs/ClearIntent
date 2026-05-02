# Operator Testing Checklist: 2A, 3A, 4A, 5A, 5B, and 5C

This checklist is for human-operated verification after the local 2A, 3A, 4A, 5A, and 5B scaffolds have landed, and before advancing to 2B, 3B, 4B, 5D, 5E, or later demo work.

Use this file as a working log. Paste command output, wallet observations, blocker notes, and links to evidence under each section.

## Current Claim Boundaries

| Layer | Current claim | What this proves | What it does not prove |
| --- | --- | --- | --- |
| Phase 2A 0G memory | `local-adapter` | Local write/read/hash/audit-bundle semantics. | Live 0G upload, readback, proof, or testnet persistence. |
| Phase 3A ENS identity | `ens-local-fixture` | Local ENS-shaped records, agent-card parsing, policy pointer/hash extraction. | Live ENS reads or live 0G-bound identity. |
| Phase 4A KeeperHub execution | `keeperhub-local-fixture` | Local execution request/receipt semantics. | Live KeeperHub/API/onchain execution. |
| Phase 5A signer payload | `signer-local-fixture`, `eip712-local-fixture` | Deterministic typed data, approval preview, fixture signature evidence, display warnings. | Real wallet signing or wallet-rendered preview. |
| Phase 5B metadata | `erc7730-local-metadata` | Local metadata generation and validation. | Wallet acceptance, secure-device display, or vendor approval. |
| Phase 5C MetaMask/software wallet | `ready-for-operator-test` only | Request shape and issue mapping are prepared. | `software-wallet-tested signer-only` until an operator wallet signs the exact local fixture payload; `software-wallet-tested testnet-integrated` until 2B/3B/4B live-testnet evidence is bound and retested. |

Do not promote any claim from local fixture output alone.

## Evidence Log Header

Fill this before testing.

```text
Operator:
Date:
Git branch:
Git commit or local status:
Node version:
npm version:
Browser:
MetaMask or wallet version:
Network:
Chain ID:
Wallet address used, redacted:
Notes:
```

Baseline commands:

```bash
git status --short
node --version
npm --version
npm install
npm run clearintent -- credentials status
npm run --silent clearintent -- credentials status --json
```

Expected behavior:

- `npm install` completes without dependency errors.
- `git status --short` may show intentional local edits, but should not show secrets, `.env.local`, `operator-secrets/*.env`, runtime logs, wallet state, or `node_modules`.
- `credentials status` does not print secrets and reports any `.env` / `.env.local` blockers before live work.

Potential blockers:

- missing Node/npm
- dependency install failure
- untracked secret files
- tracked `.env` / `.env.local`
- non-empty private keys or API tokens in repo-local `.env` / `.env.local`
- filled `operator-secrets/*.env` left inside the repo instead of moved to the external operator secrets path
- unexpectedly enabled live writes
- dirty worktree containing unrelated edits

Operator result log:

```text
Paste output and notes here.
```

## Full Local Quality Gate

Run this before and after operator testing:

```bash
npm run validate:scaffold
npm run validate:contracts
npm run validate:center-cli
npm test -- tests/zerog-memory
npm test -- tests/ens-identity
npm test -- tests/keeperhub-adapter
npm test -- tests/signer-adapter
npm test -- tests/center-cli
npm test
npm run typecheck
npm run check
```

Expected behavior:

- `validate:scaffold` passes and says `docs/FILE_TREE.md is current`.
- `validate:contracts` passes all schema and semantic checks.
- `validate:center-cli` confirms JSON starts with `{`, separates `commandOk` from `authorityOk`, and preserves local-only claim levels.
- Focused tests and full tests pass.
- `typecheck` exits cleanly.
- `check` runs scaffold validation, contract validation, Center CLI validation, contract tests, all tests, and typecheck.

Potential blockers:

- stale `docs/FILE_TREE.md`
- failed contract fixture validation
- Center CLI JSON has leading prose
- local packages not exporting the expected route/status APIs
- TypeScript import or type drift

Operator result log:

```text
Paste output and notes here.
```

## CLI Testing Modes

Every layer should be tested in both lanes when a route exists.

### Agent/Automation JSON Lane

Use `npm run --silent clearintent -- <command> --json`.

Expected behavior:

- stdout begins with `{`
- JSON parses
- includes `commandOk`
- includes `authorityOk`
- read-only local inspection may have `commandOk: true` and `authorityOk: false`
- local fixture routes report `liveProvider: false`

### Human-Readable CLI Lane

Use `npm run clearintent -- <command>`.

Expected behavior:

- output is plain text
- no JSON parsing required
- shows mode, live-provider status, summary, checks, and degraded/blocking reasons

### Bare Human Wizard/Landing

Use:

```bash
npm run clearintent
```

Expected behavior:

- in a non-TTY context, prints the landing screen
- in an interactive terminal, opens the Center wizard
- includes routes for center, intent, authority, identity, memory, execution, and signer inspection

Potential blockers:

- JSON and human output drift
- route missing from wizard/landing even though direct command works
- `authorityOk` accidentally treated as process failure for read-only blocked/degraded states

Operator result log:

```text
Paste output and notes here.
```

## Phase 2A: Local 0G Memory and Audit

Purpose: verify the local memory adapter still proves local artifact write/read/hash/audit-bundle semantics without live 0G claims.

Run JSON lane:

```bash
npm run --silent clearintent -- memory status --json
npm run --silent clearintent -- memory check --json
npm run --silent clearintent -- memory audit-bundle --json
npm run --silent clearintent -- module doctor --json
```

Run human lane:

```bash
npm run clearintent -- memory status
npm run clearintent -- memory check
npm run clearintent -- memory audit-bundle
npm run clearintent -- module doctor
```

Expected behavior:

- claim level remains `local-adapter`
- live provider is disabled
- local write/read/hash/audit-bundle checks pass
- proof remains local-only or degraded because live 0G proof is not part of 2A
- no `0g-write-read` or `0g-write-read-verified` claim appears

Potential blockers:

- local adapter package fails to load
- audit bundle check degrades unexpectedly
- JSON route omits `commandOk`
- local route claims live provider behavior

Operator result log:

```text
Paste JSON summaries, human-readable summaries, and blocker notes here.
```

## Phase 2B Readiness: Live 0G Preflight Only

Purpose: determine whether the environment is ready for a live 0G write/read smoke test. This is not required for 2A, but it is the next gate before 3B and 4B live paths.

Run readiness before enabling live writes:

```bash
npm run --silent clearintent -- memory live-status --json
npm run clearintent -- memory live-status
```

Expected behavior before `.env.local` is populated:

- `commandOk: true`
- `authorityOk: false`
- mode is `live-readiness`
- live provider is `true` because the route is checking live readiness
- claim level remains `local-adapter`
- degraded reasons likely include `missing_credentials`, `live_writes_disabled`, `missing_tokens`, and `live_write_unverified`

Potential blockers:

- missing or invalid `ZERO_G_PRIVATE_KEY`
- invalid `ZERO_G_WALLET_ADDRESS`
- `ZERO_G_ENABLE_LIVE_WRITES` not set to `true`
- unfunded wallet
- SDK import failure
- RPC or indexer endpoint failure

Only after intentionally opting into live writes with a funded testnet wallet, run:

```bash
npm run --silent clearintent -- memory live-smoke --json
npm run clearintent -- memory live-smoke
```

Expected behavior after a successful smoke:

- write check passes
- read check passes
- hash validation passes
- summary includes `rootHash=` and `txHash=`
- claim level becomes `0g-write-read`
- if `ZERO_G_REQUIRE_PROOF=true` and proof succeeds, claim level becomes `0g-write-read-verified`

Important safety rule:

- Do not run `memory live-smoke` with a funded private key unless you intend to perform a real 0G testnet upload.
- Never paste private keys into this file.

Operator result log:

```text
Paste readiness output, smoke output, rootHash, txHash, and blocker notes here.
Do not paste private keys.
```

## Phase 3A: Local ENS Identity

Purpose: verify local ENS-shaped identity and discovery semantics.

Run JSON lane:

```bash
npm run --silent clearintent -- identity status --json
```

Run human lane:

```bash
npm run clearintent -- identity status
```

Expected behavior:

- claim level is `ens-local-fixture`
- live provider is disabled
- local fixture resolves
- ENS name is present in the local fixture output
- checks include local fixture pass
- live ENS and live 0G binding remain degraded/not claimed
- `authorityOk` remains false because identity discovery is not authority approval

Potential blockers:

- local ENS package fails to load
- local records are missing required keys
- local policy hash mismatch
- CLI claims live ENS before 3B

Operator result log:

```text
Paste JSON summaries, human-readable summaries, and blocker notes here.
```

## Phase 3B Readiness: Live ENS Binding Planning

Do not run or claim live ENS binding until Phase 2B has live 0G artifact evidence.

Before 3B, collect:

- selected ENS name or subname
- resolver/network target
- account authorized to manage records
- target text records:
  - `agent.card`
  - `policy.uri`
  - `policy.hash`
  - `audit.latest`
  - `clearintent.version`
- the Phase 2B live 0G `rootHash` / artifact URI for policy and audit references

Expected behavior once 3B is implemented later:

- live resolver reads records from the selected network
- records bind to the same policy hash and artifact references proven in Phase 2B
- claim level advances only with deterministic evidence, not from manual notes alone

Potential blockers:

- no ENS name/subname available
- wallet lacks permissions to set records
- chosen network does not support the desired ENS path
- policy hash in ENS does not match the 0G artifact
- live 0G evidence is missing

Operator result log:

```text
Paste selected ENS name, network, intended records, and blocker notes here.
Do not paste wallet seed phrases or private keys.
```

## Phase 4A: Local KeeperHub Execution

Purpose: verify local execution request/receipt semantics without claiming live KeeperHub or onchain execution.

Run JSON lane:

```bash
npm run --silent clearintent -- execution status --json
npm run --silent clearintent -- keeperhub status --json
```

Run human lane:

```bash
npm run clearintent -- execution status
npm run clearintent -- keeperhub status
```

Expected behavior:

- claim level is `keeperhub-local-fixture`
- live provider is disabled
- local fixture is available
- live execution proof is `false`
- KeeperHub authority approval is `false`
- `authorityOk` remains false because execution status is inspection, not authority approval

Potential blockers:

- local KeeperHub adapter package fails to load
- local fixture unavailable
- route claims live execution without 4B evidence
- execution output hides degraded reasons

Operator result log:

```text
Paste JSON summaries, human-readable summaries, and blocker notes here.
```

## Phase 4B Readiness: Live KeeperHub or Onchain Execution Planning

Do not run or claim live KeeperHub/onchain execution until Phase 2B and relevant identity binding are ready.

Before 4B, collect:

- KeeperHub account/API/CLI/MCP access details, if used
- selected execution target or workflow
- approved executor address
- RPC endpoint and chain ID for onchain verification, if applicable
- test wallet address and funding state
- expected transaction or workflow receipt shape
- where execution receipt and audit bundle will be stored

Expected behavior once 4B is implemented later:

- execution only happens after policy, nonce, deadline, executor, human review, signature, and verification checks pass
- adapter returns typed execution receipt
- failed or degraded execution remains visible
- `KEEPERHUB_FEEDBACK.md` records setup friction, docs gaps, and observed live behavior

Potential blockers:

- no KeeperHub live access
- no funded executor wallet
- unknown or unapproved executor
- transaction fails or cannot be monitored
- receipt cannot be tied back to the signed intent hash
- audit write is missing or degraded

Operator result log:

```text
Paste selected live path, access status, expected executor, and blocker notes here.
Do not paste API secrets or private keys.
```

## Phase 5A: Signer Payload and Local Approval

Purpose: verify deterministic typed-data generation, approval preview, fixture signature evidence, display warnings, and review prompts.

Run JSON lane:

```bash
npm run --silent clearintent -- signer status --json
npm run --silent clearintent -- signer preview --json
npm run --silent clearintent -- signer typed-data --json
```

Run human lane:

```bash
npm run clearintent -- signer status
npm run clearintent -- signer preview
npm run clearintent -- signer typed-data
```

Run focused tests:

```bash
npm test -- tests/signer-adapter
```

Expected behavior:

- `signer status` reports local fixture claim levels only
- `signer preview` renders ClearIntent app/CLI preview fields
- `signer typed-data` returns EIP-712 typed data with explicit `chainId` and `verifyingContract`
- `softwareWalletValidationStatus` is `ready-for-operator-test`
- `walletRenderedPreviewProven`, `secureDeviceDisplayProven`, and `vendorApprovedClearSigning` are all false
- no real wallet signature is requested by these commands

Potential blockers:

- signer package fails to load
- typed data omits chain ID or verifying contract
- preview omits authority-critical fields
- JSON route claims `software-wallet-tested`
- wallet/display warnings are missing

Operator result log:

```text
Paste JSON summaries, human-readable summaries, selected typed-data hash if available, and blocker notes here.
```

## Phase 5B: ERC-7730 / Clear Signing Metadata Local Scaffold

Purpose: verify local metadata generation from the same field map as the approval preview.

Run JSON lane:

```bash
npm run --silent clearintent -- signer metadata --json
```

Run human lane:

```bash
npm run clearintent -- signer metadata
```

Run focused tests:

```bash
npm test -- tests/signer-adapter
```

Expected behavior:

- claim level is `erc7730-local-metadata`
- metadata includes domain chain ID and verifying contract
- metadata fields match the ClearIntent approval preview field map
- limitations explicitly say local metadata only
- no wallet-rendered preview, secure-device display, or vendor approval claim appears

Potential blockers:

- metadata field map diverges from preview field map
- metadata hash changes unexpectedly without source changes
- CLI output overclaims Clear Signing
- chain-driven metadata is attempted before 5C and 2B/3B/4B evidence

Operator result log:

```text
Paste metadata output, metadata hash, validation notes, and blocker notes here.
```

## Phase 5C: MetaMask / Software Wallet Signer-Only Validation

Purpose: prove a real injected/software wallet can sign the exact ClearIntent EIP-712 typed payload.

This is signer-only validation. It is not end-to-end 0G/ENS/KeeperHub execution validation.

### 5C Preflight

Run:

```bash
npm run --silent clearintent -- signer status --json
npm run --silent clearintent -- signer typed-data --json
npm run clearintent -- signer preview
```

Record:

```text
Wallet name:
Wallet version:
Browser:
Network:
Chain ID:
Account address, redacted:
Typed-data domain chainId:
Typed-data verifyingContract:
ClearIntent intent hash:
Policy hash:
Action hash:
```

Expected behavior:

- local CLI status remains `ready-for-operator-test`
- typed data chain ID matches the intended wallet network
- typed data verifying contract is explicit
- ClearIntent preview is human-readable before any wallet signature prompt

Potential blockers:

- MetaMask not installed or locked
- selected wallet network does not match typed-data `chainId`
- wallet account differs from expected signer
- operator cannot inspect enough fields in wallet prompt
- no local browser harness exists yet

### 5C Manual Wallet Request Shape

Current repo state provides request-shape/status scaffolding, but not a committed browser app. For operator testing, use a local browser-only harness or an approved scratch test page that injects `window.ethereum`. Do not use a page you do not trust with wallet prompts.

Minimum request shape:

```js
await window.ethereum.request({
  method: "eth_signTypedData_v4",
  params: [accountAddress, JSON.stringify(typedData)]
});
```

Expected behavior for a successful 5C signer-only test:

- MetaMask prompts for typed-data signing
- operator approves intentionally
- wallet returns a signature string
- evidence records wallet version, network, chain ID, typed-data payload hash or full non-secret payload, signature result, and observed display behavior
- status may advance to `software-wallet-tested signer-only` only after this evidence is recorded in an audit note
- status must not advance to `software-wallet-tested testnet-integrated` until 2B/3B/4B live-testnet evidence exists and the wallet signs the updated/bound payload

Expected behavior for a rejected test:

- issue maps to `user_rejected`
- no claim level advances
- rejection is not treated as a system crash

Expected behavior for common provider errors:

| Provider condition | Expected issue code |
| --- | --- |
| User rejects prompt | `user_rejected` |
| Wallet/account not authorized | `unauthorized` |
| Method not supported | `unsupported_method` |
| Wallet disconnected | `disconnected` |
| Chain disconnected | `chain_disconnected` |
| Other provider error | `unknown_provider_error` |

Potential blockers:

- wallet refuses `eth_signTypedData_v4`
- wallet displays opaque or incomplete typed data
- network mismatch
- signer address mismatch
- browser page cannot access injected provider
- operator cannot safely capture evidence without leaking account details

Operator result log:

```text
Paste sanitized request result, signature prefix/suffix if desired, display observations, and blocker notes here.
Do not paste seed phrases or private keys.
```

### 5C Evidence Requirements Before Claim Promotion

Do not mark `software-wallet-tested signer-only` until this exists:

- exact wallet name and version
- exact browser
- network and chain ID
- redacted account address or test-only address
- typed-data payload hash or full non-secret typed-data payload
- returned signature or redacted signature reference
- observed wallet display behavior
- whether ClearIntent app/CLI preview was shown before wallet prompt
- limitations and blockers
- audit artifact path

Do not mark `software-wallet-tested testnet-integrated` until the signer-only test is repeated against a payload bound to:

- Phase 2B live 0G artifact refs/hashes
- Phase 3B live ENS/testnet identity or policy binding
- Phase 4B live KeeperHub/onchain execution evidence

## Cross-Layer Operator Scenario

Run this after individual sections pass.

Single-command human summary:

```bash
npm run clearintent -- test local
```

Single-command JSON summary:

```bash
npm run --silent clearintent -- test local --json
```

Expected behavior:

- contracts, core lifecycle, 0G, ENS, KeeperHub, signer payload, metadata, and cross-layer local checks show `✅ tested`
- live/onchain columns show `not tested` or `not needed`
- no live/onchain claim is promoted from local evidence
- next actions point to `memory live-status`, `memory live-smoke`, 5C wallet validation, then 3B/4B

Expanded command sequence:

```bash
npm run --silent clearintent -- memory check --json
npm run --silent clearintent -- identity status --json
npm run --silent clearintent -- execution status --json
npm run --silent clearintent -- signer status --json
npm run --silent clearintent -- signer preview --json
npm run --silent clearintent -- signer metadata --json
```

Expected behavior:

- all commands exit 0
- all JSON starts with `{`
- `commandOk` is true for each inspection command
- local claims stay local
- no command claims live 0G, live ENS, live KeeperHub, real wallet signing, secure display, or vendor approval

Operator result log:

```text
Paste command summaries and cross-layer notes here.
```

## Final Runtime Config and Secret Checklist for Remaining Steps

Use `.env.local` for non-secret local runtime configuration only. Do not put wallet private keys, API tokens, seed phrases, or paid RPC keys in repo-local `.env.local`.

Real secrets belong outside the repo. The default destination is:

```text
~/.clearintent/clearintent.secrets.env
```

Create it from the safe in-repo template:

```bash
mkdir -p ~/.clearintent
cp operator-secrets/clearintent.secrets.env.example ~/.clearintent/clearintent.secrets.env
chmod 600 ~/.clearintent/clearintent.secrets.env
```

Before editing or using credentials, run:

```bash
npm run clearintent -- credentials status
npm run --silent clearintent -- credentials status --json
npm run validate:credentials
```

Expected behavior:

- no private keys or secret values are printed
- `.env.example` is present
- `.env.local` is either present or clearly reported missing
- `.env` / `.env.local` are not tracked by git
- repo-local `.env` / `.env.local` do not contain non-empty private keys or API tokens
- the external operator secrets file is present before live 2B/3B/4B work
- live writes are false unless the operator intentionally enables them for `memory live-smoke`

### Currently Consumed by Code: Phase 2B 0G

These variables are already read by the repo:

```bash
ZERO_G_PROVIDER_MODE=live
ZERO_G_EVM_RPC=https://evmrpc-testnet.0g.ai
ZERO_G_INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai
ZERO_G_STORAGE_MODE=turbo
ZERO_G_WALLET_ADDRESS=0x...
ZERO_G_PRIVATE_KEY=0x... # external operator secrets file only
ZERO_G_ENABLE_LIVE_WRITES=false
ZERO_G_REQUIRE_PROOF=false
```

Set `ZERO_G_ENABLE_LIVE_WRITES=true` only when intentionally running the live smoke test.

Set `ZERO_G_REQUIRE_PROOF=true` only after basic write/read succeeds and you are ready to test proof-enabled readback.

Required before 2B closeout:

- funded 0G testnet wallet
- valid private key in the external operator secrets file
- explicit live-write opt-in
- successful `memory live-smoke`
- recorded `rootHash` and `txHash`

### Consumed by Code: Phase 3B ENS Planning Values

These values are consumed by `identity live-status`. Add public/non-secret values to `.env.local`; put paid/private RPC URLs in the external operator secrets file as `PRIVATE_EVM_RPC_URL`.

```bash
ENS_PROVIDER_RPC=
ENS_EVM_RPC=
ENS_CHAIN_ID=
ENS_NAME=
CLEARINTENT_ENS_NAME=
ENS_MANAGER_ADDRESS=
ENS_AGENT_CARD_RECORD_KEY=agent.card
ENS_POLICY_URI_RECORD_KEY=policy.uri
ENS_POLICY_HASH_RECORD_KEY=policy.hash
ENS_AUDIT_LATEST_RECORD_KEY=audit.latest
ENS_CLEARINTENT_VERSION_RECORD_KEY=clearintent.version
ENS_EXPECTED_POLICY_HASH=
CLEARINTENT_EXPECTED_POLICY_HASH=
ENS_RESOLVER_ADDRESS=
CLEARINTENT_AGENT_CARD_URI=
CLEARINTENT_POLICY_URI=
CLEARINTENT_POLICY_HASH=
CLEARINTENT_AUDIT_LATEST=
CLEARINTENT_VERSION=0.1.0
```

`ENS_EVM_RPC`, `CLEARINTENT_ENS_NAME`, and `CLEARINTENT_EXPECTED_POLICY_HASH` are backward-compatible aliases for older local operator files. Prefer the shorter `ENS_PROVIDER_RPC`, `ENS_NAME`, and `ENS_EXPECTED_POLICY_HASH` names for new setup.

`identity bind-records` consumes the binding values above and prepares one ENS Public Resolver `multicall(bytes[])` transaction. It is a transaction-prep route only; a parent wallet or ENS manager still signs the transaction.

Operator needs before 3B:

- ENS name/subname access
- selected chain/resolver path
- permission to set or read text records
- live 0G artifact URIs/hashes from 2B

### Not Yet Consumed by Code: Phase 4B KeeperHub / Onchain Planning Values

These are planning values to decide before implementation. Add them only after the 4B adapter defines exact names.

```bash
KEEPERHUB_PROVIDER_MODE=live
KEEPERHUB_API_URL=
KEEPERHUB_API_KEY=
KEEPERHUB_WORKFLOW_ID=
KEEPERHUB_EXECUTOR_ADDRESS=
EXECUTION_CHAIN_ID=
EXECUTION_RPC_URL=
EXECUTION_PRIVATE_KEY=
```

Operator needs before 4B:

- selected live execution path: KeeperHub API, CLI, MCP, or direct onchain adapter
- approved executor address
- funded wallet if transactions are sent
- receipt evidence shape
- decision on where receipts/audit bundles are persisted

### Not Yet Consumed by Code: Phase 5C MetaMask / Software Wallet Evidence Values

5C is browser/operator-session driven. The repo does not currently read these env vars, but the values should be captured in the audit evidence.

```bash
SOFTWARE_WALLET_NAME=MetaMask
SOFTWARE_WALLET_VERSION=
SOFTWARE_WALLET_BROWSER=
SOFTWARE_WALLET_CHAIN_ID=
SOFTWARE_WALLET_NETWORK=
SOFTWARE_WALLET_TEST_ADDRESS=0x...
```

Operator needs before 5C:

- MetaMask or compatible injected wallet installed
- test account selected
- wallet network matches typed-data chain ID
- safe place to run the local request shape
- no private keys or seed phrases pasted into repo files

## Closeout Rule Before Discussing 2B/3B/4B and 5D/5E/5F

Before advancing, this file should contain:

- local quality gate output
- 2A/3A/4A/5A/5B CLI JSON and human-readable results
- 5C operator-run wallet evidence or a clear blocker note
- `.env.local` readiness status for 2B
- explicit list of unresolved blockers

Then update the relevant closeout or readiness audit before promoting any claim level.
