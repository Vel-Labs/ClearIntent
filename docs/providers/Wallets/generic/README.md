# Generic Signer Standards

Generic signer standards are the portable substrate for ClearIntent wallet support.

Read these before implementing wallet-specific adapters:

1. [EIP-712 typed structured data](eip712.md)
2. [ERC-7730 structured data clear signing metadata](erc7730.md)
3. [ClearIntent signer adapter contract](signer-adapter-contract.md)

## Rule

Wallet-specific integrations should consume the same ClearIntent typed intent and metadata model. They should not create private intent, policy, review, risk, or audit shapes.
