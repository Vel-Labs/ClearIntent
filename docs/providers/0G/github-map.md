# 0G GitHub Map

Source: [0gfoundation GitHub organization](https://github.com/0gfoundation). Snapshot gathered 2026-04-25 from the GitHub API.

## Repositories most relevant to ClearIntent

| Repository | Surface | ClearIntent relevance |
| --- | --- | --- |
| [0gfoundation/0g-doc](https://github.com/0gfoundation/0g-doc) | Documentation source | Trace docs edits and examples back to source. |
| [0gfoundation/0g-ts-sdk](https://github.com/0gfoundation/0g-ts-sdk) | TypeScript SDK | Likely adapter dependency for a Node/TypeScript implementation. |
| [0gfoundation/0g-storage-ts-starter-kit](https://github.com/0gfoundation/0g-storage-ts-starter-kit) | TypeScript storage starter | Useful for upload/download scripts and browser examples. |
| [0gfoundation/0g-storage-web-starter-kit](https://github.com/0gfoundation/0g-storage-web-starter-kit) | Web storage starter | Useful if demo console needs browser-side uploads. |
| [0gfoundation/0g-storage-client](https://github.com/0gfoundation/0g-storage-client) | Go client and CLI | Reference for CLI behavior and proof-enabled retrieval. |
| [0gfoundation/0g-storage-node](https://github.com/0gfoundation/0g-storage-node) | Storage node | Node-level operations, not likely app dependency. |
| [0gfoundation/0g-storage-kv](https://github.com/0gfoundation/0g-storage-kv) | Storage KV | Potential fit for mutable pointers or latest-audit indexes. |
| [0gfoundation/0g-compute-ts-starter-kit](https://github.com/0gfoundation/0g-compute-ts-starter-kit) | Compute starter | Optional risk/reflection integration. |
| [0gfoundation/0g-serving-user-broker](https://github.com/0gfoundation/0g-serving-user-broker) | Compute serving broker SDK | Potential compute account/provider layer. |
| [0gfoundation/0g-agent-nft](https://github.com/0gfoundation/0g-agent-nft) | ERC-7857 / INFT contracts | Stretch only. |
| [0gfoundation/mcp-0g](https://github.com/0gfoundation/mcp-0g) | MCP integration | Supplemental if an agent tool path is needed. |

## Repositories likely out of MVP scope

- DA rollup integrations: `0g-da-client`, `0g-da-node`, `0g-da-contract`, `0g-da-op-plasma`, Nitro and zkEVM forks.
- Validator/node operations: node and deployment scripts unless ClearIntent runs infrastructure.
- DeFi forks and benchmarking repos unless the demo becomes chain-performance oriented.

## Auditability note

The repository list changes over time. Treat this file as a routing map, not canonical dependency truth. Pin package versions and commit hashes in implementation docs once code imports any 0G package.
