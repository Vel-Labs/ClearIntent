# WalletConnect

WalletConnect is a first-class infrastructure path for ClearIntent because it lets the same typed intent reach many mobile and app wallets.

Current level: L0 researched only.

Target level: L1 generic WalletConnect adapter scaffold, then L2-L4 wallet-specific testing.

## Candidate wallets

| Wallet | Local notes |
| --- | --- |
| [Rainbow](rainbow/README.md) | Mobile wallet path candidate. |
| [Trust Wallet](trust-wallet/README.md) | Common mobile WalletConnect path. |
| [Coinbase Wallet](coinbase-wallet/README.md) | Mobile and WalletConnect path candidate. |
| [Tangem](tangem/README.md) | WalletConnect plus Tangem app transaction verification research path. |

## Claim boundary

WalletConnect support means ClearIntent can connect to a wallet session and request typed signing. It does not guarantee the connected wallet renders the typed intent clearly. Wallet-specific rendering must be tested per wallet and app version.

Sources:

- [WalletConnect App SDK overview](https://docs.walletconnect.network/app-sdk/overview)
- [WalletConnect Wallets docs](https://docs.walletconnect.network/wallets)
- [WalletGuide wallet list](https://docs.walletconnect.network/walletguide/wallets/wallet-list)
- [WalletConnect GitHub map](github-map.md)
