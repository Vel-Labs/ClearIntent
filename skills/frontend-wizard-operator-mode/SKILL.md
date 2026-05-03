---
name: frontend-wizard-operator-mode
description: Use when designing or implementing hosted dashboard setup steps that choose between local SDK publishing, hosted backend publishing, browser wallet signing, and wizard resume/import behavior.
---

# Frontend Wizard Operator Mode

Use this skill when the hosted ClearIntent wizard needs to explain or implement where authority lives during setup.

## Setup Lanes

### Browser wallet lane

Use for:

- parent wallet connection
- Account Kit smart account derivation/deployment
- ENS subname transaction preparation
- ENS resolver multicall signing

The browser wallet signs these transactions. The server should prepare calldata and evidence, not hold the parent wallet key.

### Local SDK lane

Use for:

- 0G artifact publishing with user-held local secrets
- importing public artifact refs into the dashboard
- security-first onboarding

The wizard pauses at 0G publishing and resumes from an imported setup bundle.

### Hosted backend lane

Use for:

- low-friction demos or user-operated hosted backends
- 0G publishing when the deployment intentionally has a configured operator signer

This lane must clearly warn that the backend can publish 0G artifacts.

## Wizard UX Requirements

- Present local SDK mode as recommended.
- Present hosted mode as fastest when configured.
- Never ask users to paste private keys into the website.
- Keep setup progress visible after the local handoff.
- Import local results through a public artifact bundle.
- Show which step uses wallet approval, provider action, or no approval.

## Step 4 Copy

```text
Choose artifact publishing mode.

Recommended: Local SDK
Private 0G credentials stay on your machine. Run the local helper, then import the generated artifact bundle.

Fastest: Hosted publishing
Continue in browser. This deployment's backend publishes 0G artifacts with its configured operator signer.
```

## Required Evidence Before Continuing

The wizard may continue to ENS record binding only after it has:

- `agent.card`
- `policy.uri`
- `policy.hash`
- `audit.latest`
- `clearintent.version`

## Stop Conditions

Stop and report before proceeding if:

- the wizard hides whether a step is browser-signed, local, or backend-signed
- the hosted path is enabled without displaying backend authority implications
- the local import accepts private key fields
- the wizard writes ENS records before 0G artifact refs are present
