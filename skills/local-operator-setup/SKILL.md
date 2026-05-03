---
name: local-operator-setup
description: Use when guiding a user or agent through local ClearIntent SDK setup, external secrets creation, 0G live binding preparation, or hosted-wizard resume from local artifacts.
---

# Local Operator Setup

Use this skill when ClearIntent setup needs a local helper path instead of a hosted backend signer. The goal is to let the hosted wizard guide the user while keeping private keys out of the browser and out of the repo.

## Boundary

- The frontend may guide, prepare, and import setup artifacts.
- The local CLI may use `~/.clearintent/clearintent.secrets.env` for operator-owned 0G writes.
- The user manually pastes private keys into the external secrets file. Agents must not ask the user to paste private keys into chat.
- The local helper returns public artifact references only: `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, `clearintent.version`, and transaction hashes.

## Read First

- `AGENTS.md`
- `skills/credential-safety/SKILL.md`
- `packages/center-cli/README.md`
- `operator-secrets/README.md`
- `operator-secrets/clearintent.secrets.env.example`
- `docs/roadmaps/May-2-Sprint.md`

## Recommended Flow

1. Confirm dependencies are installed:

```bash
npm install
```

2. Create the external operator secrets directory:

```bash
mkdir -p ~/.clearintent
cp operator-secrets/clearintent.secrets.env.example ~/.clearintent/clearintent.secrets.env
```

3. Tell the user to edit the external file locally and add only the required values:

```env
ZERO_G_WALLET_ADDRESS=0x...
ZERO_G_PRIVATE_KEY=...
```

4. Validate without printing secrets:

```bash
npm run clearintent -- credentials status
npm run validate:credentials
```

5. Check live readiness:

```bash
npm run clearintent -- memory live-status
```

6. Run live binding only after the user explicitly approves live 0G writes:

```bash
npm run clearintent -- memory live-bindings
```

7. Return only the public setup bundle to the dashboard:

```text
agent.card
policy.uri
policy.hash
audit.latest
clearintent.version
0G tx hashes
```

## Hosted Wizard Resume Contract

The dashboard should resume from a portable setup bundle:

```json
{
  "schemaVersion": "clearintent.setup-artifacts.v1",
  "agentEnsName": "name.agent.clearintent.eth",
  "parentWallet": "0x...",
  "agentAccount": "0x...",
  "records": {
    "agent.card": "0g://...",
    "policy.uri": "0g://...",
    "policy.hash": "0x...",
    "audit.latest": "0g://...",
    "clearintent.version": "0.1.0"
  },
  "artifacts": {
    "policyTxHash": "0x...",
    "auditTxHash": "0x...",
    "agentCardTxHash": "0x..."
  }
}
```

## Stop Conditions

Stop and report before proceeding if:

- a private key, seed phrase, API token, or secrets file content appears in chat or git diff
- `.env.local`, `.env`, or `~/.clearintent/clearintent.secrets.env` is tracked
- live writes are enabled but the user has not explicitly approved a live/testnet write
- the dashboard import bundle contains secrets instead of public refs
