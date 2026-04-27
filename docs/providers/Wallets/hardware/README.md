# Hardware Wallets

Hardware wallets are stronger assurance surfaces when they show meaningful signing details outside the application UI.

## Candidate wallets

| Wallet | Expected path | Current level | Target |
| --- | --- | --- | --- |
| [Ledger](ledger/README.md) | EIP-712 plus ERC-7730 clear-signing-ready metadata | L0 researched only | L5-L6 when approved and tested. |
| [Trezor](trezor/README.md) | Trezor Connect EIP-712 typed data where supported | L0 researched only | L5 if device display is verified. |
| [Tangem](tangem/README.md) | Tangem app/card flow via WalletConnect | L0 researched only | L4 or higher only after testing. |

## Claim boundary

Hardware-backed signing is not automatically Clear Signing. ClearIntent reports whether the tested path is app preview only, wallet-rendered, secure-device-rendered, or vendor-approved Clear Signing.
