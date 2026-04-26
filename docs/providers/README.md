# Provider Documentation Funnel

This folder is the local source map for provider material ClearIntent expects to touch during implementation.

The goal is not to mirror each provider's full documentation. The goal is to keep a concise, auditable funnel of the public docs, repositories, and integration facts that matter to ClearIntent's authority lifecycle.

## Project-critical provider docs

| Provider | ClearIntent role | Start here | Local notes |
| --- | --- | --- | --- |
| 0G | Policy memory, audit artifacts, optional compute/reflection, optional iNFT stretch | [0G docs](https://docs.0g.ai/), [0G GitHub](https://github.com/0gfoundation) | [0G overview](0G/README.md) |
| ENS | Canonical agent identity, text-record discovery, subname roles, optional ENSIP-25 alignment | [ENS Building with AI](https://docs.ens.domains/building-with-ai), [ENS docs](https://docs.ens.domains/), [ENS GitHub](https://github.com/ensdomains) | [ENS overview](ENS/README.md) |
| KeeperHub | Execution and reliability adapter after ClearIntent verification | [KeeperHub docs](https://docs.keeperhub.com/), [KeeperHub GitHub](https://github.com/KeeperHub/keeperhub) | [KeeperHub overview](KeeperHub/README.md) |
| Ledger | Human-readable signing posture, ERC-7730 metadata, hardware signer adapter constraints | [Ledger Clear Signing overview](https://developers.ledger.com/docs/clear-signing/overview), [Clear Signing registry](https://github.com/LedgerHQ/clear-signing-erc7730-registry) | [Ledger overview](Ledger/README.md) |

## ClearIntent integration map

| ClearIntent plane | Provider docs to read first | Why it matters |
| --- | --- | --- |
| Identity plane | ENS text records, resolution, Universal Resolver, subnames, ENSIP-25 | Agent identity must be resolved from ENS records rather than hidden configuration. |
| Memory and audit plane | 0G Storage SDK, Storage CLI, storage node/indexer docs, 0G Chain/testnet docs | Policies, intents, risk reports, signatures, and execution receipts need durable artifact pointers. |
| Optional risk/reflection compute | 0G Compute inference and account docs | Compute is useful only if it produces inspectable risk or reflection outputs; it is not required for the MVP. |
| Signing plane | Ledger Clear Signing, ERC-7730 specification, registry submission flow | ClearIntent can generate EIP-712 intents and readable metadata, but must not overclaim device-native Clear Signing unless proven. |
| Execution plane | KeeperHub workflows, API, direct execution, MCP server, CLI, runs/logs, gas and wallet docs | KeeperHub should receive only approved, verified intents and return execution evidence. |

## Supplemental docs worth keeping nearby

- 0G INFT and ERC-7857 docs are stretch material only. They may support future private agent payload or iNFT claims, but they should not enter MVP scope unless the core lifecycle is stable.
- ENS Name Wrapper and subname registrar docs are useful for role-based subnames, but wrapped-name constraints should not block basic identity resolution.
- KeeperHub paid workflows, x402 references, and agentic wallet docs are useful after the execution adapter works.
- Ledger registry tooling and validator docs matter once ClearIntent has actual deployed contracts and EIP-712 schemas to describe.

## Audit rule

Every provider file in this folder must include:

- source URLs
- GitHub repository or org page when a claim comes from GitHub
- a ClearIntent relevance note
- current claim level, usually `Planned` until implementation evidence exists

Source snapshot for this initial consolidation: 2026-04-25 local workspace run.
