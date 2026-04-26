# Module Boundaries

## Core

Owns lifecycle types and framework state transitions.

Must not own vendor-specific SDK calls.

## ENS identity

Owns ENS resolution and record interpretation.

Must not own execution authority.

## 0G memory and compute

Owns persistence and optional reflection.

Must not be treated as proof that an action is safe by itself.

## Signer hardware

Owns signing flow and display status.

Must not decide what an agent is allowed to do.

## KeeperHub adapter

Owns execution workflow integration.

Must not execute an unsigned or unverifiable intent.

## Guardian Agent

Owns example planning behavior.

Must not bypass the framework lifecycle.
