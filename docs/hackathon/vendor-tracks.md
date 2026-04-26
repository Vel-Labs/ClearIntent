# Vendor Track Eligibility

Target partner selections:

1. 0G
2. ENS
3. KeeperHub

This file should be updated whenever product scope changes.

## 0G

### Track 1: Best Agent Framework, Tooling & Core Extensions

ClearIntent qualification claim:

> ClearIntent is a framework-level authority kernel for open agents deployed with 0G policy memory, audit storage, and optional compute reflection.

How we satisfy it:

- `packages/core/` provides the reusable authority lifecycle.
- `packages/zerog-memory/` stores policy, intent, risk report, signature, and execution receipt artifacts.
- `packages/zerog-compute/` can run or wrap a risk/reflection critic.
- `examples/guardian-agent/` is the required working example agent.
- Architecture docs show how the framework plugs into OpenClaw-style frameworks or alternatives.

Required evidence:

- working example agent
- architecture diagram or clear text architecture
- repo README with setup
- contract addresses if deployed
- explanation of 0G Storage and Compute usage

### Track 2: Best Autonomous Agents, Swarms & iNFT Innovations

ClearIntent qualification claim:

> Guardian Agent is a small autonomous agent system with planner, critic, and executor roles coordinating through shared 0G-backed state.

How we satisfy it:

- planner proposes action
- critic reviews policy and risk
- executor submits only approved signed intents
- shared state and audit artifacts are stored through 0G

Optional iNFT angle:

- Only claim iNFT eligibility if an ERC-7857/iNFT is actually minted and linked on a 0G explorer with proof that intelligence or memory is embedded.
- Until then, treat iNFT as roadmap only.

## ENS

### Track 1: Best ENS Integration for AI Agents

ClearIntent qualification claim:

> ENS is the canonical identity and discovery layer for ClearIntent agents.

How we satisfy it:

- agent ENS name resolves the agent controller or executor address
- ENS text records point to agent card, policy URI, policy hash, audit URI, and framework version
- optional ERC-8004 or agent-registration linkage is recorded through text records
- execution can require the resolved ENS identity and policy hash to match the signed intent

Required evidence:

- functional resolution path
- no hard-coded values in the demo for identity-critical fields
- live demo or video showing ENS improving identity or discoverability

### Track 2: Most Creative Use of ENS

Preferred creative angle:

> ENS subnames act as role-based capability tokens for agent operation.

Examples:

```text
executor.guardian.clearintent.eth
auditor.guardian.clearintent.eth
signer.guardian.clearintent.eth
session-001.guardian.clearintent.eth
```

Possible records:

```text
text: role = executor
text: policy.uri = 0g://...
text: maxSpend = 100 USDC
text: expires = 2026-05-03T12:00:00Z
```

Alternative creative angles:

- verifiable credential pointers in ENS text records
- zk policy proof pointers in ENS text records
- auto-rotating session subnames

MVP recommendation:

Use subnames and verifiable credential pointers before zk or auto-rotation.

## KeeperHub

### Main track: Best Use of KeeperHub

ClearIntent qualification claim:

> ClearIntent uses KeeperHub as the reliable execution layer for approved agent intents.

How we satisfy it:

- `packages/keeperhub-adapter/` turns verified intents into KeeperHub workflows
- KeeperHub executes only after policy and signature verification
- execution receipts are monitored and stored
- the adapter is reusable for other agent frameworks

Required evidence:

- working demo
- public repo with README and architecture
- write-up explaining how KeeperHub is used
- project name, team members, contact info

### Builder Feedback Bounty

Maintain:

- `KEEPERHUB_FEEDBACK.md`

Feedback should include:

- setup friction
- docs gaps
- reproducible bugs
- feature requests
- what worked well enough to keep

Generic praise does not qualify.

## Non-selected but relevant vendors

### Uniswap

Uniswap is useful as an action adapter, but not a primary prize target unless the demo becomes swap-centric. If used, create `FEEDBACK.md` in the repo root because Uniswap requires it for eligibility.

### Gensyn

Gensyn AXL is useful for a future peer-to-peer guardian council. Do not target it unless separate AXL nodes are actually demonstrated.
