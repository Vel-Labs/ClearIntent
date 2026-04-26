# Judging Strategy

## Judging categories

The project should optimize for:

- technicality
- originality
- practicality
- usability / DX
- wow factor

## Technicality

Show real boundaries:

- typed intent
- policy hash
- nonce
- deadline
- signer
- ENS identity
- 0G artifact pointer
- KeeperHub execution receipt

Do not bury the architecture in jargon. Show the lifecycle.

## Originality

The original idea is not another trading or payment agent. The original idea is an authority kernel for agents.

Use this line:

> The agent is autonomous in reasoning, not autonomous in authority.

## Practicality

Make it easy to imagine other builders using it:

```ts
const clearIntent = createClearIntent({ ens, zerog, signer, keeperhub });
```

Include a working example agent and clear setup.

## Usability / DX

Judges should see:

- simple repo structure
- quickstart
- readable lifecycle diagram
- example agent
- adapter boundaries
- no hard-coded demo magic

## Wow factor

The memorable moment is:

1. agent proposes action
2. policy and risk report appear
3. human approves readable bounded intent
4. hardware signer signs
5. KeeperHub executes
6. audit receipt is visible

End with:

> The agent could act, but it could not exceed the authority that was signed.
