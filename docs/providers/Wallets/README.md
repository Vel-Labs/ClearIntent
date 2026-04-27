# Wallets and Signers

ClearIntent supports signer adapters across injected wallets, WalletConnect wallets, smart wallets, and hardware-backed wallets. The baseline integration target is EIP-712 typed intent signing plus ClearIntent's own human-readable approval metadata. Wallet-specific rendering and secure-screen guarantees are reported separately by tested capability level.

ClearIntent is not betting on one wallet. It makes agent authority portable across wallet surfaces, while reporting the assurance level honestly.

## Integration classes

| Class | Path | Role |
| --- | --- | --- |
| Software wallets | [software/](software/README.md) | Browser-injected and extension wallets that can sign typed intents. |
| WalletConnect wallets | [walletconnect/](walletconnect/README.md) | Mobile and app wallets reached through WalletConnect sessions. |
| Hardware wallets | [hardware/](hardware/README.md) | Physical or hardware-backed signers with device or app confirmation surfaces. |
| Smart accounts | [smart-accounts/](smart-accounts/README.md) | Contract accounts and embedded account systems that verify typed signatures. |
| Generic standards | [generic/](generic/README.md) | EIP-712, ERC-7730, and the ClearIntent signer adapter contract. |

## Capability levels

Wallet support is tracked by capability, not brand promise.

| Level | Name | Meaning |
| --- | --- | --- |
| L0 | Researched only | Public docs or repositories have been reviewed, but no adapter exists. |
| L1 | Adapter scaffolded | ClearIntent has a typed adapter shape or placeholder for the wallet class. |
| L2 | EIP-712 signable | The wallet path can sign ClearIntent typed intent payloads in a tested flow. |
| L3 | ClearIntent app preview verified | The ClearIntent app or CLI shows the same human-readable intent metadata before signing. |
| L4 | Wallet-rendered typed-data preview verified | The wallet itself renders meaningful typed-data or transaction preview fields. |
| L5 | Secure-device display verified | A hardware or secure device display shows meaningful signing details in the tested path. |
| L6 | Vendor-approved Clear Signing verified | The wallet vendor has approved the metadata or app path and the secure display flow is tested. |

## Claim rule

ClearIntent may claim `clear-signing-ready` when it produces bounded typed intents and human-readable metadata suitable for signer rendering. It may claim official secure-screen Clear Signing only for a tested wallet path with required vendor approval.

The current product guarantee is readability and authority binding before signing: policy, executor, deadline, value bounds, nonce, signer, intent hash, and audit references must be visible through ClearIntent's review surface. Wallet-rendered and secure-device-rendered guarantees are additive assurance layers.

## Demo direction

The detailed demo strategy lives in [hackathon/wallet-demo-strategy.md](../../hackathon/wallet-demo-strategy.md). The preferred demo should show the same ClearIntent intent moving across multiple wallet surfaces:

1. ClearIntent app renders the human-readable approval metadata.
2. A software wallet such as MetaMask signs the EIP-712 intent.
3. A WalletConnect or mobile wallet path shows accessibility beyond one browser extension.
4. A hardware-backed wallet path, ideally Ledger when available, shows the stronger secure-screen direction.
5. The audit bundle proves the flows map back to the same intent hash, policy hash, review checkpoint, and signer result.

The visual story should be progressive: meet users where they operate, then show stronger assurance where hardware or vendor support is available.
