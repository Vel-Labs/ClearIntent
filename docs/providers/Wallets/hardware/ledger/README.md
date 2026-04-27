# Ledger

Current level: L0 researched only.

Target level: L2-L3 for typed signing plus ClearIntent preview, L5-L6 for official secure-screen Clear Signing after provider approval and device testing.

Expected path: EIP-712 typed intent signing with ERC-7730-compatible metadata where feasible.

Local device tested: no.

## Claim wording

ClearIntent produces clear-signing-ready typed intents and human-readable approval metadata. Official Ledger secure-screen Clear Signing requires provider approval for the relevant metadata or app path. Until that approval is complete and tested, Ledger-backed secure-screen rendering remains an adapter certification target rather than a completed claim.

## ClearIntent relevance

- Generate EIP-712 typed intents.
- Generate or scaffold ERC-7730-compatible metadata where feasible.
- Record whether Ledger displayed the intended fields on the device.
- Store metadata, validation logs, display status, and warnings in the audit bundle.

Sources:

- [Ledger Clear Signing overview](https://www.ledger.com/academy/glossary/clear-signing)
- [ERC-7730 specification](https://ercs.ethereum.org/ERCS/erc-7730)
- [Ledger Clear Signing registry](https://github.com/LedgerHQ/clear-signing-erc7730-registry)
- [LedgerHQ GitHub organization](https://github.com/LedgerHQ)
- [Ledger source notes](source-notes.md)
- [Ledger GitHub map](github-map.md)
