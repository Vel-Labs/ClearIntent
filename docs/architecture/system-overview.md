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

## Product surfaces

ClearIntent has two complementary surfaces:

| Surface | Purpose |
| --- | --- |
| Hosted dashboard | A stateless wallet-gated control and audit surface. It lets a user connect a parent wallet, create or connect an agent wallet/smart account, configure policy, and view ENS/0G/onchain/KeeperHub evidence. It must not become the custody layer or private database of authority. |
| Local SDK/CLI/runtime | The builder and agent-facing runtime. It loads the user's configured identity, policy pointers, and execution settings; validates proposed intents; and submits only verified work through adapters such as KeeperHub. |

The preferred user path starts in the dashboard, then moves to the SDK:

```text
parent wallet connects to hosted dashboard
  -> user creates or connects an agent wallet / smart account
  -> user configures policy and escalation rules
  -> policy and audit pointers are stored through 0G and ENS
  -> user installs/runs the ClearIntent SDK or CLI with those pointers
  -> agent proposes intents through the SDK
  -> ClearIntent validates, blocks, escalates, signs, executes, and audits
```

The hosted dashboard may help the user prepare configuration, but agents should receive only scoped configuration and public or delegated references:

- ENS name or record pointers
- 0G policy URI/hash and audit URI
- KeeperHub/executor configuration
- allowed action parameters and escalation thresholds
- session-key or agent-wallet address when available

Agents must not receive the parent wallet seed phrase, parent private key, unrestricted hot-wallet key, or hidden authority that bypasses ClearIntent verification.

## Design rule

The project should remain useful even if one adapter is swapped out. ENS, 0G, KeeperHub, software wallets, WalletConnect, smart accounts, and hardware signing are important integration paths, but the framework boundary should be clear enough to support other adapters later.
