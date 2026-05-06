# THC-BOT Run Report

## Project

Project: ClearIntent
Repository: https://github.com/Vel-Labs/ClearIntent
Visibility: public
Reviewed Revision: 52d0966a1c0677c067520edb0c948ced4a91bfe0
Generated At: 2026-05-06T19:12:11.482Z
Rubric Version: THC Methodology 0.2.0
Contract Version: 0.1.0
Validation State: Complete

## Recommended THC Level

Recommended Level: THC-4 Reproducible - Local THC Check
Total Score: 88 / 100
Confidence: Medium for local preparation; not independently verified.
Caps Applied: Local THC Check only; not independent public, peer, Vel Labs, or leaderboard verification. | No transaction-backed autonomous execution receipt is recorded yet. | Real wallet-rendered signing evidence remains incomplete.

One-Sentence Assessment: ClearIntent has strong repo-visible authority contracts, validation, audits, and operator routing, but remains capped by local-only THC review plus missing transaction-backed execution and real wallet-rendered signing evidence.

## Evidence Table

| Category | Score | Evidence | Missing Evidence | Notes |
|---|---:|---|---|---|
| Truth | 29 | README.md states the product mission, current evidence, and explicit transaction-backed execution gap.<br>AGENTS.md, contracts/README.md, and contracts/authority-lifecycle.md define authority ownership and lifecycle gates.<br>docs/architecture/ARCHITECTURE.md and docs/architecture/REPO_BOUNDARIES.md separate contracts, core, adapters, dashboard, and provider evidence.<br>docs/repo-truth/THC_IN_THIS_REPO.md now records the THC-BOT local artifact boundary. | Some externally hosted/live-provider evidence still depends on operator-held credentials or provider dashboards for fresh replay. | Truth boundaries are strong and current. The main reduction is live evidence freshness outside a deterministic local checkout. |
| Hardening | 32 | npm run check passed on reviewed revision 52d0966, covering scaffold validation, contract validation, center CLI validation, credential safety, focused contract tests, all tests, and typecheck.<br>tests/ covers contracts, core fail-closed behavior, ENS identity, 0G memory, KeeperHub adapter, signer adapter, center CLI, and web surfaces.<br>scripts/check-credential-safety.ts reports live-secret readiness without printing secrets and keeps live writes gated.<br>contracts/examples/invalid-*.json and validation scripts prove important negative cases. | Transaction-backed KeeperHub or executor receipt remains absent.<br>Wallet-rendered signing and hardware secure-display evidence remain deferred.<br>Live provider replay requires external configuration and cannot be fully reproduced from public files alone. | Hardening is broad and automated locally, with explicit fail-closed authority posture. Remaining gaps are live execution and wallet evidence, not local validation coverage. |
| Clarity | 22 | README.md, docs/README.md, docs/agents/START_HERE.md, ROADMAP.md, and docs/roadmaps/CURRENT_STATE_AND_NEXT.md route humans and agents to current state and next actions.<br>skills/README.md and repo-local skills provide repeatable operating lanes for contracts, adapters, setup, credentials, transactions, and THC checks.<br>Provider and wallet docs distinguish local fixture, live-bound, workflow-execution, and unproven claim levels.<br>docs/thc/ now gives public reviewers a stable first inspection path. | The repo contains substantial phase history; a new reviewer still has to follow several index files to separate current proof from deferred scope.<br>Some dashboard/operator recovery paths remain distributed across provider, roadmap, and skill docs. | Clarity is high for an authority system of this size, but the evidence volume still imposes navigation cost. |
| Audit History | 5 | CHANGELOG.md, DECISIONS.md, docs/decisions/, and docs/audits/ preserve detailed phase and provider evidence history.<br>docs/thc/LOCAL_CHECK.md and this THC-BOT run provide local review artifacts for the current methodology revision. | No independent public, peer, or Vel Labs reviewed THC artifact is recorded for this revision.<br>Structured THC-BOT history starts with this new run, so trend evidence is not mature yet. | Audit history is extensive, but independent review history and multi-run THC-BOT trend history are still limited. |

## Hidden Trust Findings

| Severity | Finding | Evidence | Recommendation |
|---|---|---|---|
| medium | Local THC-BOT artifacts are first-party evidence maps, not independent public verification. | docs/repo-truth/THC_LOCAL_AND_PUBLIC_REVIEW.md<br>docs/thc/README.md<br>docs/thc/LOCAL_CHECK.md | Submit reviewed revision 52d0966 and the THC-BOT run package to independent public or peer review before using public score or leaderboard language. |
| high | Transaction-backed autonomous execution is still unproven. | README.md current submission posture<br>ROADMAP.md immediate next action<br>docs/audits/phase-4-keeperhub-execution-adapter/4b.9-closeout-audit.md | Record one transaction-backed KeeperHub or executor receipt, then bind it to a canonical ExecutionReceipt and audit bundle. |
| medium | Real wallet-rendered signing evidence remains incomplete. | README.md capability snapshot<br>ROADMAP.md Phase 5C status<br>docs/providers/Wallets/README.md | Run the prepared software-wallet validation path and preserve exact wallet prompt, signature, and ClearIntent preview evidence. |
| medium | Live evidence replay depends on operator-held credentials and provider availability. | npm run validate:credentials output<br>docs/hackathon/vendor-tracks.md<br>docs/roadmaps/CURRENT_STATE_AND_NEXT.md | Keep non-secret transcripts and public artifact references current, and label unavailable live replay as lower confidence rather than success. |
| medium | KeeperHub and webhook event authenticity is improved but still not full authority truth. | README.md demo notification boundary<br>docs/architecture/ARCHITECTURE.md hosted dashboard note<br>apps/web/src/app/api/keeperhub/events/route.ts | Finish source binding, replay protection, and trusted event checks before treating events as execution evidence. |

## Slice Summaries

| Slice | File | Status | Summary |
|---|---|---|---|
| Overview | slices/overview.json | complete | Score, level, confidence, and one-sentence assessment. |
| Evidence | slices/evidence.json | complete | Truth, Hardening, Clarity, and Audit History scoring evidence. |
| Local Artifacts | slices/local-artifacts.json | complete | Canonical local THC artifacts and optional visualizer boundary. |
| Caps Applied | slices/caps-applied.json | complete | Local-only, execution, and wallet-evidence caps. |
| Hidden Trust | slices/hidden-trust.json | complete | Top hidden-trust findings and recommendations. |
| Next Actions | slices/next-actions.json | complete | Ordered follow-up work. |
| Uncertainty | slices/uncertainty.json | complete | Confidence limits and unavailable fields. |

## Next Actions

1. Capture one transaction-backed KeeperHub or executor receipt through the agent account path. (high)
2. Run Phase 5C software-wallet validation and preserve wallet prompt/signature evidence. (high)
3. Request independent public or peer THC review against revision 52d0966. (medium)
4. Add trusted KeeperHub/webhook event source binding and replay checks. (medium)
5. Keep future THC-BOT runs appended instead of overwriting history. (low)

## Uncertainty Notes

- This is a local preparation review produced in the ClearIntent checkout, not independent public verification.
- npm run check passed locally, but external providers, live dashboards, and wallet prompts were not re-run against every live integration during this THC pass.
- Credential safety reported missing local live-provider secrets in this environment; that is safe for repo review but limits live replay confidence.
- The score reflects current repository artifacts at 52d0966, not future pushed state or uncommitted local edits.
