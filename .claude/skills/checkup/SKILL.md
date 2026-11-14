---
name: checkup
description: Read-only checkup of a live project with a green, yellow or red verdict per dimension. Use when asked "how are we doing" or before a release. Invoke with /checkup.
disable-model-invocation: true
---

# Checkup

Read-only. You query billing, analytics and databases; you never change them.

## Configure for your project
Sources: tests `[test command]`, errors `[tracker or none]`, analytics `[tool or none]`,
billing `[tool or none]`, infra `[how to read status]`. Any `[ ]` left: say so and
skip that dimension. Do not guess. If nothing is configured, answer "nothing
configured" and stop.

## 0. Preflight
One cheap real read per source, in parallel. Retry once; then use the listed
alternative; open the report with a table `source | validated | alternative | reason`.
A connected tool is not a validated source. For analytics, the first query groups by
hostname and must return your own domains; if not, stop using that tool.

## 1. Measure (with commands and queries, not from memory)
- tests and typecheck: the exit code, not the text;
- git: `git status --short` and unpushed commits (unpushed work is risk);
- docs: count of `[ ]` left in CLAUDE.md and the docs folder (project not configured);
- specs: features `building` with an unchecked acceptance list, or `approved` but stale;
- secrets: `git ls-files` must list no `.env`;
- production: errors in the last 24 h, the monitor status, the age of the newest backup.

## 2. Verdict, per dimension
Green: all pass. Yellow: something pending that does not break. Red: a failing test,
a tracked `.env`, a stale spec of a live feature, a backup older than 36 h.

## Rules
- A failed source is "unavailable, because <why>". Never invent or estimate silently.
- Show n. Under 30 is a hypothesis, not a result.
- Exclude internal and test accounts from customer counts, include them in cost.
- A cron's own log line is the authority for "how many remain".
- Output: verdict first; one line per dimension with the number and its source; at most
  3 problems, each with ONE recommendation (not a menu). If nothing changed since the
  last checkup, answer in 3 to 5 lines.
