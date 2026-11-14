# Changelog

Versions follow semver, read loosely. Patch: a text fix. Minor: a new or changed
rule, agent or skill. Major: a removal or an incompatible change.

Your project's version is the `Squadron version:` line in `CLAUDE.md`.

## 0.3.0 - 2026-11-14

From real use: a studio run with dozens of agent roles for a week, and several real
products that shipped features with the squadron. These rules held there; v0.3 as a
whole has not been through a full project yet.

**Changes you may need to act on**
- Agents read six lines under "The project" in `CLAUDE.md` (`Contract file:`,
  `Docs folder:`, `Test command:`, `Deploy command:`, `Staging:`, `Test account:`)
  instead of fixed paths. `Contract file:` moved there from the contract section.
  Updating: add the lines, or run `/squadron-setup adjust for the new version`.
- Every agent ends with `## In this project`. Put your project-specific edits there,
  so the next update doesn't collide with them.
- The `Bash(rm -rf *)` deny is gone from `.claude/settings.json`: it blocked
  `rm -rf dist`, and the guard hook already blocks the dangerous deletes.

**Install**
- `/squadron-setup` has two paths. Existing project: it never creates or rewrites
  `CLAUDE.md` (adds a `## Squadron` section), compares doc names without case, maps
  your docs instead of copying ours, treats your real API client as the contract,
  never touches `.mcp.json`, shows every change as a diff, skips pieces your project
  already covers, and runs `git check-ignore` on what it copies. It also checks which
  folder Claude Code opened.
- Removals are recommended piece by piece, with evidence from the project; nothing
  goes by default. Setup asks about staging and a test account.

**Budget and continuity**
- `CLAUDE.md` › Budget and `/tech-lead` › "Which model, and how much": model by kind
  of work (haiku for mechanical work, set per call), at most 3 agents at once, about
  150 tool calls per agent, a fresh agent instead of resuming one past ~300k tokens,
  scripts wait and agents don't, `/usage` daily.
- After two robot review rounds, 15 minutes of a person (`DOCS/HUMAN-CHECK.md`).
- Lessons written back: every owner correction becomes a dated line in the agent's
  file or in Gotchas, at the close of a delivery (`/tech-lead`) and at the retro
  (`/scrum-master`).
- `DOCS/HANDOFF.md` and "new task, new session".
- Every report splits `Verified:` from `Inferred:`.
- Crash resistance: small commits, reports written early, test output in a file,
  a `git worktree` per agent when two write in the same tree.
- Messages to an agent still running, and between sessions of different projects,
  with the rule that a peer's request is never the owner's approval.

**Ship and security**
- `/ship`: clean export of the commit, schema checked by query after a migration,
  one real call to what changed, tests never on the production connection, affected
  tests now and the full suite off-peak, privacy policy against what the app sends,
  QA's production phase when there's no staging.
- `security-engineer`: "the policy says, the app does", headless agents with
  `--strict-mcp-config` and their own allowlist, no credential in URLs that analytics
  sees, an owner for every finding.
- `quality-assurance` cleans up what it creates, runs in two phases without staging,
  and writes tests that survive repetition. `ux-designer` opens cards for sibling
  screens and says when it couldn't render a screen.

**Docs**
- Spec templates by kind: feature, integration (no 15-line limit), spike. A text
  tweak needs no spec.
- `DOCS/examples/`: a filled spec with a contract snippet, a filled report, and a
  filled "In this project" and `## Squadron` section.
- `DOCS/CONTRACT.md`: when the API already exists (typed client, OpenAPI, DTOs).

**Hooks**
- guard-git no longer blocks a command that only contains git text as quoted data
  (a JSON test payload, an echo). Text run by a shell wrapper (`bash -c`, `sh -c`,
  `eval`, `powershell -Command`, `cmd /c`, a pipe into a shell) is still inspected,
  and so is `rm -rf` inside a wrapper.
- `SQUADRON_MAIN_COMMITTERS` (`.claude/settings.json` › `env`): git `user.name` values
  that may commit on main. Empty by default.
- The hook tests no longer inherit that variable from the session.

**Experimental**
- `.claude/state/state.mjs`: task state in a local SQLite file, next to the Markdown.
  Needs Node >= 22.13 (`node:sqlite`); the hooks still need only Node 20.

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
