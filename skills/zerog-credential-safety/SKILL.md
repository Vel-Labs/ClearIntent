---
name: zerog-credential-safety
description: Use before designing, enabling, documenting, or testing 0G live writes, 0G policy/audit artifact publishing, or hosted 0G backend behavior.
---

# 0G Credential Safety

Use this skill for 0G Storage live-write setup and hosted/local publishing decisions.

## Core Rule

0G artifact publishing is a signing operation. If `ZERO_G_ENABLE_LIVE_WRITES=true` and `ZERO_G_PRIVATE_KEY` is present in the runtime environment, ClearIntent can upload artifacts using that signer.

## Safe Modes

### Local SDK mode

Recommended default for custody hygiene.

- private key stays in `~/.clearintent/clearintent.secrets.env`
- CLI uploads 0G artifacts locally
- dashboard imports returned public refs
- no hosted backend receives the private key

### Hosted publishing mode

Allowed only when explicitly configured.

- backend receives `ZERO_G_PRIVATE_KEY`
- backend can publish 0G artifacts
- requires auth, ownership checks, rate limits, and clear user warning before public use
- should not be the default public v0.1 posture

## Required Checks

Before live 0G writes:

```bash
npm run clearintent -- credentials status
npm run clearintent -- memory live-status
npm run validate:credentials
```

After live 0G writes:

```bash
npm run clearintent -- memory live-status
```

Record only:

- `rootHash`
- `txHash`
- `0g://` URI
- policy hash
- degraded reasons

## Do Not

- Do not paste `ZERO_G_PRIVATE_KEY` into chat.
- Do not put `ZERO_G_PRIVATE_KEY` into repo-local `.env.local`.
- Do not deploy `ZERO_G_PRIVATE_KEY` to public Vercel unless hosted publishing mode is intentional and protected.
- Do not describe readiness checks as live upload proof.
- Do not make 0G live-write routes public without an ownership and abuse-control plan.

## Hosted Dashboard Warning Copy

Use this wording when the wizard offers hosted 0G publishing:

```text
Hosted publishing uses this deployment's configured 0G operator signer to write policy and audit artifacts. Use local SDK mode if you want the 0G private key to stay only on your machine.
```

## Stop Conditions

Stop and report before proceeding if:

- hosted 0G writes are enabled on a public deployment without authentication
- a live write route can be called by an arbitrary unauthenticated request
- the UI implies browser-wallet signing covers 0G artifact upload when the server signer is actually used
- artifact records are written to ENS before policy hash and readback evidence are available
