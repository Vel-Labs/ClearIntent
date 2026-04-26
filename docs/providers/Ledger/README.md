# Ledger Provider Funnel

Ledger is the ClearIntent provider for hardware-backed signing posture, human-readable transaction review, and ERC-7730 Clear Signing metadata.

Current ClearIntent claim level: `Planned`.

## Read first

1. [Ledger Clear Signing overview](https://developers.ledger.com/docs/clear-signing/overview) - high-level developer entrypoint.
2. [How to add Clear Signing to your dApp](https://developers.ledger.com/docs/clear-signing/for-dapps/get-started) - metadata production and submission flow.
3. [Manual ERC-7730 metadata creation](https://developers.ledger.com/docs/clear-signing/for-dapps/manual-implementation) - advanced files, EIP-712, multi-chain, nested data.
4. [Validate and submit](https://developers.ledger.com/docs/clear-signing/for-dapps/validate-submit) - validation and registry PR flow.
5. [ERC-7730 specification](https://developers.ledger.com/docs/clear-signing/reference/specifications) - technical reference.
6. [Clear Signing registry](https://github.com/LedgerHQ/clear-signing-erc7730-registry) - GitHub registry for metadata submissions.

## ClearIntent fit

| ClearIntent need | Ledger surface | Implementation note |
| --- | --- | --- |
| Typed signing | EIP-712 support, Clear Signing metadata support | EIP-712 is MVP; native device display depends on tooling and submission status. |
| Human-readable approval | ERC-7730 metadata and local preview UI | Generate metadata and compare local preview to signed payload fields. |
| Hardware-backed approval | Ledger signer integration | Keep signer adapter narrow and explicit about unsupported/degraded paths. |
| Auditability | Registry PR, metadata files, validation logs | Store metadata file, validator output, signer status, and warning state in audit bundle. |

## Taxonomy

### Clear Signing

Ledger's developer docs frame Clear Signing as a display layer that translates smart contract calldata and EIP-712 messages into human-readable fields. It does not change transaction data.

ClearIntent usage: the signing plane should show exactly what the user is authorizing. If the device cannot display all fields natively, the UI and audit bundle must mark the flow as degraded or blind-signing-adjacent.

Source: [Clear Signing overview](https://developers.ledger.com/docs/clear-signing/overview).

### ERC-7730

ERC-7730 metadata files bind contract deployments or EIP-712 schemas to display metadata. The documented structure includes `context`, `metadata`, and `display` sections.

ClearIntent usage: once ClearIntent has deployed contracts and finalized EIP-712 schemas, generate ERC-7730-compatible JSON for the signed intent surface.

Source: [ERC-7730 specification](https://developers.ledger.com/docs/clear-signing/reference/specifications).

### Metadata creation

Ledger docs support a JSON Builder for simple single-contract cases and manual implementation for EIP-712, multi-chain deployments, nested tuples, reusable includes, address matching, and factory/proxy contexts.

ClearIntent usage: manual implementation is likely the right path because ClearIntent's main signing payload is EIP-712 typed intent data.

Sources: [Get started](https://developers.ledger.com/docs/clear-signing/for-dapps/get-started), [Manual implementation](https://developers.ledger.com/docs/clear-signing/for-dapps/manual-implementation).

### Validation and registry submission

Ledger docs describe validating metadata with the ERC-7730 validator and submitting files to the Clear Signing registry by pull request.

ClearIntent usage: until a registry PR is merged and a real signer flow displays fields, repo claims should say `ERC-7730 metadata generated` or `local readable preview`, not full Clear Signing.

Source: [Validate and submit](https://developers.ledger.com/docs/clear-signing/for-dapps/validate-submit).

## Implementation cautions

- Do not claim full Clear Signing support before a real hardware/signer path is verified.
- Do not imply that a local web preview equals secure-screen confirmation.
- Do not omit fields from the readable display that affect authority, value, nonce, deadline, policy hash, executor, chain ID, or verifying contract.
- Store blind-signing fallback visibility in execution/audit evidence.

## Local follow-ups

- Finalize the EIP-712 intent schema before generating ERC-7730 metadata.
- Decide whether the MVP includes a Ledger hardware test or a hardware-adapter scaffold plus honest degraded status.
- Add deterministic validation for ERC-7730 JSON once metadata exists.
