# ClearIntent Signer Adapter

`packages/signer-adapter` builds wallet-facing ClearIntent approval payloads without tying the project to one wallet vendor.

ClearIntent used EIP-712 typed data as the baseline signing primitive and ERC-7730 metadata as the local clear-signing metadata direction. The package generates deterministic typed data, renders a ClearIntent-readable approval preview, prepares injected-wallet request shapes, and reports warnings when wallet-rendered or secure-device display evidence is absent.

## Provider and standards usage

For the hackathon, signer work used:

- EIP-712 for structured ClearIntent intent signing
- EIP-1193-style injected provider request shape for software-wallet validation
- ERC-7730 metadata generation for future clear-signing/readability support
- MetaMask as the first intended Phase 5C software-wallet validation target

The current claim is local fixture proof: `signer-local-fixture`, `eip712-local-fixture`, and `erc7730-local-metadata`.

## Claim boundary

This package does not claim real MetaMask signing, WalletConnect signing, hardware-wallet validation, wallet-rendered preview, secure-device display, or vendor-approved Clear Signing. Those claims require operator-run wallet evidence with the exact payload and wallet version recorded.

## CLI

```bash
npm run clearintent -- signer status
npm run clearintent -- signer preview
npm run clearintent -- signer typed-data
npm run clearintent -- signer metadata
```

The Phase 6 dashboard uses this package's typed-data shape to prepare request-only wallet validation flows without overstating wallet proof.

## Read next

- `docs/providers/Wallets/README.md`
- `docs/providers/Wallets/compatibility-levels.md`
- `docs/providers/Wallets/generic/eip712.md`
- `docs/providers/Wallets/generic/erc7730.md`
