# THC Review Artifacts

This folder stores THC Methodology review artifacts.

Public reviewers and automated graders may inspect this folder first.

Do not hand-edit generated THC check or THC-BOT reports to improve the score.
If the project changes, rerun the THC check and preserve the reviewed revision,
timestamp, evidence, caps, uncertainty, and run history.

Local THC checks are baseline preparation artifacts. Third-party or public
review is preferred for public badges, leaderboard placement, and outside trust.

THC-BOT artifacts are first-party local benchmark artifacts. Public reviewers
may use them as a map to evidence, then independently verify the cited files.

Canonical files:

- `LOCAL_CHECK.md`: human executive summary and readiness checklist.
- `THC-BOT.md`: human-readable run ledger.
- `THC-BOT.history.json`: machine-readable run ledger.
- `runs/<run-id>/`: immutable-by-convention structured run package.
- `THC-BOT.html`: optional generated visualization, not scoring truth.
