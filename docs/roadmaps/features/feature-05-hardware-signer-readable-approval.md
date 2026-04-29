# Feature 05: Wallet Signer Adapters and Readable Approval

## Purpose

Provide signer adapters that let humans approve bounded EIP-712 intents across software wallets, WalletConnect wallets, smart accounts, and hardware-backed wallets where practical.

Phase 5 should make signing portable without overstating wallet display guarantees. ClearIntent owns the typed payload, human-readable approval preview, and audit vocabulary. Wallets and devices provide signer-specific evidence only after tested utilization.

## Dependencies

- Feature 01 intent schema
- Feature 03 identity binding if included in signed payload
- Phase 2B / 3B / 4B live evidence before end-to-end demo claims

## Goals

- generate EIP-712 typed data
- show readable approval preview
- define signer adapter interfaces that work for software, WalletConnect, smart-account, and hardware paths
- sign intent through deterministic/local fixture behavior first
- report display status honestly
- report wallet capability level honestly
- emit ERC-7730-compatible metadata locally where feasible
- support policy-triggered human review prompts for thresholded autonomy modes

## Non-goals

- branding ClearIntent as a Ledger product
- claiming official secure-screen Clear Signing without provider approval and proof
- hiding blind-signing fallback
- claiming real wallet utilization from mocked or local fixture signatures
- adding Guardian Agent, dashboard, deploy, or hosted app scope in Phase 5A/5B

## Claim levels

- `signer-local-fixture`: local deterministic signing fixture and adapter contracts only.
- `eip712-local-fixture`: deterministic EIP-712 typed payload and preview generation only.
- `erc7730-local-metadata`: local metadata generation only, with no wallet/vendor approval claim.
- `software-wallet-tested`: a real injected/software wallet path signed the ClearIntent typed payload in a recorded or audited test.
- `walletconnect-tested`: a real WalletConnect/mobile path signed the ClearIntent typed payload in a recorded or audited test.
- `hardware-wallet-tested`: a real hardware-backed path signed the ClearIntent typed payload in a recorded or audited test.
- `secure-device-display-verified`: device-side meaningful display is proven in the tested path.
- `vendor-clear-signing-approved`: vendor approval plus tested signer/display path exists.

Do not claim a stronger signer capability than the evidence proves.

## Subphases

### Phase 5A: Signer Payload and Local Approval Scaffold

Goal: build the local signer/payload foundation that every real wallet path can consume.

Allowed scope:

- `packages/signer-adapter/` or equivalent signer package
- EIP-712 typed-data domain and message mapping from canonical `AgentIntent`
- signer adapter interface usable by software wallets, WalletConnect, smart accounts, and hardware-backed paths
- human-readable ClearIntent approval preview for action, policy, executor, deadline, nonce, signer, identity, value bounds, and audit refs
- deterministic/mock signature fixture
- signature evidence output compatible with `packages/core`
- display capability and display-status vocabulary
- blind/limited-display warnings
- conditional review prompt semantics for policy-triggered escalation
- Center CLI signer status if it stays thin and honest
- midpoint and closeout audits

Stop point:

- No real wallet claim.
- No injected wallet, WalletConnect, hardware, secure-device, or vendor Clear Signing claim.
- No Guardian Agent, dashboard, deploy, or hosted/browser app scope.

### Phase 5B: ERC-7730 / Clear Signing Metadata Local Scaffold

Goal: generate local metadata artifacts that can support wallet/vendor readable-display work later.

Allowed scope:

- ERC-7730-compatible metadata/config generation if feasible
- metadata validation or deterministic fixture tests
- mapping from ClearIntent typed fields to readable display labels
- explicit capability output showing `erc7730-local-metadata` only

Stop point:

- No vendor approval claim.
- No secure-screen claim.
- No wallet-rendered preview claim without tested wallet evidence.

### Phase 5C: Software Wallet Validation

Goal: test a real injected/software wallet path, with MetaMask as the preferred first candidate because it is the lowest-friction EIP-712 validation target.

Allowed scope:

- EIP-1193/injected-provider adapter implementation behind the Phase 5A interface
- actual EIP-712 signature request against the ClearIntent typed payload
- captured signature output
- audited note or screenshot/recording of wallet-rendered fields when available
- Center CLI or documented manual test command that reports exact claim level

Dependencies:

- Phase 5A complete
- operator-controlled browser wallet session and test account

Timing:

- May run after 5A/5B for signer-only EIP-712 validation.
- Should be repeated after Phase 2B / 3B / 4B live-testnet evidence for true end-to-end validation.

Stop point:

- Claim only `software-wallet-tested` unless wallet-rendered preview evidence supports a stronger level.
- Do not claim secure-device display or vendor Clear Signing.

### Phase 5D: WalletConnect / Mobile Validation

Goal: test a real WalletConnect/mobile wallet path after the payload and software-wallet path are stable.

Dependencies:

- Phase 5A complete
- preferably Phase 5C complete
- operator-controlled WalletConnect/mobile wallet session

Stop point:

- Claim only `walletconnect-tested` unless wallet-rendered preview evidence supports a stronger level.

### Phase 5E: Hardware / Secure Display Validation

Goal: test hardware-backed signing paths and report secure-display evidence honestly.

Candidate paths:

- Ledger
- Trezor
- Tangem
- hardware-backed WalletConnect path where practical

Stop point:

- Claim `hardware-wallet-tested` only after an actual hardware-backed signature.
- Claim `secure-device-display-verified` only after device-side meaningful display evidence.
- Claim `vendor-clear-signing-approved` only after vendor approval plus tested path.

## Success criteria

- 5A: typed intent payload, readable preview, signer adapter contract, fixture signature, display warnings, and local tests exist.
- 5B: ERC-7730/readable metadata is generated locally and explicitly labeled as local metadata only.
- 5C: a software wallet signs the ClearIntent EIP-712 payload in a tested path.
- 5D: WalletConnect/mobile signs the ClearIntent EIP-712 payload in a tested path.
- 5E: hardware-backed signing and any secure-display claims are backed by device evidence.
- All phases: display limitations are documented and conditional review prompts explain the trigger before requesting approval.
