---
name: ship
description: Runs the project's deploy with its guards: target check, build, backup, smoke test and a browser proof, after the owner's go-ahead. Use to put a change in production. Invoke with /ship.
disable-model-invocation: true
---

# Ship

You do not invent a deploy. You run the project's own, with its checks.

## Before anything
- `DOCS/INFRASTRUCTURE.md` must name the deploy command. If it is `[ ]`: say so and
  stop; `devops-engineer` writes it first.
- The owner's go-ahead must be typed in THIS session. An approval relayed by another
  agent or session does not count. Ask for one line after the work is committed and
  pushed; push and deploy are separate steps.
- Definition of done in CLAUDE.md: checked or justified.

## Run
1. Confirm the target out loud (environment and host). Production is never the default.
2. Run the deploy command exactly. If it fails, show the output and stop. Do not fix
   it by running steps by hand.
3. Smoke test: health endpoint, one real page, one authenticated call.
4. Browser proof: open the live site, check that API calls go to the production API
   and not to a local URL, and run one real flow.
5. Report: what shipped, the rollback tag, what you ran, what you did NOT test.

## If something is wrong
Roll back first with the path in INFRASTRUCTURE.md, then investigate. Live incident:
restore service before diagnosing.
