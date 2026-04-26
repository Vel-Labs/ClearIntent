# Operating Doctrine

## Core sentence

Agents may reason autonomously, but execution authority must be bounded, reviewable, signed, verified, and auditable.

## Non-negotiables

- ClearIntent is a framework primitive first.
- The Guardian Agent is an example, not the whole product.
- ENS must resolve real identity, metadata, policy, or role data.
- 0G must store real policy, memory, audit, or risk artifacts.
- KeeperHub must perform meaningful execution or workflow orchestration.
- Hardware signing is an adapter and security feature, not the product brand.
- Stretch standards must not dilute the MVP.
- Every major claim needs an artifact.

## Product posture

ClearIntent should feel like infrastructure other builders can import:

```ts
const intent = await clearIntent.createIntent(goal, context);
const policy = await clearIntent.resolvePolicy(agentName);
const report = await clearIntent.review(intent, policy);
const signature = await clearIntent.sign(intent);
const receipt = await clearIntent.execute(intent, signature);
```

## What to avoid

- A hard-coded demo that cannot be reused.
- A generic chatbot with an onchain button.
- Vendor-name-driven branding.
- Overclaiming Clear Signing, zk, ERC-7857, or ERC-8004 if they are only partial.
- Building a marketplace before the authority kernel works.
- Letting agents bypass user authority.
