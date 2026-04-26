# Security Model

## Security objective

Prevent autonomous agents from exceeding user-approved authority.

## Main risks

| Risk | Control |
| --- | --- |
| Agent proposes unsafe action | policy check + risk critic |
| Agent changes action after approval | action hash in signed intent |
| Replay attack | nonce + deadline + chain ID + verifying contract |
| Wrong executor | allowed executor field |
| Wrong identity | ENS node/name and policy hash binding |
| Misleading signing display | readable preview + display status warnings |
| Missing audit trail | audit receipt requirement and degraded state |
| Hard-coded demo values | config and ENS resolution checks |

## Signer honesty

Do not imply that a user saw a field on a hardware device unless the demo proves it. If the app renders the readable preview but the device signs typed data with limited display, document that split.

## Fail-closed requirement

If the system cannot prove authority, it must block or degrade visibly.
