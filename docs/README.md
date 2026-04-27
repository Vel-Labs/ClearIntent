# Docs Index

This folder is the operating map for ClearIntent.

## Directory structure

```text
docs/
  README.md                 this index
  agents/                   agent start guide and onboarding routing
  repo-truth/               durable truth, methodology, source material, operating doctrine
  governance/               audit, workflow, worktree, quality, and contribution rules
  hackathon/                objective, rules, vendor tracks, judging, demo, submission checklist
  architecture/             technical architecture and lifecycle docs
  decisions/                dated decision logs
  roadmaps/                 feature-level roadmap packages
  templates/                phase, audit, and agent execution templates
  audits/                   midpoint and closeout audit artifacts
  providers/                builder information about relevant projects/providers
```

Root-level `skills/` contains repo-local scaffold skills. They live at root for agent/tool discoverability and are not globally installed unless an operator imports them.
Root `ROADMAP.md` and `DECISIONS.md` are high-visibility indexes. Detailed roadmap scope lives under `roadmaps/`; dated decision entries live under `decisions/`.
Top-level `contracts/` is also required reading. It is outside `docs/` because it is both human-readable governance and machine-checkable contract truth.
Top-level `packages/core/API.md` documents the current callable authority API. It is a package API, not an HTTP route map.
Top-level `REPO_PROFILE.json` is the machine-readable taxonomy for paths, commands, governance locks, and scaffold validation.
For implementation sequencing, `governance/stability-handoff.md` explains why `contracts/` and `packages/core/` must stabilize before provider adapters or demos.

## Recommended reading paths

### New contributor

1. `../README.md`
2. `../AGENTS.md`
3. `../REPO_PROFILE.json`
4. `agents/START_HERE.md`
5. `../ROADMAP.md`
6. `../DECISIONS.md`
7. `repo-truth/THC_METHODOLOGY.md`
8. `repo-truth/THC_IN_THIS_REPO.md`
9. `governance/code-quality-standards.md`
10. `governance/stability-handoff.md`
11. `roadmaps/README.md`

### Coding agent

1. `../AGENTS.md`
2. `../REPO_PROFILE.json`
3. `agents/START_HERE.md`
4. `../contracts/README.md`
5. `../contracts/authority-lifecycle.md`
6. `governance/multi-agent-workflow.md`
7. `governance/worktree-governance.md`
8. `governance/stability-handoff.md`
9. `../ROADMAP.md`
10. `roadmaps/CURRENT_STATE_AND_NEXT.md`
11. assigned roadmap feature file
12. relevant architecture file

### Hackathon submission prep

1. `hackathon/README.md`
2. `hackathon/vendor-tracks.md`
3. `hackathon/rules.md`
4. `hackathon/judging-strategy.md`
5. `hackathon/demo-plan.md`
6. `hackathon/wallet-demo-strategy.md`
7. `hackathon/submission-checklist.md`

### Wallet and signer planning

1. `providers/Wallets/README.md`
2. `providers/Wallets/compatibility-levels.md`
3. `providers/Wallets/generic/eip712.md`
4. `providers/Wallets/generic/erc7730.md`
5. relevant software, WalletConnect, smart-account, or hardware wallet provider note

## Documentation rule

Docs should explain system reality, not decorate it. If a claim cannot be verified from code, config, contracts, deployed addresses, logs, or demo output, the claim must be softened or removed.
