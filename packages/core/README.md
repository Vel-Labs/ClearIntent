# ClearIntent Core

`packages/core` is the executable authority kernel for ClearIntent.

It consumes the canonical contracts in `contracts/` and exposes small reusable primitives for future CLI, adapter, and demo packages:

- schema-backed contract validation
- lifecycle transition checks
- lifecycle status and missing-evidence inspection
- deterministic hashing helpers
- fail-closed authority verification

This package does not define provider behavior. ENS, 0G, KeeperHub, signer, Ledger, OpenCleaw, x402, UI, and demo code must wrap or consume this package instead of redefining authority semantics.

See `API.md` for the current callable API. It documents function-level behavior and explicitly avoids HTTP-style `GET`/`POST` ambiguity at the core layer.

## Current scope

Phase 1C starts with local TypeScript modules and tests. The implementation is intentionally dependency-light and fixture-backed so future features can slot into the same authority surface.
