# MetaMask

Current level: L0 researched only.

Phase 5C prep status: `planned` / `ready-for-operator-test` only if request-shape/status scaffolding lands. No real MetaMask validation claim exists without operator-run evidence.

Target level: L2 EIP-712 signable, then L3 ClearIntent app preview verified and L4 wallet-rendered typed-data preview verified if the wallet renders the needed fields clearly.

Expected path: injected provider using `eth_signTypedData_v4` or equivalent library integration.

Local device tested: no.

Operator-reported planned test version: MetaMask `13.27.0`. Treat this as operator context, not a durable current-version claim. Phase 5C validation must record the exact installed wallet version at test time.

Primary network target: Ethereum and Ethereum testnets. Other EVM chains may be considered only if they require minimal translation and do not distract from the Ethereum/ENS hackathon path.

ClearIntent claim wording:

> MetaMask is a planned software wallet path for signing ClearIntent EIP-712 typed intents. ClearIntent will report wallet-rendered readability only after the exact payload is tested.

Required evidence before promotion:

- exact MetaMask version at test time
- browser and network
- chain ID
- redacted or test-only account address
- typed-data payload hash
- signature result, redacted if needed
- observed wallet display behavior
- explicit note that signer-only validation is not end-to-end 0G/ENS/KeeperHub execution validation

Do not promote this path to `software-wallet-tested` from local fixtures, mocked provider calls, or request-shape generation alone.

Sources:

- [EIP-712 specification](https://eips.ethereum.org/EIPS/eip-712)
- [EIP-1193 provider API](https://eips.ethereum.org/EIPS/eip-1193)
- [MetaMask sign data docs](https://metamask.github.io/mm-docs-v2/87-onboarding/wallet/how-to/sign-data/)
- [MetaMask eth-sig-util](https://metamask.github.io/eth-sig-util/latest/)
- [MetaMask GitHub organization](https://github.com/MetaMask)
- [MetaMask GitHub map](github-map.md)
- [Phase 5 source review](../../PHASE_5_SOURCE_REVIEW.md)
