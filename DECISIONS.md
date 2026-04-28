# Decisions

This is the high-visibility decision index for ClearIntent. Detailed decision entries live under `docs/decisions/`.

## Decision Rule

Record durable architecture, product, governance, and authority choices as decisions. Routine implementation notes belong in `CHANGELOG.md`, audit files, handoffs, or roadmap routing docs.

Root `DECISIONS.md` summarizes and routes. Dated files hold the detailed entries.

## Current Decision Summary

- ClearIntent is vendor-neutral. Integrations such as Ledger, Trezor, Tangem, MetaMask, WalletConnect, Rainbow, ENS, 0G, KeeperHub, ERC-7730, ERC-8004, ERC-7857, and x402 are adapters or standards, not the product identity.
- Signer support is wallet-neutral. ClearIntent supports clear-signing-ready EIP-712 typed intents and human-readable approval metadata, while reporting wallet-rendered and secure-screen guarantees by tested capability level.
- The authority lifecycle is the product. Guardian Agent is the working example, not the whole system.
- ENS is the canonical agent identity layer for the hackathon build.
- 0G owns policy memory and audit trail for the hackathon build.
- KeeperHub is the first execution adapter.
- EIP-712 is the MVP signing primitive.
- ERC-7730 is a stretch-readable-display layer, not a blocker.
- ERC-8004, ERC-7857, x402, and zk are stretch layers.
- `contracts/` is the canonical authority contract layer.
- Human review is an explicit lifecycle gate and is not replaced by signing.
- `contracts/` plus `packages/core/` gate downstream adapter and demo work.
- `packages/core/API.md` is the callable authority API; transport layers must wrap it instead of defining authority semantics through ambiguous routes.
- The next product layer after Phase 1 is a Center CLI skeleton over `packages/core`, before provider adapters or demo integration.
- The Center CLI is the local product center and output boundary. It consumes `packages/core`, defaults to human-readable terminal output, and exposes parse-safe JSON only through explicit `--json` usage.
- Root `ROADMAP.md` and `DECISIONS.md` are indexes; detailed roadmap and decision truth lives under `docs/`.

## Decision Logs

- `docs/decisions/2026-04-25.md`
- `docs/decisions/2026-04-26.md`
- `docs/decisions/2026-04-27.md`

## Open Decision Questions

- None recorded.
