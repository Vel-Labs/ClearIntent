# Phase 2: 0G Policy Memory and Audit Implementation Plan

## Purpose

Build ClearIntent memory and audit persistence in two layers:

- Phase 2A proves the full artifact lifecycle locally.
- Phase 2B connects the same interfaces to real 0G Storage.

This split keeps authority semantics deterministic while 0G credentials, SDK setup, endpoints, and proof capabilities are verified.

Phase 2A should be SDK-shaped even though it remains local. The local adapter should align payload, metadata, hash, and result semantics with the official 0G TypeScript SDK surface where practical, so Phase 2B can replace the local backend with live 0G calls instead of rewriting artifact semantics.

## Phase 2A: Local Policy Memory and Audit Scaffold

### Objective

Create the local adapter surface that future 0G integration must satisfy.

### Expected files

- `packages/zerog-memory/`
- `tests/zerog-memory/`
- Center CLI module/status updates under `packages/center-cli/`
- Phase 2A audits under `docs/audits/phase-2-zerog-policy-memory-audit/`
- docs updates in roadmap/current-state/changelog/file tree

### Required interfaces

- `MemoryAdapter`
- `AuditStore`
- artifact envelope type
- artifact ref type
- storage result type with blocked/degraded states
- provider mode type:
  - `local`
  - `live`
- claim level type:
  - `local-fixture`
  - `local-adapter`
  - `0g-write-only`
  - `0g-write-read`
  - `0g-write-read-verified`

### Required behavior

- write individual artifacts
- read individual artifacts
- validate content hash on read
- generate audit bundle over individual artifact refs
- return loud degraded states for missing storage, missing readback, mismatched hash, missing proof, or incomplete audit write
- expose both human-readable and JSON Center CLI output for memory status, write/read checks, hash validation, audit bundle generation, and degraded states
- render visually distinct human statuses for pass, fail, blocked, degraded, and local-only states, with color or symbols where supported and plain-text fallbacks when not
- keep local adapter shapes close to the 0G Storage SDK concepts, while preventing network calls in Phase 2A
- keep all behavior local and deterministic

### Tests

- local write/read round trip
- all required artifact families can be stored independently
- audit bundle contains refs to individual artifacts
- hash mismatch blocks or degrades
- missing artifact is loud in both human-readable output and machine-readable JSON
- Center CLI module doctor reports local memory status, provider mode, claim level, and degraded reasons
- Center CLI local memory commands exercise write, read, hash validation, and audit-bundle generation end to end
- human-readable output includes clear visual status markers and JSON output remains deterministic and parse-safe
- no live credentials required

### Stop conditions

Stop and document before proceeding if implementation pressure would:

- call live 0G network endpoints
- require credentials
- hard-code live artifact URIs or root hashes
- redefine contract schemas in the adapter
- make the local adapter diverge from the intended 0G-backed interface
- hide degraded audit persistence as success

Importing or type-checking the official 0G TypeScript SDK may be allowed in Phase 2A only if it does not require credentials, does not perform network calls, and is used to preserve Phase 2B compatibility. If official SDK imports are unstable or undocumented during 2A, document the gap and keep the local interface SDK-shaped until Phase 2B verification.

## Phase 2B: Live 0G Storage Integration

### Objective

Implement real 0G Storage write/read behavior behind the Phase 2A interfaces.

### Required before coding

- obtain 0G credentials/test tokens as needed
- verify current official package names and import paths
- verify network endpoints and indexer endpoints
- decide standard vs turbo storage mode
- decide minimum accepted claim level for closeout

Recommended target: `0g-write-read-verified`.

Fallback acceptable target: `0g-write-read` with a documented degraded gap for proof verification.

### Expected behavior

- upload artifact payloads through 0G Storage
- persist returned root hash and transaction evidence
- retrieve artifact by root hash
- validate content hash after retrieval
- optionally use proof-enabled download when available
- expose provider health and claim level through Center CLI
- never treat write-only as full persistence proof

### Tests and evidence

- local tests remain green
- live smoke test uploads a policy or audit artifact
- live smoke test retrieves the artifact
- retrieved content matches expected hash
- Center CLI reports live 0G status and claim level
- closeout audit records artifact evidence without committing secrets

### Stop conditions

Stop and document before proceeding if:

- SDK docs or package imports do not match implementation reality
- credentials are missing
- provider write works but readback fails
- readback works but hash validation fails
- proof support is unavailable after being claimed
- any secret, private key, or token would be committed

## Deferred: Phase 2C 0G Compute

0G Compute should not be bundled into Phase 2A or 2B.

Use it later for optional risk/reflection only after storage can persist and replay compute outputs. Compute output must become a stored, hash-bound artifact and must not bypass policy, human review, signer, executor, deadline, or audit gates.

## Closeout Requirements

Each phase closeout must state:

- claim level reached
- local vs live evidence
- commands run
- artifacts written/read
- CLI human output checked
- CLI JSON output checked
- degraded gaps
- whether downstream ENS/KeeperHub/signer work may consume the memory layer
