# ClearIntent ENS Identity Adapter

`packages/ens-identity` is the ENS identity and discovery adapter for ClearIntent.

ClearIntent used ENS to make an agent identity inspectable instead of hidden in local config. The adapter resolves an ENS name, reads ClearIntent text records, validates the agent card shape, compares the policy hash, and exposes blocked/degraded states when identity evidence is missing or mismatched.

## Provider usage

For the hackathon, ENS was used as the canonical discovery layer for:

- agent identity: `guardian.agent.clearintent.eth`
- agent metadata through `agent.card`
- 0G policy artifact URI through `policy.uri`
- canonical policy hash through `policy.hash`
- latest audit pointer through `audit.latest`
- ClearIntent schema/version marker through `clearintent.version`

The live binding reached `ens-live-bound`: the selected ENS name resolves, required ClearIntent text records are present, and the policy hash matches the expected 0G-backed policy artifact.

## Claim boundary

ENS discovery is not authority approval. A resolved ENS name and matching policy hash tell ClearIntent which identity and policy to evaluate; they do not approve signing or execution. The authority path remains blocked until policy, review, signature, executor, nonce, deadline, and receipt evidence satisfy the core contract.

## CLI

```bash
npm run clearintent -- identity status
npm run clearintent -- identity live-status
npm run clearintent -- identity bind-records
npm run clearintent -- identity send-bind-records
```

`identity bind-records` prepares resolver multicall transaction data without sending it. `identity send-bind-records` is a gated demo/operator route and must use external operator secrets, never a primary wallet key.

## Read next

- `docs/providers/ENS/README.md`
- `contracts/README.md`
- `contracts/authority-lifecycle.md`
