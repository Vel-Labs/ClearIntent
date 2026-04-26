# Ledger GitHub Map

Sources: [LedgerHQ GitHub organization](https://github.com/LedgerHQ), [Clear Signing registry](https://github.com/LedgerHQ/clear-signing-erc7730-registry). Snapshot gathered 2026-04-25 from the GitHub API.

## Repositories most relevant to ClearIntent

| Repository | Surface | License observed | ClearIntent relevance |
| --- | --- | --- | --- |
| [LedgerHQ/clear-signing-erc7730-registry](https://github.com/LedgerHQ/clear-signing-erc7730-registry) | Registry for ERC-7730 metadata | CC0-1.0 | Submission target once ClearIntent has deployable metadata. |
| [LedgerHQ/clear-signing-erc7730-builder](https://github.com/LedgerHQ/clear-signing-erc7730-builder) | Metadata builder | Apache-2.0 | Useful for generating starter metadata. |
| [LedgerHQ/python-erc7730](https://github.com/LedgerHQ/python-erc7730) | Validation/utilities | Apache-2.0 | Useful for CI validation. |
| [LedgerHQ/erc7730-analyzer](https://github.com/LedgerHQ/erc7730-analyzer) | Analyzer | CC0-1.0 | Supplemental metadata quality tooling. |
| [LedgerHQ/erc-7730-workshop](https://github.com/LedgerHQ/erc-7730-workshop) | Workshop material | not asserted | Developer learning reference. |
| [LedgerHQ/app-ethereum](https://github.com/LedgerHQ/app-ethereum) | Ethereum app for Ledger devices | Apache-2.0 | Low-level behavior reference, not likely direct dependency. |

## Auditability note

For ClearIntent, the authoritative project artifact will be the metadata JSON and validation output in this repository, plus any registry PR URL if submitted. Ledger repository existence alone is not evidence that device-native Clear Signing works for ClearIntent.
