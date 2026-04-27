# Signer Adapter Contract

Status: planned.

Signer adapters should expose wallet behavior without becoming the source of authority truth.

## Expected adapter outputs

- signer address or account identifier
- wallet class: software, WalletConnect, hardware, smart account, or generic
- signature result
- typed-data payload reference
- human-readable preview reference
- wallet display status
- secure-device display status
- rejection, timeout, or degraded-state reason

## Display status vocabulary

| Status | Meaning |
| --- | --- |
| `app_preview_only` | ClearIntent showed readable metadata, but wallet display was not verified. |
| `wallet_typed_preview` | Wallet rendered meaningful typed-data fields. |
| `secure_device_preview` | Hardware or secure device rendered meaningful signing details. |
| `vendor_clear_signing_approved` | Vendor-approved clear signing path was tested. |
| `blind_or_limited_display` | Wallet could sign, but display was incomplete or opaque. |
| `unknown` | Display behavior has not been tested. |

## Rule

Missing display evidence is not a signing failure by itself, but it must be visible to the operator and audit bundle.
