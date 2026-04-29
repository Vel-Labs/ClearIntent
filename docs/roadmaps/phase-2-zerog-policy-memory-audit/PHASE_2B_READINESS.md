# Phase 2B Readiness: 0G Live Storage Prep

This note records the pre-token setup for Phase 2B. It wires configuration, dependency import checks, and CLI readiness output without claiming live 0G write/read behavior.

## Local Env Setup

Copy the tracked example file:

```bash
cp .env.example .env.local
```

Fill only local values in `.env.local`:

```bash
ZERO_G_PROVIDER_MODE=live
ZERO_G_EVM_RPC=https://evmrpc-testnet.0g.ai
ZERO_G_INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai
ZERO_G_STORAGE_MODE=turbo
ZERO_G_WALLET_ADDRESS=<public testnet wallet address>
ZERO_G_PRIVATE_KEY=<private key for fresh testnet wallet>
ZERO_G_ENABLE_LIVE_WRITES=false
ZERO_G_REQUIRE_PROOF=false
```

Do not commit `.env.local`, private keys, tokens, or live run logs. `.gitignore` blocks `.env` and `.env.*` while keeping `.env.example` tracked.

## Current Dependency Wiring

- `@0gfoundation/0g-ts-sdk`
- `ethers`

The readiness command import-checks the SDK package but does not upload, download, or call live endpoints.

## Readiness Command

```bash
npm run --silent clearintent -- memory live-status
npm run --silent clearintent -- memory live-status --json
```

Expected pre-token behavior:

- provider mode: `live`
- live provider: enabled
- claim level remains `local-adapter`
- SDK check passes when dependencies are installed
- wallet check fails until `ZERO_G_PRIVATE_KEY` is set
- funds check remains degraded until an explicit live network probe exists
- live write/read/proof remain unverified

## Live Smoke Command

After the wallet is funded, explicitly opt into live writes:

```bash
ZERO_G_ENABLE_LIVE_WRITES=true
npm run --silent clearintent -- memory live-smoke
npm run --silent clearintent -- memory live-smoke --json
```

The smoke command attempts one small in-memory artifact upload through the 0G SDK, reads it back by root hash, and validates the downloaded payload. It does not print the private key.

First target claim after a successful smoke:

- `0g-write-read` when upload and readback succeed.
- `0g-write-read-verified` only when `ZERO_G_REQUIRE_PROOF=true` is set and the proof-enabled read succeeds.

If the wallet has no balance or the faucet tokens have not arrived, the command should remain blocked/degraded and keep the claim level at `local-adapter`.

## Claim Boundary

Do not claim:

- `0g-write-only` until upload succeeds
- `0g-write-read` until upload and readback both succeed
- `0g-write-read-verified` until proof/hash verification is demonstrated

The current readiness scaffold is not Phase 2B closeout. It exists so the funded-token smoke pass can be narrow once tokens arrive.
