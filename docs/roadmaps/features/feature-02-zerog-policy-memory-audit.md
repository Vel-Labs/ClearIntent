# Feature 02: 0G Policy Memory and Audit

## Purpose

Use 0G as the persistence and audit layer for ClearIntent policy, intent, risk, review, signature, execution, and audit artifacts.

ClearIntent should operate like a verifiable ledger of authority evidence: individual artifacts are independently inspectable, hash-bound, replayable, and then rolled up into audit bundles.

## Dependencies

- Phase 1 contract/core stability handoff
- Phase 1.5 Center CLI skeleton
- Current 0G SDK/API verification before live integration

## Goals

- define storage and audit adapter interfaces without redefining authority contracts
- store individual policy, intent, risk report, human review, signature evidence, execution receipt, and audit bundle artifacts
- validate content hashes on readback
- loudly distinguish blocked, degraded, local-only, write-only, write-read, and write-read-verified states
- generate audit bundle links over individual artifact refs
- expose local and 0G-backed memory status through the Center CLI module surface
- expose both human-readable and deterministic JSON Center CLI output for memory/audit operations
- document exact 0G surfaces used for hackathon eligibility

## Non-goals

- full long-term memory product
- 0G Compute risk/reflection integration in Phase 2A or 2B
- iNFT / ERC-7857 embedded memory
- production-grade storage migration
- browser UI or hosted service
- hiding storage failures behind success states

## Claim levels

Every Phase 2 artifact and CLI readout should name its claim level:

- `local-fixture`: static fixture only
- `local-adapter`: deterministic local write/read implementation
- `0g-write-only`: artifact upload works, but readback/hash verification is not proven
- `0g-write-read`: upload and retrieval work
- `0g-write-read-verified`: upload, retrieval, and content/proof verification work

Do not claim stronger 0G usage than the evidence proves. Phase 2A may be SDK-shaped, but it remains `local-adapter` until live 0G write/read evidence exists.

## Artifact strategy

Store individual artifacts first, then roll them up:

- policy artifact
- intent artifact
- risk report artifact
- human review checkpoint artifact
- signature evidence artifact
- execution receipt artifact
- audit bundle artifact

Reason: a single blob is easier, but it weakens replayability. Individual artifacts let humans and agents identify exactly which evidence is missing, mismatched, degraded, or unverified.

## Failure and degraded-state posture

- Missing policy blocks execution.
- Missing intent, review, signature, or authority evidence blocks the relevant lifecycle gate.
- Missing or mismatched storage hash blocks a claim that storage is verified.
- Missing audit write after execution is a loud degraded state, not success.
- Degraded states must explain exactly which artifact, write, read, hash, proof, or provider operation failed.

## 0G surface alignment

### Storage

Primary Phase 2 target. Use 0G Storage for policy, intent, risk, review, signature, execution receipt, and audit bundle artifacts.

Official docs currently describe:

- TypeScript SDK package `@0gfoundation/0g-ts-sdk`
- `ethers` peer dependency
- `Indexer`, `ZgFile`, and `MemData`
- file and in-memory upload
- Merkle root/hash generation
- proof-enabled download
- KV storage
- browser upload caveats
- optional encryption/decryption paths

### Compute

Deferred from Phase 2A/2B. 0G Compute is useful later for risk/reflection critics, but only after storage can persist and replay outputs.

When introduced, Compute should produce a risk/reflection artifact that is stored and hash-bound like every other artifact. It must not become the global authority brain.

### Chain

Only needed if ClearIntent deploys contracts or executes demo transactions on 0G Chain. Not required for Phase 2A. Phase 2B may need 0G testnet credentials/tokens if the selected Storage path requires signer-backed upload.

### Data Availability

Deferred. DA is not needed for the first policy/audit artifact implementation.

### INFT / ERC-7857

Stretch only. Do not claim until minted, linked, and inspectable.

## Subphases

### Phase 2A: Local Policy Memory and Audit Scaffold

Goal: prove the complete memory/audit semantics locally before live provider integration.

Required outputs:

- `packages/zerog-memory/` local-first package
- `MemoryAdapter` interface
- `AuditStore` interface
- artifact envelope and artifact ref types
- deterministic local backend for tests
- local write/read round trip for each required artifact family
- content hash validation
- missing/mismatched artifact tests
- local audit bundle generation over individual artifact refs
- Center CLI module status/readout for local memory/audit
- Center CLI local memory commands that exercise write/read/hash/audit behavior in human-readable and JSON modes
- docs that clearly label `local-adapter` claim level
- midpoint and closeout audits for 2A

Stop point:

- Do not call live 0G endpoints in 2A.
- Do not require live credentials in 2A.
- Do not create provider claims beyond local scaffold.
- Keep the local adapter compatible with the intended 0G Storage SDK-backed implementation so Phase 2B can swap backends, not rewrite semantics.

Status: complete locally at claim level `local-adapter`.

Evidence:

- midpoint audit: `docs/audits/phase-2-zerog-policy-memory-audit/2a.5-midpoint-audit.md`
- closeout audit: `docs/audits/phase-2-zerog-policy-memory-audit/2a.9-closeout-audit.md`
- local package: `packages/zerog-memory/`
- focused tests: `tests/zerog-memory/`
- Center CLI commands: `memory status`, `memory check`, `memory audit-bundle`, and `module doctor`

Current claim posture:

- Phase 2A may only claim `local-adapter` after local write/read, hash validation, audit-bundle generation, degraded states, and Center CLI memory output are proven.
- Phase 2A must not claim live 0G upload, readback, proof verification, or provider-backed persistence.
- Phase 2B remains the live 0G Storage replacement behind the same interfaces.

### Phase 2B: Live 0G Storage Integration

Goal: connect the Phase 2A interfaces to real 0G Storage and prove actual provider-backed artifact persistence.

Network posture:

- Run testnet first.
- Prefer a livenet/mainnet follow-up after testnet upload, readback, and hash/proof verification pass.
- Do not weaken claim language: testnet evidence supports testnet claim levels only; livenet/mainnet evidence requires its own audit note.

Required before starting:

- 0G credentials and testnet/mainnet target selected
- current SDK package/import paths verified from official 0G docs
- RPC/indexer endpoints selected from official network docs
- decision on standard vs turbo storage mode
- decision on proof level: write-only, write-read, or write-read-verified

Required outputs:

- 0G-backed implementation behind the Phase 2A interfaces
- config-driven credentials/endpoints with no hard-coded secrets or artifact URIs
- upload result with root hash / transaction evidence
- retrieval path
- content hash validation
- proof-enabled retrieval if available and practical
- degraded states for unavailable provider, failed upload, failed retrieval, hash mismatch, missing proof, or wrong encryption key
- Center CLI module status/readout that distinguishes local from 0G-backed claim levels
- docs and audit evidence for actual 0G use
- closeout audit stating exact claim level reached

Status: next planned phase after 2A closeout.

### Phase 2C: Optional 0G Compute Risk Reflection

Goal: use 0G Compute for optional risk/reflection output only after storage persistence is proven.

Candidate outputs:

- compute adapter interface
- provider/model selection metadata
- request/response hash binding
- risk/reflection artifact persisted through Phase 2 storage
- Center CLI readout showing compute claim level

Status: deferred. Do not include in 2A/2B unless explicitly planned.

## Success criteria

### 2A success

- local memory adapter writes and reads all required artifact families
- artifact hashes are deterministic and validated
- mismatched or missing artifacts produce explicit blocked/degraded results
- audit bundle rolls up individual artifact refs
- Center CLI reports local memory/audit status honestly in both human-readable and JSON modes
- human-readable Center CLI output uses visually distinct pass/fail/degraded/local-only status markers with plain-text fallbacks
- `npm run check` passes

### 2B success

- at least one policy or audit artifact is actually uploaded to 0G Storage
- artifact is retrievable from 0G Storage
- retrieved content validates against expected hash
- provider failures and missing proof are visible as degraded states
- docs and audit evidence support the exact claim level
