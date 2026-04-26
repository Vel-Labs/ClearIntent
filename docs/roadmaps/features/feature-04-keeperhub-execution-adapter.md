# Feature 04: KeeperHub Execution Adapter

## Purpose

Use KeeperHub as the reliable execution layer for approved ClearIntent intents.

## Dependencies

- Feature 01 verified intent shape
- Feature 02 receipt/audit shape

## Goals

- create KeeperHub workflow from verified intent
- submit execution request
- monitor status
- capture receipt
- write feedback notes

## Non-goals

- unrestricted agent execution
- custody of user keys
- execution before signature verification

## Subphases

### 4.1 Adapter interface

Define `ExecutionAdapter`.

### 4.2 Workflow mapping

Map verified intent fields to KeeperHub workflow inputs.

### 4.3 Submit path

Implement submit or CLI/MCP workflow path.

### 4.4 Monitor path

Capture workflow status and result.

### 4.5 Midpoint audit

Audit target: adapter cannot execute unsigned or unverifiable intents.

### 4.6 Receipt integration

Return typed `ExecutionReceipt`.

### 4.7 Feedback documentation

Create or update `KEEPERHUB_FEEDBACK.md`.

### 4.8 Example wiring

Connect to Guardian Agent example.

### 4.9 Closeout audit

Audit target: KeeperHub integration is meaningful and reusable.

## Success criteria

- execution path works or is demonstrably wired to KeeperHub workflow
- feedback file is specific and actionable
- receipt is included in audit bundle
