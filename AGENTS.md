# AGENTS

This file defines how humans, Claude, Codex, Cursor, Copilot, and other coding agents should operate in the ClearIntent repository.

## Mission

Build a reusable authority layer for autonomous onchain agents. ClearIntent should help agents act safely by combining ENS identity, 0G policy memory and audit trails, typed intent generation, human-readable signing, hardware-backed approval, and KeeperHub execution.

## Priority order

1. Preserve user authority.
2. Preserve architectural clarity.
3. Preserve auditability and replayability.
4. Keep integrations behind explicit adapters.
5. Prefer small, testable layers.
6. Keep developer usability ahead of speculative complexity.
7. Ship a functional hackathon proof before stretch standards.

## Required reading before structural changes

- `README.md`
- `contracts/README.md`
- `contracts/authority-lifecycle.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/REPO_BOUNDARIES.md`
- `ROADMAP.md`
- `docs/roadmaps/ROADMAP.md`
- `docs/README.md`
- `docs/repo-truth/THC_METHODOLOGY.md`
- `docs/repo-truth/THC_IN_THIS_REPO.md`
- `docs/governance/multi-agent-workflow.md`
- `docs/governance/worktree-governance.md`
- `docs/governance/code-quality-standards.md`
- `docs/governance/stability-handoff.md`
- `docs/hackathon/vendor-tracks.md`
- `docs/hackathon/rules.md`

## Working rules

- Treat `contracts/` as the non-negotiable authority contract. It defines the shared shapes and lifecycle gates for the whole repo.
- Treat `packages/core/` as the lowest-level ClearIntent implementation primitive. It must implement and enforce `contracts/`, not redefine them.
- Treat `contracts/` plus `packages/core/` as the stability handoff before provider adapters and demo integration proceed.
- Before shaping schemas, adapters, demo lifecycle, signer behavior, or audit artifacts, read `contracts/README.md` and `contracts/authority-lifecycle.md`.
- Do not create adapter-specific intent, policy, risk, receipt, or audit shapes unless they wrap or extend the contract layer explicitly.
- Preserve the explicit human intervention gate. Signing is not a substitute for `HumanReviewCheckpoint`.
- Treat vendor integrations as adapters, not as the global brain.
- Do not hard-code ENS names, wallet addresses, policy hashes, executor addresses, or 0G artifact references in demos.
- Do not let an agent executor bypass policy verification.
- Do not let signing UI claims exceed what the signer actually displays.
- Do not claim full Clear Signing support unless it is demonstrably working in the flow being submitted.
- Do not call a stretch feature complete without a working demo path and audit note.
- Keep large implementation files below 350 lines where practical. Files over 400 lines require clear purpose. Files over 500 lines require extraction or written justification.
- Comments should feel human: explain why a boundary exists, what can go wrong, and what future maintainers should not accidentally break.

## Multi-agent development rules

Use separate worktrees for parallel coding agents. No two agents should own the same files unless a human operator explicitly coordinates the merge.

Recommended worktree pattern:

```text
../clearintent-core
../clearintent-ens
../clearintent-zerog
../clearintent-keeperhub
../clearintent-signer
../clearintent-docs
```

Each agent must declare:

- assigned workstream
- files it expects to touch
- files it must not touch
- dependencies it is waiting on
- validation it will run
- docs it must update

See `docs/governance/multi-agent-workflow.md` and `docs/governance/worktree-governance.md`.

## Phase execution and git closeout

- Execute roadmap phases through the documented milestone cadence.
- Do not advance past a midpoint audit with unresolved blocking findings.
- Do not call a phase complete until closeout audit, verification, docs updates, and remaining-task routing are current.
- Commit only scoped work from the phase or hygiene task.
- Do not stage unrelated worktree changes.
- If a phase is pushed, provide closeout context: phase id, what changed, audits created or updated, verification commands and results, commit hash, branch, push target, and deferred tasks.
- If a phase is not pushed, state why and name the exact local verification completed.

## Adapter rules

Each adapter must expose a narrow interface and keep vendor behavior isolated.

Expected adapter families:

- `packages/ens-identity/`
- `packages/zerog-memory/`
- `packages/zerog-compute/`
- `packages/keeperhub-adapter/`
- `packages/signer-hardware/`
- `packages/opencleaw-adapter/`
- `packages/x402-adapter/` if payments are added

Adapters should return typed results and explicit degraded states. Missing evidence is not success.

## Security posture

ClearIntent is an authority system. Treat unsafe ambiguity as a bug.

- Missing policy blocks execution.
- Missing nonce blocks execution.
- Expired deadline blocks execution.
- Unknown executor blocks execution.
- Unknown ENS identity blocks privileged execution.
- Mismatched policy hash blocks execution.
- Missing audit write creates degraded state.
- Blind-signing fallback must be visible to the user.

## Required docs to update when behavior changes

- `docs/architecture/ARCHITECTURE.md`
- `ROADMAP.md`
- `docs/roadmaps/ROADMAP.md`
- `DECISIONS.md`
- relevant `docs/decisions/` daily decision file
- `CHANGELOG.md`
- relevant `docs/architecture/` file
- relevant `docs/roadmaps/features/` file
- relevant `docs/hackathon/` eligibility note if prize claims change

## Definition of done

A change is not done unless:

- the behavior is described in docs
- affected interfaces are typed or schematized
- risk and authority implications are documented
- tests or deterministic checks exist where practical
- hackathon eligibility implications are understood
- `CHANGELOG.md` has a concrete entry
- `DECISIONS.md` links to an entry for real architectural decisions
- required midpoint and closeout audits exist for roadmap phases
