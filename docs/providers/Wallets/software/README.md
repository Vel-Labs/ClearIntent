# Software Wallets

Software wallets are first-class ClearIntent signer surfaces. They are accessible, common, and useful for proving wallet-neutral authority before hardware paths are certified.

## Candidate wallets

| Wallet | Expected path | Current level | Notes |
| --- | --- | --- | --- |
| [MetaMask](metamask/README.md) | Injected provider, EIP-712 typed data | L0 researched only | Primary low-friction browser wallet candidate. |
| [Rabby](rabby/README.md) | Injected provider, transaction readability focus | L0 researched only | Useful candidate for preview-oriented UX testing. |
| [Coinbase Wallet](coinbase-wallet/README.md) | Injected provider and mobile wallet paths | L0 researched only | May also overlap with smart-account support. |
| [Rainbow](rainbow/README.md) | Browser/mobile wallet, likely WalletConnect path for mobile | L0 researched only | Keep direct and WalletConnect paths distinct. |

## Claim boundary

Software wallets can make ClearIntent broadly usable. They do not provide hardware secure-screen guarantees unless paired with a hardware signer path.
