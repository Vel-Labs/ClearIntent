# Trezor

Current level: L0 researched only.

Target level: L2 EIP-712 signable and L5 secure-device display if a supported device and firmware show the ClearIntent typed intent meaning.

Expected path: Trezor Connect `ethereumSignTypedData`.

Local device tested: no.

ClearIntent claim wording:

> Trezor is a planned hardware wallet path. Public docs show an EIP-712 typed-data signing method for supported devices and firmware, but ClearIntent must test the exact payload before claiming device-rendered readability.

Known limitation:

- Device and firmware support differ. Blind or limited display states must be reported honestly.

Sources:

- [Trezor Connect ethereumSignTypedData](https://connect.trezor.io/9/methods/ethereum/ethereumSignTypedData/)
- [Trezor GitHub organization](https://github.com/trezor)
- [Trezor GitHub map](github-map.md)
