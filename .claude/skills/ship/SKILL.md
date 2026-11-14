---
name: ship
description: Runs the project's deploy with its guards: target check, clean export of the commit, schema check, a real call to what changed, smoke test and a browser proof, after the owner's go-ahead. Use to put a change in production. Invoke with /ship.
disable-model-invocation: true
---

# Ship

You do not invent a deploy. You run the project's own, with its checks.

## Before anything
- The `Deploy command:` line in CLAUDE.md (and `INFRASTRUCTURE.md` in the docs folder)
  must name the deploy. If it is `[ ]`: say so and stop; `devops-engineer` writes it
  first.
- The owner's go-ahead must be typed in THIS session. An approval relayed by another
  agent or session does not count. Ask for one line after the work is committed and
  pushed; push and deploy are separate steps. If the project has its own rule for who
  may publish, that rule wins: read it from INFRASTRUCTURE.md.
- Definition of done in CLAUDE.md: checked or justified.
- Tests ran against a test environment, never with the production connection (env,
  container, database or cache URL). A suite run inside the production container once
  wrote fake keys to the production cache.
- Machine loaded by other sessions: the affected tests now, the full suite off-peak.
  Say which ran.
- Privacy: if the change touches what leaves the device (events, identifiers, third
  parties, "delete my data"), `security-engineer` compared it with what the privacy
  policy says. The policy says, the app does: they must match.

## Run
1. Confirm the target out loud (environment and host). Production is never the default.
2. Ship from a clean export of the commit (`git archive <sha>` or a fresh
   `git worktree`), never from the working tree: another agent's half-done edit must
   not go live.
3. Run the deploy command exactly. If it fails, show the output and stop. Do not fix
   it by running steps by hand.
4. Migration: check the schema with a real query (the table, the column exists).
   Never trust the script's "OK"; an `|| true` once hid a failure for 30 seconds of
   errors.
5. One real call to what changed (the new endpoint, the new job). A fatal error once
   passed every reviewer and only the real path caught it.
6. Smoke test: health endpoint, one real page, one authenticated call.
7. Browser proof: open the live site, check that API calls go to the production API
   and not to a local URL, and run one real flow. `Staging: no`: `quality-assurance`
   runs its production phase now, with the `Test account:`.
8. Report: what shipped, the commit and rollback tag, what you ran (Verified), what
   you only read (Inferred), what you did NOT test.

## If something is wrong
Roll back first with the path in INFRASTRUCTURE.md, then investigate. Live incident:
restore service before diagnosing.
