# Local THC Check

Project: ClearIntent
Repository: https://github.com/Vel-Labs/ClearIntent
Reviewed Revision: 52d0966a1c0677c067520edb0c948ced4a91bfe0
Precheck Worktree Clean: Yes
Generated At: 2026-05-06T19:12:11.482Z
Review Label: Local THC Check
Rubric Version: THC Methodology 0.2.0
Latest THC-BOT Run: docs/thc/runs/2026-05-06_clearintent_0.1.0_52d0966/
THC-BOT Ledger: docs/thc/THC-BOT.md
Contract: docs/thc/runs/2026-05-06_clearintent_0.1.0_52d0966/THC-BOT.contract.json
Provenance: docs/thc/runs/2026-05-06_clearintent_0.1.0_52d0966/THC-BOT.provenance.json
Artifact Commit: not embedded; see git history for the commit containing this artifact.
Confidence: Medium for local preparation; not independently verified.

> This is a local preparation artifact. Do not hand-edit this report to improve
> the score. If project evidence changes, rerun the THC check. Public or
> third-party review is preferred for public claims because it reduces
> self-reporting bias and doctored-artifact risk.

## Summary

Recommended Level: THC-4 Reproducible - Local THC Check
Total Score: 88 / 100
Caps Applied: Local THC Check only; not independent public, peer, Vel Labs, or leaderboard verification. | No transaction-backed autonomous execution receipt is recorded yet. | Real wallet-rendered signing evidence remains incomplete.
Validation State: Complete

ClearIntent continues to present a strong local THC posture: authority contracts are explicit, core and adapter boundaries are documented, local validation is broad, and audit history is visible. The score is held below THC-5 because this is a first-party local check and because transaction-backed autonomous execution, real wallet-rendered signing evidence, and independent public THC verification remain unresolved.

## Repo Readiness Checklist

- [x] Source-of-truth files are explicit.
- [x] Setup path is inspectable.
- [x] Validation commands are visible.
- [x] Caps and hidden-trust findings are recorded.
- [x] Required THC-BOT fields are answered or explicitly unavailable.
- [x] Public evidence limits are stated.

## Latest THC-BOT Slices

| Slice | File | Status | Summary |
|---|---|---|---|
| Overview | docs/thc/runs/2026-05-06_clearintent_0.1.0_52d0966/slices/overview.json | complete | Score, level, confidence, and current posture. |
| Evidence | docs/thc/runs/2026-05-06_clearintent_0.1.0_52d0966/slices/evidence.json | complete | Scored evidence by THC category. |
| Local Artifacts | docs/thc/runs/2026-05-06_clearintent_0.1.0_52d0966/slices/local-artifacts.json | complete | Canonical local artifacts and optional visualizer boundary. |
| Caps Applied | docs/thc/runs/2026-05-06_clearintent_0.1.0_52d0966/slices/caps-applied.json | complete | Local-only and missing-live-evidence caps. |
| Hidden Trust | docs/thc/runs/2026-05-06_clearintent_0.1.0_52d0966/slices/hidden-trust.json | complete | Top hidden-trust findings. |
| Next Actions | docs/thc/runs/2026-05-06_clearintent_0.1.0_52d0966/slices/next-actions.json | complete | Ordered follow-up work. |
| Uncertainty | docs/thc/runs/2026-05-06_clearintent_0.1.0_52d0966/slices/uncertainty.json | complete | Confidence limits and unavailable fields. |

## Public Review Handoff

- Files a public grader should inspect first: README.md, AGENTS.md, REPO_PROFILE.json, contracts/README.md, contracts/authority-lifecycle.md, docs/architecture/ARCHITECTURE.md, docs/architecture/REPO_BOUNDARIES.md, docs/roadmaps/CURRENT_STATE_AND_NEXT.md, ROADMAP.md, CHANGELOG.md, DECISIONS.md, docs/audits/, tests/, .github/workflows/quality-gate.yml, docs/thc/.
- Evidence links that should be verified independently: npm run check on revision 52d0966a1c0677c067520edb0c948ced4a91bfe0; Contract schemas and valid/invalid fixtures under contracts/; Phase closeout audits under docs/audits/; ENS, 0G, KeeperHub, wallet, and hosted dashboard provider claims against live/current provider state; THC-BOT contract/provenance hashes and cited evidence files.
- Claims that should not be trusted without fresh inspection: Any claim implying transaction-backed autonomous execution; Any claim implying wallet-rendered, hardware-secure, or vendor-approved Clear Signing support; Any claim treating local THC output as certification, endorsement, public score, or leaderboard acceptance; Any live-provider readiness claim that depends on private credentials or provider dashboards.
- Known score uncertainty: local review only; live provider and wallet evidence were not fully re-run during this pass.

## Commands Run

```text
git status --porcelain
git rev-parse HEAD
npm install
npm run check
node skills/THC_Check/scripts/scaffold-thc-bot-run.js . --project-name ClearIntent --visibility public
node skills/THC_BOT_Visualizer/scripts/render-thc-bot.js .
node skills/THC_Check/scripts/validate-thc-bot.js .
npm run validate:scaffold
npm run check
```

Result: `npm run check`, THC-BOT validation, and scaffold validation passed after artifact completion.

## Top Hidden Trust Findings

- medium: Local THC-BOT artifacts are first-party evidence maps, not independent public verification.
- high: Transaction-backed autonomous execution is still unproven.
- medium: Real wallet-rendered signing evidence remains incomplete.
- medium: Live evidence replay depends on operator-held credentials and provider availability.
- medium: KeeperHub and webhook event authenticity is improved but still not full authority truth.

## Next Actions

1. Capture one transaction-backed KeeperHub or executor receipt through the agent account path.
2. Run Phase 5C software-wallet validation and preserve wallet prompt/signature evidence.
3. Request independent public or peer THC review against revision 52d0966.
4. Add trusted KeeperHub/webhook event source binding and replay checks.
5. Keep future THC-BOT runs appended instead of overwriting history.
