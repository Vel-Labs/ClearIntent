# Local THC Check

Project: ClearIntent
Repository: /Users/steven/Desktop/Coding/ClearIntent
Reviewed Revision: f5b97a17bd972259fef143a18e0010a1c7bdade5
Precheck Worktree Clean: Yes
Generated At: 2026-05-03T15:21:49Z
Review Label: Local THC Check
Rubric Version: Vel-Labs/thc-methodology@617d28cbf2806c54c3948a825551e4ba90fa481d
Provenance: docs/thc/LOCAL_CHECK.provenance.json
Artifact Commit: not embedded; see git history or closeout notes for the commit containing this artifact.
Confidence: Medium-high for local preparation; not independently verified.

> This is a local preparation artifact. Do not hand-edit this report to improve
> the score. If project evidence changes, rerun the THC check. Public or
> third-party review is preferred for public claims because it reduces
> self-reporting bias and doctored-artifact risk.

## Summary

Recommended Level: THC-4 Reproducible - Local THC Check
Total Score: 86 / 100
Caps Applied: None

This score reflects strong source-of-truth boundaries, a passing local quality
gate, explicit fail-closed authority rules, and visible audit history. It is not
THC-5 because the review is local, public-independent verification has not
occurred, and the repo still has important live-evidence gaps around
transaction-backed execution, wallet-rendered signing evidence, and trusted
event authenticity.

## Evidence Table

| Category | Evidence | Score | Notes |
|---|---|---:|---|
| Truth | `README.md`, `AGENTS.md`, `REPO_PROFILE.json`, `contracts/README.md`, `contracts/authority-lifecycle.md`, `docs/architecture/ARCHITECTURE.md`, `docs/architecture/REPO_BOUNDARIES.md`, `docs/repo-truth/THC_IN_THIS_REPO.md` | 28 / 30 | Purpose, source-of-truth boundaries, authority lifecycle, provider ownership, and current claim limits are explicit. Remaining uncertainty is mostly around externally hosted/live evidence freshness rather than repo-local truth. |
| Hardening | `npm run check`, `scripts/validate-scaffold.ts`, `scripts/validate-contracts.ts`, `scripts/check-credential-safety.ts`, `tests/`, `.github/workflows/quality-gate.yml`, `contracts/examples/invalid-*.json` | 31 / 35 | Full quality gate passed, including scaffold drift, contract validation, credential safety, tests, and typecheck. Hardening is reduced by live-write warning posture and remaining unproven transaction-backed execution. |
| Clarity | `README.md`, `docs/README.md`, `docs/agents/START_HERE.md`, `ROADMAP.md`, `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`, package/app READMEs, `skills/README.md` | 21 / 25 | A new contributor has clear entrypoints, commands, architecture maps, and phase routing. Clarity is reduced by the volume of phase evidence and the need to inspect several files to distinguish local, live, workflow-only, and transaction-backed claims. |
| Audit History | `CHANGELOG.md`, `DECISIONS.md`, `docs/decisions/`, `docs/audits/`, phase closeout files | 6 / 10 | Review and decision history is extensive and visible. Scored below full marks because local THC artifacts did not exist before this run and public-independent review history is not present. |

Weighted total: 86 / 100.

## Top Hidden Trust Findings

| Finding | Severity | Evidence | Recommendation |
|---|---|---|---|
| Local review is not independent public verification. | Medium | This report was generated locally from the current checkout and public methodology clone. | Submit the recorded revision plus this report to an independent public or peer review before making public THC-level claims. |
| Transaction-backed autonomous execution is still unproven. | High | `README.md`, `ROADMAP.md`, and `docs/roadmaps/CURRENT_STATE_AND_NEXT.md` state KeeperHub has workflow-execution proof but no transaction hash or canonical transaction-backed receipt. | Record one transaction-backed executor or KeeperHub receipt, then update the relevant audit, roadmap, and evidence files. |
| Real wallet-rendered signing evidence remains incomplete. | Medium | Phase 5C is still described as `ready-for-operator-test`; current signer evidence is local fixture/request-shape oriented. | Capture operator-run software-wallet evidence, then repeat for WalletConnect/mobile and hardware paths only when devices/sessions are available. |
| Live evidence depends on external provider access and operator-held secrets. | Medium | Credential safety passes without printing secrets, and live writes are enabled intentionally, but independent reviewers cannot replay live provider proofs without configured access. | Keep public evidence files current, add non-secret verification transcripts where practical, and separate local deterministic proof from live-provider proof in every claim. |
| KeeperHub/webhook event authenticity is not yet a trusted authority source. | Medium | Repo docs describe reported/non-authoritative KeeperHub event handling until token/signature/replay/source-binding controls are fully proven. | Finish event authentication, replay protection, and source binding before using events as trusted readiness or execution evidence. |

## Public Review Handoff

- Files a public grader should inspect first:
  - `README.md`
  - `AGENTS.md`
  - `REPO_PROFILE.json`
  - `contracts/README.md`
  - `contracts/authority-lifecycle.md`
  - `docs/architecture/ARCHITECTURE.md`
  - `docs/architecture/REPO_BOUNDARIES.md`
  - `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
  - `ROADMAP.md`
  - `CHANGELOG.md`
  - `DECISIONS.md`
  - `docs/audits/`
  - `tests/`
  - `.github/workflows/quality-gate.yml`
- Evidence links that should be verified independently:
  - `npm run check` on revision `f5b97a17bd972259fef143a18e0010a1c7bdade5`
  - Contract schemas and fixtures under `contracts/`
  - Phase closeout audits under `docs/audits/`
  - Provider evidence claims in `docs/roadmaps/CURRENT_STATE_AND_NEXT.md`
- Claims that should not be trusted without fresh inspection:
  - ENS, 0G, KeeperHub, wallet, Discord, and hosted-dashboard live-readiness claims
  - Any claim that implies transaction-backed autonomous execution
  - Any claim that implies wallet-rendered, hardware-secure, or vendor-approved Clear Signing support
  - Any claim that treats local THC output as certification
- Known score uncertainty:
  - The local check used deterministic repo commands and public methodology docs, but scoring still contains reviewer judgment.
  - External provider evidence was inspected through repo artifacts, not independently re-run against every provider.
  - The local environment had `ZERO_G_ENABLE_LIVE_WRITES=true`; credential safety passed and did not print secrets, but public reviewers should treat live-write readiness as operator-context evidence.

## Commands Run

```text
git status --short
git rev-parse HEAD
git clone --depth 1 https://github.com/Vel-Labs/thc-methodology.git /tmp/thc-methodology-public
git -C /tmp/thc-methodology-public rev-parse HEAD
npm run check
npm run check
```

Result: `npm run check` passed end to end before scoring and again after
artifact generation plus `docs/FILE_TREE.md` routing.

Observed gate output:

```text
PASS scaffold profile paths exist
PASS profile commands resolve to package scripts or npm builtins
PASS forbidden early-scope directories are absent
PASS docs/FILE_TREE.md is current for tracked scaffold files
PASS template placeholders are registered
scaffold validation ok
contract validation ok
center cli validation ok
credential safety ok: ok=true, blockingReasons=[]
tests/contracts: 1 file passed, 9 tests passed
npm test: 18 files passed, 163 tests passed
typecheck: tsc --noEmit passed
```

## Next Actions

1. Get an independent public or peer review against revision `f5b97a17bd972259fef143a18e0010a1c7bdade5`.
2. Record transaction-backed execution evidence and canonical receipt/audit persistence if the project wants to advance beyond workflow-execution proof.
3. Capture real software-wallet signing evidence for Phase 5C and keep hardware/vendor Clear Signing claims deferred until tested.
4. Harden KeeperHub/webhook event authenticity before treating events as trusted evidence.
5. Rerun THC_Check after each material evidence or authority-boundary change.
