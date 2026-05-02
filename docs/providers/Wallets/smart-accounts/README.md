# Smart Accounts

Smart accounts are planned signer surfaces for ClearIntent when the account can verify typed signatures and preserve auditability.

Phase 6 only reports Alchemy/Account Kit public-config readiness in the dashboard. It does not create a smart account, grant a session key, enforce permissions, or prove account-abstraction execution.

## Candidate systems

| System | Expected path | Current level |
| --- | --- | --- |
| [Safe](safe/README.md) | EIP-1271 and Safe message signing flows | L0 researched only |
| [Coinbase Smart Wallet](coinbase-smart-wallet/README.md) | Base/Coinbase smart-account typed signing | L0 researched only |
| [Base Account](base-account/README.md) | EIP-712 and account signature verification | L0 researched only |
| [Privy](privy/README.md) | Embedded wallet typed-data signing | L0 researched only |

## Claim boundary

Smart-account support should prove verification semantics, not only UI signing. The audit bundle must record whether the signer is an EOA, hardware wallet, smart account, embedded wallet, or delegated signer.
