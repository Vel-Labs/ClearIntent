# Operator Testing Findings: 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, and 5C

This findings log summarizes operator-run evidence gathered while following `docs/roadmaps/OPERATOR_TESTING_2A_3A_4A_5ABC.md`.

Raw command output can stay in the checklist or chat transcript. This file records what the output means for claim levels, blockers, and next testing steps.

## Session 1: Local Baseline and Human CLI Coverage

Date: 2026-04-30

Operator environment:

- Node: `v22.22.0`
- npm: `10.9.4`
- `npm install`: completed, dependencies already up to date

### Baseline Quality Gate

Commands run:

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

Result: pass.

Evidence summary:

- Scaffold validation passed, including current `docs/FILE_TREE.md`.
- Contract validation passed against canonical schemas and semantic checks.
- Center CLI validation passed, including JSON-at-byte-one behavior, `commandOk` / `authorityOk` separation, identity/execution/signer local-only claim enforcement, and bare CLI human/AI lane exposure.
- Focused package tests passed:
  - 0G memory: 13 tests
  - ENS identity: 9 tests
  - KeeperHub adapter: 11 tests
  - Signer adapter: 6 tests
  - Center CLI: 21 tests
- Full test suite passed: 90 tests across 10 files.
- Typecheck passed.
- `npm run check` passed end to end.

Findings:

- No local validation blockers.
- Local modules are test-covered at the current scaffold claim levels.
- No test output promoted live 0G, live ENS, live KeeperHub, real wallet, secure-device, or vendor-approved Clear Signing claims.

### Human CLI / Wizard Coverage

Commands or menu routes exercised:

- `center status`
- `center inspect`
- `intent validate`
- `intent state`
- `authority evaluate`
- `identity status`
- `execution status`
- `signer status`
- `signer preview`
- `signer metadata`
- `module doctor`
- direct command: `npm run clearintent -- signer status`

Result: pass.

Evidence summary:

- Core center routes are human-readable and preserve the expected blocked authority state when signature evidence is missing.
- `intent validate` reports authority ok because fixture payloads match canonical schemas.
- `identity status` reports:
  - claim level `ens-local-fixture`
  - local fixture pass
  - live ENS disabled
  - live 0G binding not claimed
  - expected degraded reasons: `live_ens_disabled`, `live_0g_not_claimed`
- `execution status` reports:
  - claim level `keeperhub-local-fixture`
  - local fixture available
  - live provider disabled
  - live execution proof `no`
  - KeeperHub authority approval `no`
  - expected degraded reason: `live_provider_unavailable`
- `signer status` reports:
  - claim levels `signer-local-fixture`, `eip712-local-fixture`, `erc7730-local-metadata`
  - software wallet validation `ready-for-operator-test`
  - wallet-rendered preview proven `no`
  - secure-device display proven `no`
  - vendor-approved Clear Signing `no`
  - expected degraded reason: `software_wallet_not_tested`
- `signer preview` and `signer metadata` are exposed in human-readable mode without claiming real wallet display or vendor approval.
- `module doctor` reports ready local modules for core, ENS, 0G, KeeperHub, and signer, with notifications deferred.

Findings:

- Human CLI routing is coherent across core, memory, identity, execution, signer, and module surfaces.
- The CLI correctly treats inspection success separately from authority approval.
- Current degraded reasons are expected and honest:
  - 0G local proof is missing until 2B.
  - ENS live lookup and 0G binding are missing until 3B after 2B.
  - KeeperHub live provider/execution is missing until 4B.
  - Software wallet evidence is missing until 5C.
  - Notifications are intentionally deferred.

Blockers found: none for local human CLI coverage.

Claim levels preserved:

- Phase 2A: `local-adapter`
- Phase 3A: `ens-local-fixture`
- Phase 4A: `keeperhub-local-fixture`
- Phase 5A: `signer-local-fixture`, `eip712-local-fixture`
- Phase 5B: `erc7730-local-metadata`
- Phase 5C: `ready-for-operator-test` only

## Session 1 Continued: Local Layer Route Testing

Date: 2026-04-30

### Step 3: Phase 2A Local 0G Memory and Audit

Commands run:

```bash
npm run --silent clearintent -- memory status --json
npm run --silent clearintent -- memory check --json
npm run --silent clearintent -- memory audit-bundle --json
npm run --silent clearintent -- module doctor --json
npm run clearintent -- memory status
npm run clearintent -- memory check
npm run clearintent -- memory audit-bundle
npm run clearintent -- module doctor
```

Result: pass.

Evidence summary:

- Agent/JSON lane returned parse-safe JSON for all memory and module commands.
- Human-readable lane returned the same state in operator-friendly text.
- `memory status`, `memory check`, and `memory audit-bundle` all reported:
  - `commandOk: true`
  - `authorityOk: true`
  - mode `local-memory`
  - provider mode `local`
  - claim level `local-adapter`
  - live provider disabled
  - local-only marker present
  - write/read/hash/audit-bundle checks passed
  - proof check `local-only`
- `module doctor` reported local-ready modules for core, ENS, 0G, KeeperHub, and signer.
- `notifications` remains deferred, as expected.

Expected degraded reasons observed:

- `missing_proof`
- `live_provider_disabled`

Findings:

- Phase 2A local memory/audit is operator-verified in both JSON and human-readable CLI lanes.
- The output correctly distinguishes local artifact confidence from live 0G proof.
- No `0g-write-read` or `0g-write-read-verified` claim appeared.

Blockers found: none for Phase 2A local scope.

### Step 4: Phase 3A Local ENS Identity

Commands run:

```bash
npm run --silent clearintent -- identity status --json
npm run clearintent -- identity status
```

Result: pass.

Evidence summary:

- JSON lane returned parse-safe output.
- Human-readable lane returned the same operator state.
- The local ENS fixture resolved `guardian.clearintent.eth`.
- Records were present for `agentCardUri`, `policyUri`, `policyHash`, `auditLatest`, and `clearintentVersion`.
- claim level remained `ens-local-fixture`.
- live provider remained disabled.
- identity status was `[PASS] ok`.
- identity authority approval remained `no`.
- live ENS claim remained `no`.
- live 0G claim remained `no`.

Expected degraded reasons observed:

- `live_ens_disabled`
- `live_0g_not_claimed`

Findings:

- Phase 3A local ENS identity is operator-verified in both JSON and human-readable CLI lanes.
- The local identity route proves fixture-backed discovery and record extraction only.
- The route correctly keeps `authorityOk: false` because identity discovery is not authority approval.
- No live ENS or live 0G-bound identity claim appeared.

Blockers found: none for Phase 3A local scope.

### Step 5: Phase 4A Local KeeperHub Execution

Commands run:

```bash
npm run --silent clearintent -- execution status --json
npm run --silent clearintent -- keeperhub status --json
npm run clearintent -- execution status
npm run clearintent -- keeperhub status
```

Result: pass.

Evidence summary:

- JSON lane returned parse-safe output for both `execution status` and `keeperhub status`.
- Human-readable lane returned the same operator state for both aliases.
- claim level remained `keeperhub-local-fixture`.
- local fixture was available.
- live provider remained disabled.
- live execution proof remained `false` / `no`.
- KeeperHub authority approval remained `false` / `no`.
- local workflow mapping, submit, monitor, and receipt conversion were reported available.

Expected degraded reason observed:

- `live_provider_unavailable`

Findings:

- Phase 4A local KeeperHub execution is operator-verified in both JSON and human-readable CLI lanes.
- `execution status` and `keeperhub status` are coherent aliases over the same local fixture state.
- The route correctly preserves the boundary that KeeperHub executes only after ClearIntent verification and does not provide authority approval.
- No live KeeperHub run or onchain transaction claim appeared.

Blockers found: none for Phase 4A local scope.

### Step 6: Phase 5A Local Signer Payload and Approval

Commands run:

```bash
npm run --silent clearintent -- signer status --json
npm run --silent clearintent -- signer preview --json
npm run --silent clearintent -- signer typed-data --json
npm run clearintent -- signer status
npm run clearintent -- signer preview
npm run clearintent -- signer typed-data
```

Result: pass.

Evidence summary:

- JSON lane returned parse-safe output for status, preview, and typed-data routes.
- Human-readable lane returned the same operator state.
- `signer status` reported local claim levels `signer-local-fixture`, `eip712-local-fixture`, and `erc7730-local-metadata`.
- `signer preview` reported all required approval fields: intent ID, intent hash, policy hash, action hash, signer, executor, nonce, deadline, chain ID, verifying contract, value bound, agent identity, and audit references.
- `signer typed-data` reported EIP-712 typed data with domain name `ClearIntent`, version `1`, chain ID `11155111`, explicit verifying contract, and primary type `ClearIntentAgentIntent`.
- software wallet validation remained `ready-for-operator-test`.
- wallet-rendered preview, secure-device display, and vendor-approved Clear Signing remained false.

Expected degraded reason observed:

- `software_wallet_not_tested`

Findings:

- Phase 5A local signer payload and approval preview are operator-verified in both JSON and human-readable CLI lanes.
- Typed data and preview include the authority-critical fields needed for the next MetaMask/software-wallet validation step.
- The route correctly does not request a real wallet signature.
- No `software-wallet-tested`, wallet-rendered preview, secure-device display, or vendor-approved Clear Signing claim appeared.

Blockers found: none for Phase 5A local scope.

### Step 7: Phase 5B Local ERC-7730 / Clear Signing Metadata

Commands run:

```bash
npm run --silent clearintent -- signer metadata --json
npm run clearintent -- signer metadata
```

Result: pass.

Evidence summary:

- JSON lane returned parse-safe metadata output.
- Human-readable lane returned the same operator state.
- claim level remained `erc7730-local-metadata`.
- metadata domain included chain ID `11155111` and explicit verifying contract.
- metadata fields matched the approval-preview field map.
- metadata limitations explicitly stated local metadata only, no wallet-rendered preview evidence, no secure-device display evidence, and no vendor-approved Clear Signing claim.
- metadata hash observed: `0x505d0edd1888b171e26357340f4499ae80c652a95d5accee96efd8bb000a09a4`.

Expected degraded reason observed:

- `software_wallet_not_tested`

Findings:

- Phase 5B local metadata is operator-verified in both JSON and human-readable CLI lanes.
- Metadata generation is properly labeled as local metadata only.
- No wallet acceptance, wallet-rendered display, secure-device display, or vendor approval claim appeared.

Blockers found: none for Phase 5B local scope.

### Step 8: Cross-Layer Local JSON Sequence

Commands run:

```bash
npm run --silent clearintent -- memory check --json
npm run --silent clearintent -- identity status --json
npm run --silent clearintent -- execution status --json
npm run --silent clearintent -- signer status --json
npm run --silent clearintent -- signer preview --json
npm run --silent clearintent -- signer metadata --json
```

Result: pass.

Evidence summary:

- All commands returned JSON output.
- All commands reported `commandOk: true`.
- Local memory retained `authorityOk: true` because local memory checks passed.
- Identity, execution, and signer routes retained `authorityOk: false` because they are inspection/readiness surfaces, not authority approval.
- All local claim levels remained constrained:
  - memory: `local-adapter`
  - identity: `ens-local-fixture`
  - execution: `keeperhub-local-fixture`
  - signer: `signer-local-fixture`, `eip712-local-fixture`, `erc7730-local-metadata`
- No live provider claim appeared across memory, identity, execution, or signer local routes.

Findings:

- Cross-layer local JSON testing confirms the local surfaces are coherent and parse-safe for agent/automation use.
- Expected degraded states are visible and scoped to missing live proof, live ENS/0G binding, live KeeperHub execution, and real wallet validation.
- The local stack is ready to move to online/live testing gates without changing local claim levels.

Blockers found: none for cross-layer local scope.

## Updated Local Testing Status

| Area | Status | Claim level preserved | Notes |
| --- | --- | --- | --- |
| 2A local 0G memory/audit | pass | `local-adapter` | Live proof absent by design. |
| 3A local ENS identity | pass | `ens-local-fixture` | Live ENS and live 0G binding absent by design. |
| 4A local KeeperHub execution | pass | `keeperhub-local-fixture` | Live execution absent by design. |
| 5A signer payload/preview | pass | `signer-local-fixture`, `eip712-local-fixture` | Ready for 5C operator wallet test. |
| 5B metadata | pass | `erc7730-local-metadata` | Local metadata only. |
| Cross-layer JSON sequence | pass | local claims only | Agent/automation lane is coherent. |
| 2B live 0G smoke | pass | `0g-write-read-verified` | Proof-enabled live upload/readback succeeded. `rootHash=0x8ee47b16e03de745ebf2e65e94ed3b7341395f506a5fb7c8e299f9974aa22484`; `txHash=0x024cc777830963d7c23500024554ed7692f3cb7562ec44014780f68bfdaa66b7`. |
| 3B live ENS binding | pass | `ens-live-bound` | `guardian.agent.clearintent.eth` resolves to `0x00DAfA45939d6Ff57E134499DB2a5AE28cc25ad7`; required records are present; `policy.hash` matches expected; ENS tx `0x1dce685d1af441208b5ae22f890cbf3e7ed38b2865c04701c874e1f40d5f861b`; block `25005501`. |
| 4B live KeeperHub execution | open | none yet | 0G/ENS prerequisites are satisfied; live KeeperHub run or transaction evidence remains required. |

## Next Operator Step

Proceed to online/live testing gates in this order:

1. Keep `ZERO_G_ENABLE_LIVE_WRITES=false` unless intentionally running another upload.
2. Proceed to Phase 4B live KeeperHub/onchain execution now that the 0G/ENS binding is ready.
3. Repeat 5C MetaMask/software-wallet validation as testnet-integrated only after 4B evidence exists.
