# ENS GitHub Map

Source: [ensdomains GitHub organization](https://github.com/ensdomains). Snapshot gathered 2026-04-25 from the GitHub API.

## Repositories most relevant to ClearIntent

| Repository | Surface | ClearIntent relevance |
| --- | --- | --- |
| [ensdomains/docs](https://github.com/ensdomains/docs) | Current documentation | Source for docs pages and ENSIP material. |
| [ensdomains/ens-contracts](https://github.com/ensdomains/ens-contracts) | Core protocol contracts | Contract ABIs and reference for registry/resolver behavior. |
| [ensdomains/ensjs](https://github.com/ensdomains/ensjs) | JavaScript/TypeScript library | Likely implementation dependency for name/text-record resolution. |
| [ensdomains/ensjs-v2](https://github.com/ensdomains/ensjs-v2) | Older JS bindings | Historical reference only unless codebase requires it. |
| [ensdomains/resolvers](https://github.com/ensdomains/resolvers) | Resolver implementations | Useful if ClearIntent needs custom/offchain resolver behavior later. |
| [ensdomains/offchain-resolver](https://github.com/ensdomains/offchain-resolver) | CCIP Read/offchain resolver | Relevant for offchain/L2 subname exploration. |
| [ensdomains/ens-subgraph](https://github.com/ensdomains/ens-subgraph) | Indexing | Useful for listing/inspection, not verification authority. |
| [ensdomains/name-wrapper](https://github.com/ensdomains/name-wrapper) | Wrapped names | Role/subname permissions if the demo uses wrapped subnames. |
| [ensdomains/subdomain-registrar](https://github.com/ensdomains/subdomain-registrar) | Subname registrar | Reference for issuing subnames. |
| [ensdomains/ens-app-v3](https://github.com/ensdomains/ens-app-v3) | Manager app | Useful for operator setup and UI expectations. |

## Repositories likely out of MVP scope

- Governance-specific apps/contracts unless a DAO demonstration is added.
- DNSSEC-specific repos unless ClearIntent supports DNS names.
- Design-system/UI repos unless the demo adopts ENS UI packages.

## Auditability note

ENS records are runtime truth only when resolved live or captured in a signed/audited artifact. GitHub repositories are implementation references, not proof of the demo's configured identity.
