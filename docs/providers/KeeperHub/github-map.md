# KeeperHub GitHub Map

Source: [KeeperHub/keeperhub](https://github.com/KeeperHub/keeperhub). Snapshot gathered 2026-04-25 from the GitHub API and repository README.

## Primary repository

| Repository | Language | Description | ClearIntent relevance |
| --- | --- | --- | --- |
| [KeeperHub/keeperhub](https://github.com/KeeperHub/keeperhub) | TypeScript | Open-source workflow builder for onchain events and actions | Reference implementation and possible local adapter target. |

## Repository structure observed

The public repository includes:

- `app/`
- `components/`
- `lib/`
- `plugins/`
- `drizzle/`
- `e2e/`
- `scripts/`
- `package.json`
- `playwright.config.ts`

## README facts relevant to ClearIntent

The README presents the repo as an AI workflow builder template with:

- visual workflow builder
- workflow execution tracking
- authentication
- PostgreSQL/Drizzle persistence
- AI-generated workflows
- TypeScript code generation
- workflow management and execution API endpoints

ClearIntent implication: the repository can guide local development and testing, but ClearIntent should depend on documented KeeperHub API or CLI surfaces for the hackathon demo unless a local fork is explicitly chosen.

## Auditability note

The docs site and public README do not replace live API behavior. During adapter implementation, capture exact endpoint requests, response bodies, workflow IDs, run IDs, transaction hashes, and error payloads in local test evidence.
