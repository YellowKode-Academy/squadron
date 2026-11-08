---
name: squadron-setup
description: Configures or re-adjusts this repository for the project at hand. Asks five questions, fills in CLAUDE.md and the documents, and recommends which agents to delete. Also accepts a file or link describing the project. Use it the first time and whenever something changes. Invoke with /squadron-setup, or /squadron-setup adjust for <thing>, or /squadron-setup <file.md or URL>.
---

# Setup

You turn a generic skeleton into **this person's** project.

The repository arrives full of `[ ]`. Your job is to replace those with real
decisions, and to **delete what will not be used**.

**This skill does not run only once.** Projects change: someone joins, a database
shows up, the product becomes something else. Whenever that happens, run it
again.

---

## First: see who's on the team

Follow **Team discovery** in CLAUDE.md before planning anything.

On a re-run this matters even more: don't recommend deleting what is already
deleted, and don't recreate what someone removed on purpose.

## Then: check for name collisions

This repository ships skills and agents under common names (`spec`, `tech-lead`,
`product-manager`, `scrum-master`, `checkup`, `ship`). If the project already has
something with the same name, one of them hides the other.

List, and compare by name:
- `.claude/skills/*/`, `.claude/commands/*.md` and `.claude/agents/*.md` of this
  project;
- the same three folders under `~/.claude/` (personal ones).

On a match: **the project's own wins.** Do not overwrite it. Say which squadron
file was skipped, and offer to rename ours with a `squadron-` prefix, or to delete
ours if the project's does the same job. Report the list of collisions at the end.

## Three modes

| How it was called | What to do |
|---|---|
| `/squadron-setup` | full interview, the five questions |
| `/squadron-setup adjust for <thing>` | touch only what that sentence asks for |
| `/squadron-setup adjust for the new version` | read `CHANGELOG.md`, compare with `Squadron version:` in CLAUDE.md, list what changed since, and merge it without overwriting the owner's edits |
| `/squadron-setup <file.md>` or `/squadron-setup <URL>` | read it first, then ask only what's missing |

### When a file or link comes in

Read the content before asking anything. It might be a PRD, a product
description, a requirements document, a web page. It usually tells you what the
project is, for whom, and sometimes the stack.

**After reading, only ask what wasn't there.** Asking someone what they just
handed you in writing is the fastest way to lose their trust.

Say what you extracted from the document before moving on, so they can correct
you.

---

## Before asking: look

A lot can be discovered without bothering anyone:

- **`package.json`?** Framework, package manager and commands come from there.
- **Is there code already?** The stack is decided, even if nobody wrote it down.
- **`.git` with history?** This is not a new project. It's adopting the process on
  a project already in motion, and that changes everything.
- **Its own README?** Read it before asking what the project is.
- **Is there already a contract-like file** (a typed API client, an OpenAPI spec, a
  shared types package)? That is the candidate for "Contract file:".

**Every question you ask is one you failed to answer yourself.**

---

## The five questions

Ask whatever is left **all at once, in one batch**. One at a time is tiring and
people abandon it halfway.

Each one exists because it changes something real. If an answer changes nothing,
the question shouldn't exist.

### 1. Are you working alone on this, or with other people?

| Answer | What changes |
|---|---|
| Alone | `scrum-master` probably goes: ceremony and board cost more than they help |
| With others | `scrum-master` stays, and a board starts to make sense |

### 2. Is this a new project, or is there code already running?

| Answer | What changes |
|---|---|
| New | it can be born right: contract and spec from day one |
| Already exists | **do not force the process onto what's already built.** Apply it going forward. Record the current architecture as a decision, even if the reason is "it was already like this" |
| Exists and it's a mess | start with the contract: pulling scattered data into one contract file is the highest-return change |

### 3. Do you already know what you're going to build?

| Answer | What changes |
|---|---|
| I know exactly | next step is `/spec`. `product-manager` can go |
| I have a vague idea | next step is `product-owner` validating the pain before any code |
| No idea at all | next step is `/product-manager`. **Do not fill in the PRD by guessing** |

### 4. What does this project have: a UI, a server, a database — and where does it ship?

**The question that deletes the most agents.** Check what applies:

| Has | Keeps |
|---|---|
| An interface | `frontend-developer`, `ux-designer` |
| An API or server logic | `backend-developer` |
| A database | `data-engineer` |
| Deploy you run yourself | `devops-engineer` |
| No UI (CLI, API only, library) | remove the mock-first rules, the loading/error/empty state lines and the 375px line from CLAUDE.md and from the Definition of done; keep the core rules or replace the whole section with the project's own never-bend rule |
| None of that yet | delete nothing now; run `/squadron-setup` again when it shows up |

If it ships on a platform that handles everything, `devops-engineer` goes, and so
does the `ship` skill. Same if it is not deployed yet. If `Stage` is `ideation`,
`checkup` goes too: there is nothing live to check.

Ask inside this question: **"Does it call paid APIs, send email or deploy by itself?"**
An answer of "none of that" removes the Limits and Destructive operations blocks
from the Operating rules in CLAUDE.md. Any other answer keeps them.

### 5. Will it handle logins, payments, or personal data?

The one with the biggest consequence.

| Answer | What changes |
|---|---|
| Yes | `security-engineer` stays, and becomes **mandatory** before any deploy |
| No, and it won't | it can go — but warn that the day a login appears, it comes back |
| Not sure yet | it stays. Cheap to keep, expensive to find out late |

---

## What you fill in

### `CLAUDE.md`
Name, what it is, stage. Real commands (take them from `package.json`).
Conventions matching what this person actually uses. The contract path, if it
isn't `src/lib/api.ts`: fill the `Contract file:` line.

### Gotchas in `CLAUDE.md`
Ask: "Anything that has to be updated in two places, or fails only in production?"
Write each answer as "when you add X, also update Y". Leave the example out when
there is nothing to record. Remove the Operating rules that do not apply (no
deploy, no paid API, no UI).

### `DOCS/PRD.md`
Only what they can answer now. **Mark what stayed open** instead of guessing.
Push on the *what the product does NOT do* field: open scope is a project that
never finishes.

### `DOCS/ARCHITECTURE.md`
The stack, and the first decision on record. If the stack came pre-decided,
record it as a decision anyway, with the real reason.

### The contract
If the contract file doesn't exist **and the project has a UI and no backend**,
create it with one sample entity following the rules: `async`, 300ms delay, a way
to force an error, and no fake data outside that file. In the other cases, only
record the path. See `DOCS/CONTRACT.md`.

### MCP
If `.mcp.json` doesn't exist, copy it from `.mcp.example.json`. It ships with
Playwright, which is what lets `quality-assurance` actually open the application
instead of only reading code, and what lets `researcher` open documentation and
test tools.

Without it those two agents get noticeably worse — say so if the person chooses
not to set it up.

Add whatever else they use: database, issue tracker, deployment platform.

### `.claude/settings.json`
Fill the test and typecheck commands as `Bash(<command> *)` allow rules, from the
Commands section of CLAUDE.md. Remove `mcp__playwright__*` if the project has no UI.
Never add `Bash(*)`. Existing project that already has its own settings: show the
diff, do not overwrite.

---

## Now delete

**The most valuable step, and the easiest one to skip out of politeness.**

Too many agents make routing worse: similar descriptions confuse who calls whom.
An agent that is never called is not neutral — it costs context and pollutes the
choice.

Build the list from answers 1, 4 and 5 (and the `ship` and `checkup` rules above), show what would remain, and **ask for
confirmation before deleting**. Deleting files is the project owner's call.

**The minimum that still makes sense:** `spec`, `tech-lead`,
`frontend-developer`, `quality-assurance`. Think first, build, and someone with
no context trying to break it.

Say they can be restored at any time by copying from the original repository.
That removes the fear of deleting.

---

## Adapt the agents to the context

Once the stack is known, swap generic for specific where it changes the outcome:

- `frontend-developer` and `backend-developer`: the real framework
- `quality-assurance`: this project's test command
- `data-engineer`: the real database and the policies it uses
- `devops-engineer`: the real provider
- `ux-designer`: whether a component library already exists
- builders (`frontend-developer`, `backend-developer`, `data-engineer`): fill the
  `You write only in:` line with the paths each one owns

Don't rewrite whole agents.

---

## When you finish

First, prove the guards work. Run `node --version` and `git --version`. If Node is
missing, say that the hooks are inert and offer to remove the `hooks` block. Then
exercise each guard once on purpose: `node --test .claude/hooks/hooks.test.mjs`,
and ask to read `.env`. Report pass/fail per guard. A guard that was never
exercised is a guess.

Then report:

```
Found on my own: what you read without needing to ask
Configured: what was filled in
Still open: what they need to decide later
Suggest deleting: what goes, and why
Next step: the concrete command
```

The next step is almost always one of these:

- No clarity on what to build → `/product-manager`
- Clarity → `/spec <first-feature>`
- Existing project, messy → pull the scattered data into the contract

**Remind them they can come back:** `/squadron-setup adjust for <what changed>` at any
time. Do not suggest deleting this skill.

---

## Rules

- **Never invent an answer.** An honest `[ ]` beats a decision nobody made.
- **Don't build features.** Setup configures the repository, not the product.
- **Ask in one batch, and only what's left.**
- **Recommend deleting.** It's the most useful advice you have, and the easiest
  to swallow out of politeness.
- **If they don't know what they're building, stop.** Configuring a repository
  for a project that doesn't exist is organizing the void. Send them to
  `/product-manager`.
