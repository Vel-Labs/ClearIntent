# Wallet Compatibility Levels

This file defines how ClearIntent reports wallet support without overstating signer behavior.

## Levels

| Level | Evidence required |
| --- | --- |
| L0 Researched only | Source URL, GitHub repository or docs page, and ClearIntent relevance note. |
| L1 Adapter scaffolded | Interface or planned adapter file named in roadmap or implementation plan. |
| L2 EIP-712 signable | Local or recorded test that signs a ClearIntent typed payload and captures signature output. |
| L3 ClearIntent app preview verified | Screenshot, test, or demo output showing the human-readable approval metadata before signing. |
| L4 Wallet-rendered typed-data preview verified | Screenshot or recording of the wallet rendering meaningful typed data for the ClearIntent payload. |
| L5 Secure-device display verified | Screenshot, recording, or audit note showing device-side display of meaningful signing details. |
| L6 Vendor-approved Clear Signing verified | Provider approval, registry acceptance, or equivalent vendor evidence plus a tested signer path. |

## Reporting format

Each wallet doc should include:

- current level
- target level
- local device tested: yes or no
- expected signing path
- sources
- known limitations
- ClearIntent claim wording

## App preview vs signer display

ClearIntent's app preview is an important human-readable layer, but it is not the same as secure signer display. App-rendered metadata can show the exact intent meaning before signing. Secure signer display adds an independent confirmation surface that reduces reliance on app UI integrity.

This distinction should be explained as progressive assurance, not as a scare tactic. The message is:

> ClearIntent gives users readable intent review today, and stronger signer-side assurance as wallet and vendor support is added.
