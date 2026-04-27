# Demo Plan

Target length: 2:45 to 2:55.

## Demo objective

Prove ClearIntent is a reusable authority layer, not just a one-off agent.

## Video structure

### 0:00-0:20: Problem

Agents can reason, but giving them unchecked execution authority is unsafe.

### 0:20-0:45: ClearIntent overview

Show architecture diagram:

```text
ENS identity -> 0G policy/audit -> typed intent -> human approval -> signed execution -> KeeperHub receipt
```

### 0:45-1:20: Agent identity and policy

Show the Guardian Agent ENS name resolving:

- agent card
- policy URI
- audit pointer
- executor role

### 1:20-1:55: Agent proposes intent

Prompt the agent. Show:

- proposed action
- policy bounds
- risk/reflection report
- intent hash

### 1:55-2:25: Human approval

Show the readable signing payload and at least one signer flow.

Preferred visual: start with the ClearIntent approval preview, then show the same EIP-712 intent in a software wallet such as MetaMask. If time and implementation allow, progressively split the screen with a WalletConnect/mobile path, then end with a full-screen hardware-wallet approval moment.

Be precise about what is shown in-app, what is rendered by the wallet, what is rendered on a secure device, and what is vendor-approved Clear Signing.

### 2:25-2:40: KeeperHub execution

Show workflow execution and receipt.

### 2:40-2:55: Audit trail and close

Show 0G audit artifact and final message:

> The agent can propose, but it cannot exceed signed authority.

## Avoid

- long setup footage
- unexplained standards soup
- claiming stretch features that are not shown
- claiming official secure-screen Clear Signing without provider approval and tested device evidence
- AI voiceover
- shaky mobile phone screen recording
- videos under 720p
