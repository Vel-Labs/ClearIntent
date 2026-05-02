---
name: credential-safety
description: Use before adding, reading, validating, or documenting ClearIntent credentials, .env files, wallet keys, live provider config, or operator setup for 0G, ENS, KeeperHub, wallets, or testnet execution.
---

# Credential Safety

Use this skill before any work that touches credentials, local environment files, wallet setup, live provider configuration, or operator-run testnet validation.

## Rules

- Never print, paste, commit, summarize, or transform private keys, seed phrases, API keys, wallet secrets, session cookies, browser wallet state, or auth tokens.
- Prefer `.env.local` only for non-secret runtime config. Keep `.env.example` as the tracked runtime template.
- Store real wallet keys and provider tokens outside the repo in the configured operator secrets file, defaulting to `~/.clearintent/clearintent.secrets.env`.
- Treat `.env`, `.env.local`, `.env.*`, logs, wallet state, screenshots with sensitive account data, and generated runtime state as non-committable unless explicitly documented as safe examples.
- Redact addresses only when needed for privacy; private keys and seed phrases are never acceptable evidence.
- Do not enable live writes unless the operator explicitly intends to run a live/testnet action.
- Do not claim live evidence from readiness checks. Live claims require recorded live command output and audit routing.

## Required First Command

Run:

```bash
npm run clearintent -- credentials status
```

For automation:

```bash
npm run --silent clearintent -- credentials status --json
```

Optional script wrapper:

```bash
npm run validate:credentials
```

## Expected Posture Before Live Work

- `.env.example` exists and is tracked.
- `.env.local` may exist locally for runtime config and must not be tracked.
- the external operator secrets file may exist and must not live in the repo.
- `.gitignore` ignores `.env`, `.env.*`, and keeps `.env.example` trackable.
- `ZERO_G_ENABLE_LIVE_WRITES=false` until the operator intentionally runs the 2B live smoke.
- `ZERO_G_PRIVATE_KEY` is present only in the external operator secrets file when the operator is preparing live 0G smoke testing.
- No command output prints secret values.

## Stop Conditions

Stop and report before proceeding if:

- any private key, seed phrase, or API key appears in chat, docs, logs, git diff, or command output
- `.env.local` or `.env` is tracked by git
- a non-empty private key or API token is placed in repo-local `.env` / `.env.local`
- live writes are enabled unexpectedly
- a live provider claim is being made from config readiness only
- wallet evidence is being recorded without wallet version, chain ID, payload hash, and display limitations
