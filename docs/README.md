# Docs Index

This folder is the operating map for ClearIntent.

## Directory structure

```text
docs/
  README.md                 this index
  repo-truth/               durable truth, methodology, source material, operating doctrine
  governance/               audit, workflow, worktree, quality, and contribution rules
  hackathon/                objective, rules, vendor tracks, judging, demo, submission checklist
  architecture/             technical architecture and lifecycle docs
  roadmaps/                 feature-level roadmap packages
  templates/                phase, audit, and agent execution templates
  audits/                   midpoint and closeout audit artifacts
  providers/                builder information about relevant projects/providers
```

Top-level `contracts/` is also required reading. It is outside `docs/` because it is both human-readable governance and machine-checkable contract truth.
For implementation sequencing, `governance/stability-handoff.md` explains why `contracts/` and `packages/core/` must stabilize before provider adapters or demos.

## Recommended reading paths

### New contributor

1. `../README.md`
2. `../AGENTS.md`
3. `repo-truth/THC_METHODOLOGY.md`
4. `repo-truth/THC_IN_THIS_REPO.md`
5. `governance/code-quality-standards.md`
6. `governance/stability-handoff.md`
7. `roadmaps/README.md`

### Coding agent

1. `../AGENTS.md`
2. `../contracts/README.md`
3. `../contracts/authority-lifecycle.md`
4. `governance/multi-agent-workflow.md`
5. `governance/worktree-governance.md`
6. `governance/stability-handoff.md`
7. assigned roadmap feature file
8. relevant architecture file

### Hackathon submission prep

1. `hackathon/README.md`
2. `hackathon/vendor-tracks.md`
3. `hackathon/rules.md`
4. `hackathon/judging-strategy.md`
5. `hackathon/demo-plan.md`
6. `hackathon/submission-checklist.md`

## Documentation rule

Docs should explain system reality, not decorate it. If a claim cannot be verified from code, config, contracts, deployed addresses, logs, or demo output, the claim must be softened or removed.
