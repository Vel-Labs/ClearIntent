# <Feature Or Phase> Implementation Plan

## Purpose

State the concrete system-facing or developer-facing outcome.

## Why now

- why this phase is next
- what it unlocks
- what breaks or remains unclear if skipped
- what existing work it depends on

## Goals

- list concrete behaviors or artifacts to land

## Non-goals

- list adjacent work that must stay out of scope

## Current foundation entering this phase

- existing contracts or schemas
- existing adapter status
- current docs and tests
- current demo state

## Core intent

Say what this makes ClearIntent more capable of doing, and what it must not pretend to do.

## Canonical distinctions

Define terms that must stay separate, such as:

- proposal vs intent
- intent vs execution
- policy check vs risk reflection
- app preview vs signer display
- local fixture vs deployed proof

## Expected outcome

Describe what is meaningfully usable when the phase is done.

## Human and agent surfaces

If the phase adds or changes Center CLI behavior, plan all three layers:

- Direct human commands, such as `npm run clearintent -- <command>`
- Agent-readable JSON commands, such as `npm run --silent clearintent -- <command> --json`
- Guided bare-wizard journey through `npm run clearintent`

The guided wizard is not optional polish when a feature is meant to be operator-facing. The phase plan must say whether the wizard gains menu entries, status routing, audit-log browsing, or a documented deferred gap. Do not call the human CLI layer complete if the only access path is a direct command that is absent from the wizard.

## Milestone cadence

- `<x>.1` through `<x>.4`: build stops
- `<x>.5`: midpoint audit
- `<x>.6` through `<x>.8`: build stops
- `<x>.9`: closeout audit

## Planned artifacts

- implementation notes
- contracts, schemas, or interfaces
- tests or validation output
- Center CLI command output, JSON output, and wizard journey evidence when CLI behavior changes
- midpoint audit at `<x>.5`
- closeout audit at `<x>.9`
- final phase closeout summary

## Recommended implementation shape

### Workstream `<x>.1`

**Files:**

- Create: `path/to/file`
- Modify: `path/to/file`

**Expected outcome:**

- describe what this stop lands

### Workstream `<x>.5`

**Audit artifact:**

- Create during implementation: `docs/audits/<phase>/<x>.5-midpoint-audit.md`

**Audit target:**

- describe what midpoint must prove

### Workstream `<x>.9`

**Audit artifact:**

- Create during implementation: `docs/audits/<phase>/<x>.9-closeout-audit.md`

**Audit target:**

- describe what closeout must prove
- include human direct-command, agent JSON, and bare-wizard evidence when CLI behavior changed
- include whether blocking findings remain before any commit or push

## Touchpoints

- docs to update
- contracts or schemas likely affected
- runtime modules likely affected
- Center CLI direct commands, JSON lane, and guided wizard likely affected
- demo surfaces likely affected
- audit artifacts likely affected
