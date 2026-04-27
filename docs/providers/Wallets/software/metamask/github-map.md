# MetaMask GitHub Map

Sources: [MetaMask GitHub organization](https://github.com/MetaMask), [MetaMask docs](https://docs.metamask.io/).

## Repositories most relevant to ClearIntent

| Repository | Surface | License observed | ClearIntent relevance |
| --- | --- | --- | --- |
| [MetaMask/metamask-extension](https://github.com/MetaMask/metamask-extension) | Browser extension wallet | not asserted | Primary injected wallet behavior reference for browser signing. |
| [MetaMask/metamask-mobile](https://github.com/MetaMask/metamask-mobile) | Mobile wallet | not asserted | Mobile signing behavior reference if MetaMask Mobile enters the WalletConnect path. |
| [MetaMask/core](https://github.com/MetaMask/core) | Shared wallet packages | MIT | Useful for provider, controller, and signing package references. |
| [MetaMask/eth-sig-util](https://github.com/MetaMask/eth-sig-util) | Signing utilities | not asserted | Useful EIP-712 typed-data utility reference. |

## ClearIntent implication

MetaMask is the first low-friction software-wallet candidate. Treat wallet-rendered typed-data preview as unverified until the exact ClearIntent payload is tested.
