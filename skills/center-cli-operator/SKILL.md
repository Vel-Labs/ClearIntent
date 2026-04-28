---
name: center-cli-operator
description: Use when operating, extending, testing, or documenting the ClearIntent Center CLI human lane or AI-readable command lane.
---

# Center CLI Operator

The Center CLI is the local product surface over `packages/core`. It is not an authority source.

Use this skill when an agent needs to inspect ClearIntent state, add CLI commands, validate AI-readable output, or improve the human menu/wizard wrapper.

## Read First

- `AGENTS.md`
- `REPO_PROFILE.json`
- `packages/center-cli/README.md`
- `packages/core/API.md`
- `docs/roadmaps/phase-1.5-center-cli-skeleton/IMPLEMENTATION_PLAN.md`
- `docs/audits/phase-1.5-center-cli-skeleton/1.5.9-closeout-audit.md`

## Lanes

### Human lane

Use:

```bash
npm run clearintent
```

This opens the interactive menu in a TTY and prints the landing screen outside a TTY. The human lane may summarize and guide, but it must render the same command result semantics used by the AI lane.

### AI lane

Use:

```bash
npm run --silent clearintent -- <command> --json
```

AI-readable output must:

- begin with JSON, with no leading prose
- include `commandOk`
- include `authorityOk`
- keep `ok` as a compatibility alias for `authorityOk` during the skeleton phase
- include `mode`, `fixtureSource`, and `liveProvider` when fixture-backed
- exit `0` for successful read-only inspection, even when `authorityOk` is `false`
- exit nonzero for CLI/runtime errors

## Workflow

1. Choose the lane before acting:
   - human lane for operator navigation and onboarding
   - AI lane for deterministic parsing, tests, automation, and agent handoffs
2. Do not parse human output in automation.
3. Do not treat `authorityOk: false` as a CLI crash.
4. Preserve `packages/core` as the source of authority behavior.
5. Keep fixture-only scope explicit until live adapters exist.
6. Add or update tests whenever output fields, exit semantics, or command routing changes.

## Required Checks

Run focused checks first:

```bash
npm run validate:center-cli
npm test -- tests/center-cli
```

Before closeout, run:

```bash
npm run check
```

## Stop Conditions

Stop and document before proceeding if the change would:

- implement ENS, 0G, KeeperHub, signer, webhook, OS notification, browser UI, hosted service, or demo integration behavior
- create provider adapter directories
- redefine lifecycle, review, signer, executor, deadline, or audit rules in the CLI
- remove or blur `commandOk` versus `authorityOk`
- make JSON output depend on human-readable text
