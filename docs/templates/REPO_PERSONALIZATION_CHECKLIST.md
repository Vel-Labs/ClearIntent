# Repo Personalization Checklist

Use this checklist when refreshing ClearIntent repo governance or adapting the scaffold to a new repo.

## Repo truth

- [ ] `AGENTS.md` reflects the current repo mission and boundaries.
- [ ] `REPO_PROFILE.json` points to existing paths, not aspirational structure.
- [ ] `README.md` and `docs/README.md` route new contributors correctly.
- [ ] `ROADMAP.md` and `docs/roadmaps/CURRENT_STATE_AND_NEXT.md` agree.
- [ ] `DECISIONS.md` captures durable architecture decisions only.
- [ ] `CHANGELOG.md` has concrete entries for shipped changes.

## Commands

- [ ] Install command is current.
- [ ] Scaffold validation command is current.
- [ ] Contract or schema validation command is current.
- [ ] Focused test command is current.
- [ ] All-test command is current.
- [ ] Typecheck or static check command is current.
- [ ] Full quality gate command is current.

## Scope boundaries

- [ ] Governance-locked paths are explicit.
- [ ] Downstream or out-of-scope work is named.
- [ ] Planned paths are not treated as implemented.
- [ ] Provider, demo, UI, deployment, and stretch work remain deferred unless current source proves otherwise.

## Validation

Run:

```bash
npm run validate:scaffold
npm run check
```

Record any command not run and why.
