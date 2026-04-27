# Trezor GitHub Map

Sources: [Trezor GitHub organization](https://github.com/trezor), [Trezor Connect docs](https://connect.trezor.io/).

## Repositories most relevant to ClearIntent

| Repository | Surface | License observed | ClearIntent relevance |
| --- | --- | --- | --- |
| [trezor/connect](https://github.com/trezor/connect) | Trezor Connect | not asserted | Primary integration path for EIP-712 typed-data signing. |
| [trezor/trezor-suite](https://github.com/trezor/trezor-suite) | Trezor Suite | not asserted | App and wallet behavior reference. |
| [trezor/trezor-firmware](https://github.com/trezor/trezor-firmware) | Device firmware | not asserted | Device display behavior reference when needed. |
| [trezor/trezor-hardware](https://github.com/trezor/trezor-hardware) | Hardware design | not asserted | Hardware reference, not a ClearIntent dependency. |

## ClearIntent implication

Trezor support should start from Trezor Connect typed-data signing. Device display claims require testing on a supported model and firmware.
