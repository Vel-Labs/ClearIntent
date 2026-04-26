# Skills

This folder contains ClearIntent repo-local skills in the Claude-style skill layout:

```text
skills/
  skill-name/
    SKILL.md
    templates/
```

Each `SKILL.md` starts with YAML frontmatter:

```yaml
---
name: skill-name
description: Use when...
---
```

These skills are scaffold assets. They are not globally installed automatically. To activate one in an agent runtime, copy or symlink the desired skill folder into that runtime's configured skills directory.

The purpose is to reduce token use by giving humans and agents narrow, reusable instructions for common ClearIntent governance tasks.
