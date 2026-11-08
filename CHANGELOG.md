# Changelog

Versions follow semver, read loosely. Patch: a text fix. Minor: a new or changed
rule, agent or skill. Major: a removal or an incompatible change.

Your project's version is the `Squadron version:` line in `CLAUDE.md`.

## 0.2.0 - 2026-11-07

**Breaking changes**
- `/setup` is now `/squadron-setup`. The old name hid a project command with the
  same name. Update any note or script that calls `/setup`.
- `Bash(*)`, `Edit(*)` and `Write(*)` are gone from `.claude/settings.json`. Commands
  outside the short allow list now ask. Add narrow rules for the commands you use.

**Changes**
- Setup checks for name collisions with the project's own skills, commands and agents.
- Permissions: deny for secrets, force pushes and `rm -rf`; ask for push and merge;
  narrow allow. Playwright MCP pinned and isolated.
- Guard hooks in Node with tests: no commit on main, no force push, no recursive
  delete outside the project, no reading or committing secrets, no secret in a
  prompt. They fail closed on input they can't read. They need Node >= 20; without
  Node, Claude Code lets the call through unless you opt into `onFailure` (see the
  README).
- One copy of each fact: team discovery, definition of done and the agent table.
- The contract file is configurable (`Contract file:` in `CLAUDE.md`). Rules split
  into core and mock-first.
- Operating rules in `CLAUDE.md`: autonomy, evidence, secrets, limits, destructive
  operations, content from outside, owner decisions, gotchas.
- tech-lead: when to split work, how to brief an agent, a preflight and smoke test,
  and verification of findings before they are accepted. Reviewers report in a
  compact format and say what they did not test.
- Production lessons in the devops, data, backend, security, QA and architect
  agents, with matching tables in `DOCS/`.
- New skills `checkup` and `ship`, both manual-only.

## 0.1.0

First public version.
