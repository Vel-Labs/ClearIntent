# Phase 5 Source Review

This note collects the external standards and provider docs needed before Phase 5A, 5B, and 5C implementation.

## Recommendation

Proceed in sequence: Phase 5A local signer payload and approval scaffold, Phase 5B local metadata scaffold, then Phase 5C signer-only MetaMask validation if an operator wallet session is available. Repeat 5C as end-to-end validation after Phase 2B, 3B, and 4B live-testnet evidence exists.

Reason: EIP-712 payload generation, ClearIntent preview, adapter contracts, local fixture signatures, display vocabulary, and ERC-7730 metadata are not onchain-dependent. Real wallet utilization is separate evidence and must remain separately claimed.

Phase 5C operator context at the time this note was updated:

- Operator-reported MetaMask version: `13.27.0`.
- Primary target network family: Ethereum and Ethereum testnets.
- Cross-chain support is desirable only if it requires minimal lift and does not weaken the Ethereum-first hackathon path.
- 5C audits must record the exact installed wallet version at test time rather than relying on this note as current-version proof.

## Phase 5A Sources

### EIP-712

Source: <https://eips.ethereum.org/EIPS/eip-712>

Implementation notes:

- Typed data must include `types`, `primaryType`, `domain`, and `message`.
- The domain should bind user-facing name/version plus chain/verifying contract where applicable.
- `EIP712Domain` field ordering matters for the defined domain type; absent fields should be skipped rather than invented.
- The signed digest is derived from the domain separator and message struct hash.
- ClearIntent should avoid private/non-standard domain fields.

ClearIntent recommendation:

- Use a stable `ClearIntentIntent` primary type rather than mirroring the entire JSON schema as a nested object.
- Include authority-critical fields directly in the signed message: `intentId`, `intentHash`, `policyHash`, `actionHash`, `signer`, `executor`, `nonce`, `deadline`, `chainId`, `verifyingContract`, `valueLimit`, and selected identity/audit refs when available.
- Keep the existing `hashes.intentHash` and contract validation truth above the EIP-712 transport digest. The EIP-712 digest is signing transport evidence, not a replacement for canonical intent hash truth.
- Treat Ethereum and Ethereum testnets as the default Phase 5C chain targets. Do not broaden to other chains unless the EIP-712 domain/message model and wallet behavior remain unchanged or the translation is explicitly isolated.

### EIP-1193

Source: <https://eips.ethereum.org/EIPS/eip-1193>

Implementation notes:

- Browser/injected wallet adapters should use the provider `request(...)` method.
- Provider calls resolve with the RPC method result or reject with `ProviderRpcError`.
- Relevant error codes include `4001` user rejected request, `4100` unauthorized, `4200` unsupported method, `4900` disconnected, and `4901` chain disconnected.

ClearIntent recommendation:

- Phase 5A should define an injected-provider-compatible adapter boundary without requiring a real browser wallet.
- Phase 5C should convert provider errors into typed signer issue codes and never treat user rejection or unsupported method as a crash.

## Phase 5B Sources

### ERC-7730

Source: <https://ercs.ethereum.org/ERCS/erc-7730>

Implementation notes:

- ERC-7730 enriches structured message or transaction data with display/formatting information and value interpolation.
- ERC-7730 can apply to EIP-712 messages.
- For EIP-712 containers, wallets need the signer, verifying contract, and chain ID context where known; missing verifying contract or chain ID can prevent clear signing.

ClearIntent recommendation:

- Generate `erc7730-local-metadata` from the same field map as the ClearIntent preview.
- Treat metadata as local display-support evidence only.
- Do not claim wallet-rendered preview, secure-device display, or vendor Clear Signing approval unless a tested wallet path proves it.
- After 5C succeeds, plan a later chain-driven metadata pass that binds metadata to the selected chain/verifying contract context. Phase 5B remains local metadata generation only.

### Ledger Clear Signing Context

Source: <https://www.ledger.com/academy/glossary/clear-signing>

Implementation notes:

- Clear Signing is about translating opaque transaction data into a human-readable signer display.
- Ledger frames ERC-7730 as standardized metadata for EVM clear signing.

ClearIntent recommendation:

- Use "clear-signing-ready metadata" only for local generated artifacts.
- Reserve "secure-device display verified" and "vendor-approved Clear Signing" for later hardware/vendor-tested evidence.
- Do not frame Clear Signing as Ledger-only. Ledger has a specific Clear Signing ecosystem and registry, but ClearIntent should treat clear signing as the broader goal of human-readable signer display across software wallets, hardware wallets, and metadata-supporting wallet surfaces.

## Phase 5C Sources

### MetaMask Sign Data

Source: <https://metamask.github.io/mm-docs-v2/87-onboarding/wallet/how-to/sign-data/>

Implementation notes:

- MetaMask documents `eth_signTypedData_v4` for typed-data signing.
- MetaMask examples pass JSON-stringified typed data and recover the signer for verification.
- MetaMask warns that raw or binary signing methods can be hard for users to understand; ClearIntent should prefer typed data and app preview.

ClearIntent recommendation:

- MetaMask is the preferred first software-wallet target for `software-wallet-tested`.
- Phase 5C should request `eth_signTypedData_v4` through an EIP-1193 provider.
- Capture wallet version, chain ID, payload hash, signature result, and observed wallet display behavior in an audit note.
- Do not commit private keys, seed phrases, local wallet state, or screenshots with sensitive account details.

### MetaMask eth-sig-util

Source: <https://metamask.github.io/eth-sig-util/latest/>

Implementation notes:

- `TypedDataUtils` can hash EIP-712 domain and message data for V3/V4 compatibility checks.
- Hashing utilities do not sign; the wallet/provider signs the digest.

ClearIntent recommendation:

- Use `ethers` built-in typed-data helpers first because `ethers` is already a repo dependency.
- Consider `@metamask/eth-sig-util` only if implementation needs MetaMask-specific compatibility checks.

## Questions, Concerns, and Best-Fit Recommendations

### 1. Should 5A define one generic package or wallet-specific packages?

Recommendation: use one generic `packages/signer-adapter/` package first.

Why: the repo goal is wallet-neutral authority. A generic package prevents MetaMask, WalletConnect, and hardware paths from diverging on payload shape or display vocabulary.

Specialized adapters are allowed only when a provider has real behavior that cannot be expressed through the generic interface. They should be light translations over the generic payload/preview/signature contract, not separate signing truth.

### 2. Should MetaMask be wired during 5A?

Recommendation: no real MetaMask dependency in 5A. Define the EIP-1193-compatible adapter boundary and mocked provider tests in 5A; perform real MetaMask signing in 5C.

Why: real MetaMask needs browser/operator utilization. Keeping it in 5C preserves honest claim levels while still letting 5C run early as signer-only validation.

Current sequence: implement 5A, then 5B, then 5C. After 5C signer-only validation, return to the 2B/3B/4B live-testnet vertical path.

### 3. Should 5B be completed with 5A?

Recommendation: yes, if it stays local metadata generation and validation only.

Why: ERC-7730 metadata uses the same field map as the ClearIntent preview. Building it with 5A reduces duplicate display wording and keeps future wallet testing consistent.

### 4. Should Phase 5 wait for 2B/3B/4B?

Recommendation: 5A and 5B should not wait. 5C can run signer-only after 5A/5B, then repeat end-to-end after 2B/3B/4B live-testnet evidence.

Why: signing payloads are horizontal surface area. End-to-end execution proof is vertical provider evidence.

### 5. What must not be claimed after 5A/5B?

Recommendation: claim only `signer-local-fixture`, `eip712-local-fixture`, and `erc7730-local-metadata`.

Why: local payloads, previews, fixture signatures, and generated metadata do not prove real wallet display, secure-device display, or vendor Clear Signing.

### 6. Should Phase 5 include non-Ethereum chains?

Recommendation: keep 5A/5B chain-aware but Ethereum-first. Use `chainId` and `verifyingContract` in the EIP-712 domain/message so the shape can generalize, but validate 5C on Ethereum or Ethereum testnets first.

Why: ENS, EIP-712, ERC-7730, and the current provider stack are Ethereum-aligned. Broadening chain support before the Ethereum path is validated would add surface area without improving the immediate hackathon proof.
