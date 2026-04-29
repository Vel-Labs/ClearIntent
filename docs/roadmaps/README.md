# Roadmaps

This folder splits ClearIntent into feature roadmaps with phases, subphases, dependencies, and audit points.

Root `../../ROADMAP.md` is the high-visibility roadmap index. `ROADMAP.md` in this folder preserves the detailed aggregate phase sequence.

## Files

```text
ROADMAP.md
CURRENT_STATE_AND_NEXT.md
phase-1.5-center-cli-skeleton/
  IMPLEMENTATION_PLAN.md
  EXECUTION_PROMPT.md
phase-2-zerog-policy-memory-audit/
  IMPLEMENTATION_PLAN.md
  PHASE_2B_READINESS.md
phase-3-ens-agent-identity/
  IMPLEMENTATION_PLAN.md
phase-4-keeperhub-execution-adapter/
  IMPLEMENTATION_PLAN.md
features/
  feature-01-core-authority-kernel.md
  feature-02-zerog-policy-memory-audit.md
  feature-03-ens-agent-identity.md
  feature-04-keeperhub-execution-adapter.md
  feature-05-hardware-signer-readable-approval.md  (Wallet Signer Adapters and Readable Approval)
  feature-06-guardian-agent-example.md  (Guardian Agent Example and Agent Audit Dashboard)
  feature-07-stretch-standards.md
```

## Rule

Do not assign coding agents to a feature until its dependencies are clear. Use `CURRENT_STATE_AND_NEXT.md` as the operational next-step truth.
