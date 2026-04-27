---
name: repo-doc-router
description: Use when adding, moving, indexing, or reorganizing ClearIntent docs, templates, skills, roadmap files, decisions, or repo taxonomy.
---

# Repo Doc Router

Repo doc routing keeps ClearIntent discoverable for humans and agents after docs or scaffold files move.

## Read First

- `REPO_PROFILE.json`
- `README.md`
- `AGENTS.md`
- `docs/README.md`
- `docs/agents/START_HERE.md`
- `docs/FILE_TREE.md`
- `skills/README.md`

## Workflow

1. Identify whether the change affects root entrypoints, docs indexes, skills, templates, roadmap, decisions, or validation.
2. Move files only when the new location has a clear owner and discoverability path.
3. Update all references in root docs, docs indexes, templates, skills, audits, and GitHub templates.
4. Update `REPO_PROFILE.json` canonical paths, locked paths, important directories, and placeholder allowlist.
5. Refresh `docs/FILE_TREE.md`.
6. Update `CHANGELOG.md`.
7. Run `npm run validate:scaffold` before broader validation.

## Output

Return moved files, updated references, validation commands, and any remaining discoverability risks.
