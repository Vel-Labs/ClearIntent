# Truth Boundaries

## Durable truth

Durable truth should live in:

- contracts
- schemas
- ENS records
- 0G artifacts
- signed intent payloads
- execution receipts
- audit files
- decision records
- changelog entries
- reproducible demo scripts

## Development truth

Development truth may live in:

- local fixtures
- test configs
- branch-specific notes
- roadmap phase plans
- draft prompts

Development truth must not be confused with deployed truth.

## Not truth

The following are not sufficient proof by themselves:

- a chat transcript
- a screenshot without reproducible context
- a frontend label
- an agent explanation
- a local variable name
- a hard-coded demo value
- an unverified vendor response

## Claim discipline

Use these claim levels:

| Claim level | Meaning |
| --- | --- |
| Planned | not implemented yet |
| Scaffolded | files or interfaces exist, no end-to-end proof |
| Fixture-proven | deterministic local proof exists |
| Testnet-proven | deployed or run against testnet with artifacts |
| Demo-proven | shown in live or recorded demo |
| Submission-proven | included in repo, video, and submission evidence |

Do not use a stronger claim level than the evidence supports.
