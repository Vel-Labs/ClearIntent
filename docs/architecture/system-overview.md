# System Overview

ClearIntent is built around one question:

> What must be true before an autonomous agent is allowed to execute?

The answer is expressed as a lifecycle:

```text
identity -> policy -> proposal -> review -> signed intent -> verification -> execution -> audit
```

## Main modules

| Module | Purpose |
| --- | --- |
| `core` | authority lifecycle and schemas |
| `ens-identity` | agent identity and metadata resolution |
| `zerog-memory` | policy and audit persistence |
| `zerog-compute` | optional risk/reflection inference |
| `signer-hardware` and future wallet signer adapters | EIP-712 signing, wallet capability status, and display status |
| `keeperhub-adapter` | execution workflow integration |
| `guardian-agent` | working example agent |

## Design rule

The project should remain useful even if one adapter is swapped out. ENS, 0G, KeeperHub, software wallets, WalletConnect, smart accounts, and hardware signing are important integration paths, but the framework boundary should be clear enough to support other adapters later.
