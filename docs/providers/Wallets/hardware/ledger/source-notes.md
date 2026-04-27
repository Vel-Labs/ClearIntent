# Ledger Source Notes

Parent wallet note: [README.md](README.md).

## Sources reviewed

- [Ledger Clear Signing overview](https://developers.ledger.com/docs/clear-signing/overview)
- [How to add Clear Signing to your dApp](https://developers.ledger.com/docs/clear-signing/for-dapps/get-started)
- [Manual ERC-7730 metadata implementation](https://developers.ledger.com/docs/clear-signing/for-dapps/manual-implementation)
- [Validate and submit metadata](https://developers.ledger.com/docs/clear-signing/for-dapps/validate-submit)
- [ERC-7730 specification](https://developers.ledger.com/docs/clear-signing/reference/specifications)
- [LedgerHQ Clear Signing registry](https://github.com/LedgerHQ/clear-signing-erc7730-registry)

## Project-useful facts

- Ledger Clear Signing is display metadata for readable transaction review; it does not alter calldata.
- EVM Clear Signing is tied to ERC-7730 metadata.
- Metadata can cover contract calls and EIP-712 messages.
- Submission is through a GitHub pull request to the registry after validation.
- ClearIntent should keep official secure-screen Clear Signing as a proven claim, not a planning claim.
- ClearIntent may claim clear-signing-ready typed intents and human-readable metadata when those artifacts exist and are validated.

## Claims to verify during implementation

- Whether ClearIntent's EIP-712 schema fits ERC-7730 display requirements without custom plugin work.
- Whether Ledger tooling can validate the generated metadata in CI.
- Whether any actual Ledger signer in the demo displays the intended fields.
- Whether registry submission or another provider approval path is available for hackathon evidence.
