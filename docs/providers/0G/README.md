# 0G Provider Funnel

0G is the ClearIntent provider for decentralized policy memory, audit storage, and optional compute/risk reflection.

Current ClearIntent claim level: `Planned`.

## Read first

1. [0G Documentation](https://docs.0g.ai/) - public developer docs for chain, storage, compute, DA, INFT, nodes, and starter kits.
2. [0G llms.txt](https://docs.0g.ai/llms.txt) - machine-readable index of official docs.
3. [0G GitHub organization](https://github.com/0gfoundation) - open-source repositories for storage, DA, compute serving, SDKs, starter kits, and docs.
4. [0G website](https://0g.ai/) - product-level positioning. Use docs and GitHub for implementation truth.

Recommended starter kits and examples:

- [0G Storage Web Starter Kit](https://github.com/0gfoundation/0g-storage-web-starter-kit) - upload/download, wallet connection, Standard/Turbo mode, and browser app patterns.
- [0G Compute TypeScript Starter Kit](https://github.com/0gfoundation/0g-compute-ts-starter-kit) - broker, provider, ledger/funding, AI query, and TEE verification patterns.
- [0G Deployment Scripts](https://github.com/0gfoundation/0g-deployment-scripts) - Foundry, Hardhat, and Truffle deployment examples for 0G Galileo Testnet.
- [Agentic ID Examples](https://github.com/0gfoundation/agenticID-examples) - ERC-7857 / Agentic ID examples for agent NFTs, encrypted intelligent data, authorization, delegation, and marketplace flows.

Starter-kit rule: use these as provider references and implementation accelerators, not as architecture owners. ClearIntent contracts, core authority behavior, Center CLI semantics, and audit claim levels remain repo-owned.

## ClearIntent fit

| ClearIntent need | 0G surface | Implementation note |
| --- | --- | --- |
| Policy artifact storage | 0G Storage SDK, Storage CLI, storage indexer | Store policy JSON, policy hash, risk reports, signed intents, and execution receipts as retrievable artifacts. |
| Audit trail | 0G Storage and storage explorer/indexer | Each privileged lifecycle should produce a bundle pointer and content hash. |
| Optional risk critic | 0G Compute inference | Useful only if outputs are persisted and tied to the intent/policy hash. |
| Optional onchain deployment | 0G Chain, contracts-on-0G docs | Not required unless the demo deploys ClearIntent contracts to 0G. |
| Optional stretch | INFT / ERC-7857 | Stretch only; do not claim until minted, linked, and inspectable. |

## ClearIntent Phase 2 layering

ClearIntent will use 0G in layers:

### Phase 2A: local adapter semantics

No live 0G credentials are required. This phase proves the artifact model locally:

- individual artifact writes and reads
- content hash validation
- missing/mismatched/degraded storage states
- audit bundle rollup over individual artifact refs
- Center CLI status for local memory/audit

Claim level: `local-adapter`.

### Phase 2B: live 0G Storage

Credentials and network configuration are required. This phase connects the Phase 2A interfaces to real 0G Storage:

- upload artifacts
- capture returned root hash / transaction evidence
- retrieve artifacts
- validate retrieved content hash
- use proof-enabled retrieval when available and practical

Target claim level: `0g-write-read-verified`.

Fallback claim level: `0g-write-read` with proof verification documented as degraded or deferred.

Current evidence: Phase 2B reached `0g-write-read-verified` for live smoke storage. Proof-enabled readback succeeded with `rootHash=0x8ee47b16e03de745ebf2e65e94ed3b7341395f506a5fb7c8e299f9974aa22484` and `txHash=0x024cc777830963d7c23500024554ed7692f3cb7562ec44014780f68bfdaa66b7`. This is smoke evidence, not final demo artifact publication.

### Phase 2C: optional 0G Compute

Compute is not part of the first storage/audit implementation. It is a later optional risk/reflection layer. Any compute output must be persisted as a hash-bound artifact through the memory/audit layer.

## Claim levels

- `local-fixture`: static fixture only
- `local-adapter`: deterministic local write/read adapter
- `0g-write-only`: 0G upload works, but retrieval/hash verification is not proven
- `0g-write-read`: upload and retrieval work
- `0g-write-read-verified`: upload, retrieval, and content/proof verification work

## Taxonomy

### Chain

0G Chain is an EVM-compatible L1 designed for AI workloads. The official docs include testnet and mainnet network settings, smart contract deployment guides, precompiles, and staking interfaces.

ClearIntent usage: only needed if contracts or demo transactions deploy to 0G Chain. Otherwise, treat 0G as storage/compute infrastructure.

Sources: [0G docs](https://docs.0g.ai/), [0G AI coding context](https://docs.0g.ai/docs/ai-context).

### Storage

0G Storage is the primary fit for ClearIntent. The docs cover TypeScript and Go clients, CLI upload/download, KV operations, browser support, indexer usage, and Merkle proof download options.

ClearIntent usage: make `packages/zerog-memory/` the narrow adapter that uploads and retrieves typed artifacts. The adapter should return explicit degraded states when storage or retrieval proof is missing.

## ENS Binding Artifacts

After live smoke evidence is available, `memory live-bindings` publishes the demo policy, audit pointer, and agent-card payloads to 0G and prints the ENS records to set on the selected agent name:

```bash
npm run clearintent -- memory live-bindings
```

The command remains gated by `ZERO_G_ENABLE_LIVE_WRITES=true`, funded 0G credentials, and live readback. Use `ZERO_G_REQUIRE_PROOF=true` for the strongest claim. If `KEEPERHUB_EXECUTOR_ADDRESS` is absent, the upload still produces ENS/0G records but reports `keeperhub_executor_unbound` so the KeeperHub adapter can be bound explicitly before final demo claims.

Sources: [Storage SDK](https://docs.0g.ai/docs/developer-hub/building-on-0g/storage/sdk), [Storage CLI](https://docs.0g.ai/docs/developer-hub/building-on-0g/storage/storage-cli), [Storage Web Starter Kit](https://github.com/0gfoundation/0g-storage-web-starter-kit).

### Compute

0G Compute is a decentralized GPU marketplace with CLI, SDK, provider discovery, account funding, and OpenAI-compatible inference patterns.

ClearIntent usage: optional risk/reflection critic. Do not make this a global brain. Persist any compute output as a risk report artifact.

Sources: [Compute overview](https://docs.0g.ai/docs/developer-hub/building-on-0g/compute-network/overview), [Inference docs](https://docs.0g.ai/docs/developer-hub/building-on-0g/compute-network/inference), [Compute TypeScript Starter Kit](https://github.com/0gfoundation/0g-compute-ts-starter-kit).

### Data availability

0G DA is aimed at scalable data availability for rollups, appchains, and high-throughput workloads.

ClearIntent usage: likely supplemental for MVP. It may become relevant if ClearIntent later publishes rollup/appchain state or high-volume audit streams.

Sources: [0G DA concept](https://docs.0g.ai/docs/concepts/da), [DA integration](https://docs.0g.ai/docs/developer-hub/building-on-0g/da-integration).

### INFT / ERC-7857

0G documents INFTs and ERC-7857 for encrypted AI agent metadata, secure transfer, usage authorization, and TEE/ZKP oracle patterns.

ClearIntent usage: stretch standard only. It can align with private agent payloads or tokenized agent ownership after the MVP lifecycle is proven.

Sources: [INFT overview](https://docs.0g.ai/docs/developer-hub/building-on-0g/inft/inft-overview), [ERC-7857 standard docs](https://docs.0g.ai/docs/developer-hub/building-on-0g/inft/erc7857), [Agentic ID Examples](https://github.com/0gfoundation/agenticID-examples).

## Implementation cautions

- Do not hard-code storage transaction hashes or URIs in the demo. Resolve through fixtures/config and write them to audit output.
- Do not treat a successful upload as sufficient if retrieval or content hash validation is missing.
- Keep local fixtures separate from 0G-backed artifacts.
- Keep compute optional until the policy, intent, and audit schema are stable.

## Local follow-ups

- Define the exact 0G artifact envelope in `packages/core/` before adapter implementation.
- Decide whether the MVP needs storage proof verification or only content-addressed retrieval.
- Add a small fixture set for policy, risk report, signed intent, and execution receipt.
