# Contract/Core Stability Handoff Prompt

Use this prompt when creating or hardening a future project scaffold where contract truth and core implementation must be stable before feature work begins.

```text
You are working in <absolute repo path>.

Objective:
Create a clean contract/core stability baseline so future humans and agents can safely implement project features without ambiguity, duplicated truth, or adapter-specific assumptions.

Primary outcome:
The repo must clearly separate:
- contracts/: canonical project truth
- packages/core/: executable enforcement of that truth
- tests/: shared local quality gate
- docs/: current-state, decisions, audit, and handoff routing

Read first:
1. AGENTS.md or the repo's agent instructions, if present
2. README.md
3. docs/architecture/ARCHITECTURE.md, if present
4. ROADMAP.md and docs/roadmaps/ROADMAP.md, if present
5. DECISIONS.md and docs/decisions/, if present
6. CHANGELOG.md, if present
7. package.json, pyproject.toml, Makefile, or equivalent local command source
8. Existing docs/templates, docs/governance, and docs/roadmaps files, if present

Operating constraints:
- Documentation and scaffold hardening only unless explicitly asked to implement business logic.
- Do not implement provider adapters, external integrations, demo flows, or product features yet.
- Do not invent hidden runtime truth inside tests.
- Do not duplicate contract shapes inside adapters or feature packages.
- Do not add unnecessary tooling.
- Do not stage or commit unless explicitly asked.
- Prefer small files and clear module boundaries.

Required work:

1. Establish the contract layer
- Create or harden contracts/ as the canonical source of truth.
- Include README.md explaining that implementation code consumes contracts, not the other way around.
- Include lifecycle or state documentation if the system has ordered states, gates, approvals, async flows, or irreversible actions.
- Include schemas, typed contracts, examples, fixtures, or equivalent artifacts appropriate for the stack.
- Include valid and invalid examples when practical.
- State what missing evidence must block, degrade, or warn.

2. Establish the core layer
- Create or harden packages/core/ as the lowest-level implementation primitive.
- Core must implement and enforce contracts/.
- Core may expose types, validators, state transitions, hash helpers, policy checks, or other reusable primitives.
- Core must not own provider-specific behavior.
- If core is not implemented yet, document exactly what must be true before implementation starts.

3. Establish the local quality gate
- Identify the repo's package manager and commands from local files.
- Add only necessary scripts.
- Prefer commands shaped like:
  - install dependencies
  - validate contracts
  - run contract/core-only tests
  - run all tests
  - run typecheck/static check
- Ensure tests consume contract artifacts from contracts/ rather than redefining shapes locally.
- Document these commands in README.md and tests/README.md or equivalent.

4. Establish routing docs
- Update README.md with current state, local setup, validation commands, and the next allowed build step.
- Update ROADMAP.md, docs/roadmaps/ROADMAP.md, or docs/roadmaps/CURRENT_STATE_AND_NEXT.md with:
  - contract baseline status
  - validation/core baseline status
  - immediate next implementation step
  - deferred adapters, demos, or stretch work
- Update governance docs with the contract/core handoff rule.
- Update DECISIONS.md and the relevant docs/decisions/ daily file for durable architectural boundaries.
- Update CHANGELOG.md with concrete changes.

5. Add audit or closeout evidence
- Add or update an audit doc with:
  - scope
  - files changed
  - commands run
  - exact results
  - remaining follow-up
  - decision

6. Validate
- Run the documented install command.
- Run contract validation.
- Run contract/core-only tests.
- Run all tests.
- Run typecheck/static checks if available.
- If a command cannot run, state why and perform the closest deterministic alternative.

Definition of done:
- A new agent can identify canonical truth without asking.
- A new agent can identify the core implementation boundary without asking.
- A new agent can run the same local quality gate as a human.
- The current-state doc names exactly what starts next.
- Provider adapters and demos are explicitly downstream of contract/core stability.
- No provider readiness is claimed unless provider paths are actually implemented and verified.

Expected final response:
- Summarize what changed.
- List files touched.
- List commands run and exact results.
- State whether the repo is ready for core implementation or downstream feature implementation.
- State what remains deferred.
```
