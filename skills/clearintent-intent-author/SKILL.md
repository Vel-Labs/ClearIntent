---
name: clearintent-intent-author
description: Use when drafting canonical ClearIntent intent payloads for proposed onchain actions, wallet review, webhook alerts, or 0G audit artifacts.
---

# ClearIntent Intent Author

Use this skill when an agent needs to turn a proposed action into a ClearIntent payload.

## Payload Requirements

Every intent must include:

- `agentEnsName`
- `parentWallet`
- `agentAccount`
- `policyUri`
- `policyHash`
- `auditLatest`
- `intentHash`
- `action.actionType`
- `action.target`
- `action.chainId`
- `action.valueLimit`
- human-readable summary

## Command Path

```bash
clearintent intent create --template safe-test-transfer
clearintent intent evaluate
```

Repo-local fallback:

```bash
npm run clearintent -- intent create --template safe-test-transfer
npm run clearintent -- intent evaluate
```

## Human-Readable Rule

Do not hide meaning in calldata. The intent summary should be readable by a human and map to signer/webhook/audit surfaces.

## Stop Conditions

Stop before submission if:

- any required payload field is missing
- the policy hash in the intent differs from the ClearIntent context
- the action cannot be summarized in plain language
- the intent asks for broader authority than the configured policy allows
- the signer display would require blind trust in opaque calldata
