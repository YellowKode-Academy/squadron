<p align="center">
  <img src="assets/banner.png" alt="squadron" width="100%">
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-F5D300?style=flat-square" alt="MIT"></a>
  <img src="https://img.shields.io/badge/built_for-Claude_Code-3A3A3A?style=flat-square" alt="Built for Claude Code">
</p>

A starting point for projects run by one person and a team of AI agents, with a
real process and documentation the agents actually obey.

**This is not a framework. It's an opinionated skeleton for you to adapt.**

---

## The problem it solves

Building with AI is too fast. The agent delivers in minutes, and you only find
out you asked for the wrong thing once it's done. And when several screens are
generated, each one comes out with its own data shape, spacing and color.

This repository applies three things that fix that:

**1. Nothing is built without a spec.** The IFO method: Input, Flow, Output.
Fifteen lines that force you to think before something very quick thinks for you.

**2. All data goes through a contract.** A single contract file (by default
`src/lib/api.ts`) holds everything that comes in and out. It stops being throwaway
code and becomes the specification the backend fulfills. Consequence: frontend and
backend work in parallel without talking to each other.

**3. Separate roles, with isolated context.** A QA that knows what the code was
meant to do tests the happy path. A QA that arrives with no context breaks the
screen the way a user breaks it. Its ignorance is the feature.

---

## What's inside

```
CLAUDE.md                 project rules, read every session
CHANGELOG.md              what changed in each version
.mcp.example.json         MCP servers the agents use
.gitattributes            line endings (LF, CRLF for .ps1 and .cmd)
.claude/
├── hooks/                guard hooks (Node) and their tests
├── state/                experimental: task state in SQLite (see Requirements)
├── agents/               specialists, each with its own context
└── skills/               skills, running in the main conversation
DOCS/
├── PRD.md                the product, for whom, and what it does NOT do
├── CONTRACT.md           the contract and its rules
├── ARCHITECTURE.md       decisions, each with its cost declared
├── DESIGN-SYSTEM.md      tokens: color, spacing, typography
├── DATA.md               schema, migrations, access policies
├── INFRASTRUCTURE.md     server, deploy, DNS, secrets
├── HANDOFF.md            where the last session stopped; the next one starts here
├── HUMAN-CHECK.md        15 minutes of a person, after two robot rounds
├── examples/             a filled spec, report and "In this project" section
└── features/
    ├── _TEMPLATE.md              the IFO spec for a feature
    ├── _TEMPLATE-integration.md  external integration that touches security
    └── _TEMPLATE-spike.md        feasibility: hypothesis, number, result
```

### The skills

They run in the main conversation. That's the only place agents can be dispatched
from.

| Skill | When to use it |
|---|---|
| `/squadron-setup` | configure the repository, and re-adjust when something changes |
| `/product-manager` | I don't know what to do next |
| `/spec` | I need the spec before building |
| `/tech-lead` | I know what I want built |
| `/scrum-master` | just organizing the board |
| `/checkup` | how is the live project, with numbers |
| `/ship` | put it in production, with the guards |

### The agents

Default list. The truth is the files in `.claude/agents/`.

| Agent | Answers for |
|---|---|
| `product-owner` | is the pain real? whose? worth building? |
| `researcher` | has this been solved? how? what does it cost? |
| `software-architect` | how to build it, and what not to build |
| `frontend-developer` | the interface, consuming only the contract |
| `backend-developer` | the API, fulfilling the contract exactly |
| `data-engineer` | schema, migrations, access policies |
| `ux-designer` | visual consistency |
| `quality-assurance` | where this breaks |
| `security-engineer` | what can leak or be exploited |
| `devops-engineer` | how it leaves here and stays up |

---

## How to use it

**1. Bring it into your project.** Two paths:

*New project:* this repository becomes the project.

```bash
git clone https://github.com/YellowKode-Academy/squadron my-project
cd my-project
rm -rf .git && git init
cp .mcp.example.json .mcp.json
```

*Existing project:* copy only `.claude/agents/`, `.claude/skills/`, `.claude/hooks/`
and `DOCS/features/` + `DOCS/examples/` into it. Don't copy `CLAUDE.md`, the other
documents, `.mcp.example.json` or `settings.json` over yours: setup adds to them
and shows each change as a diff first.

**2. Configure it.** Open Claude Code in the folder that holds `.claude/` (opened one
level above, the agents are invisible) and run:

```
/squadron-setup
```

It looks at what already exists in the directory and tells which path it is on. New
project: it asks five questions and adapts `CLAUDE.md` and the documents. Existing
project: it only adds, a `## Squadron` section at the end of your `CLAUDE.md`, an
`## In this project` section in each agent, and a map from our document names to
yours. Your rules win where the two differ.

The five:

1. Are you alone or with other people?
2. Is it a new project or is there code already running?
3. Do you already know what you're going to build?
4. Does it have a UI, a server, a database? Where does it ship?
5. Will it handle logins, payments or personal data?

Each one changes something real — above all **what to keep and what to delete**,
recommended piece by piece with the evidence from your project. You decide.

**Already have a project document?** Pass it straight in, and it only asks what's
missing:

```
/squadron-setup PRD.md
/squadron-setup https://link-to-your-document
```

**Something changed later?** Run it again, pointing at what changed:

```
/squadron-setup adjust for we now have a database
/squadron-setup adjust for another person joined the team
```

**3. Start.** The first useful thing is almost never code:

```
/product-manager    →  what do we do first?
/spec <feature>     →  write it before building
/tech-lead <thing>  →  build it
```

New or edited skills are picked up live. Agents should be too; if `/agents` does
not list one you just added, restart the session.

**Headless runs (`claude -p`, CI, scheduled jobs).** Open the folder once with plain
`claude` and accept the trust prompt. Until then, headless runs ignore every
`permissions.allow` entry of this repository (`deny` and `ask` apply right away).
Flags and settings keys age: this was written against the Claude Code docs of
2026-11-07 (checked with 2.1.197).

**Permissions.** `.claude/settings.json` denies reading secrets and force pushes,
asks before push and merge, and allows only narrow commands (dangerous recursive
deletes are the hook's job, so `rm -rf dist` still works). If you
approve the same safe command again and again, add a narrow allow rule. Never
widen to the whole tool. Want it stricter? Set `"defaultMode": "default"`.

---

## Requirements

The guard hooks need **Node >= 20** and **git** on the PATH. No npm packages. Check
that they run, not only that they exist (on Windows, `python3` can be a Store stub
that does nothing; `node --version` must print a version):

```bash
node --version
node --test .claude/hooks/hooks.test.mjs
```

The hooks block a commit on main, a force push, a recursive delete outside the
project, reading or printing `.env` and key files, a commit that adds a secret
(`commit -a` included) and a prompt that contains one. Each fails closed: input
they cannot parse is blocked, not allowed.

Honest limit: Claude Code only blocks when a hook exits with code 2. If `node` is
missing, the hook command fails with another code and the action goes through. On
Claude Code 2.1.295 or later you can add `"onFailure": "block"` to each hook
entry in `settings.json` to block in that case too; without Node that blocks every
shell command, so install Node or delete the `hooks` block.

**Who may commit on main.** Nobody, by default. If you commit on main on purpose,
put your git `user.name` in `.claude/settings.json`:
`"env": { "SQUADRON_MAIN_COMMITTERS": "Your Name" }` (comma list, case-insensitive).
Everyone else keeps working on branches. It guards against accidents, not against
someone who rewrites their own git config.

**Testing the guards.** Put the case in a file (`echo '...' > case.json`) instead of
typing a dangerous command inline. Quoted text is treated as data, but `bash -c`,
`eval`, `powershell -Command` and `cmd /c` are inspected, and when in doubt the hook
blocks.

### Experimental: state in SQLite

Markdown stays the place for meaning (specs, briefs, decisions).
`.claude/state/state.mjs` keeps state that changes often (tasks, agent, status,
model, tool calls, tokens, timestamps) in a local, git-ignored `squadron.db`. It
needs **Node >= 22.13** (built-in `node:sqlite`, no packages). On Node 20 it prints
one line and exits; the hooks are unaffected.

```bash
node .claude/state/state.mjs init
node .claude/state/state.mjs add "Password reset" --agent backend-developer --spec DOCS/features/password-reset.md
node .claude/state/state.mjs start 1
node .claude/state/state.mjs done 1 --tool-calls 120 --tokens 180000 --model sonnet
node .claude/state/state.mjs list --status open
node .claude/state/state.mjs report   # per agent and model
node .claude/state/state.mjs export   # writes .claude/state/STATE.md for anyone to read
```

Also `block <id> "<reason>"`. To judge it, run one cycle with it and one without, and
compare the time spent re-finding state, the handoff size, and how visible the
cost was. Delete the folder if it doesn't pay.

---

## MCP

`.mcp.example.json` ships with **Playwright**, which is what lets agents open the
application and actually use it instead of only reading code.

```bash
cp .mcp.example.json .mcp.json
```

Two agents depend on it and get noticeably worse without it:

- **`quality-assurance`** navigates the screens, resizes to 375px, checks the
  console, and tries to break things the way a user does. Without a browser it
  can only read code, and reading code doesn't catch broken layout.
- **`researcher`** opens documentation and repositories that search results don't
  surface, and tests a tool when testing is possible. One test beats five
  articles.

`ux-designer` also uses it to compare screens side by side. Reading the code
catches some inconsistencies; seeing the screen catches alignment and vertical
rhythm.

Add whatever else you use — database, issue tracker, deployment platform — and
declare the permission in `.claude/settings.json`.

The server version is pinned and runs with `--isolated` (the browser profile
stays in memory). `browser_run_code_unsafe` is denied and `browser_evaluate` asks.
On Windows, if `npx` is not found by the MCP launcher, use
`"command": "cmd", "args": ["/c", "npx", "-y", "@playwright/mcp@0.0.84", ...]`.

**Before adding an MCP server:** last commit under 12 months old, more than one
maintainer, readable source, documented tools, the narrowest scope that does the job
(read-only if you only read), credentials via `${ENV_VAR}` and never in the file.
Pin the version. Agents inherit every server: if only `quality-assurance` needs it,
give it to that agent only.

> `.mcp.json` stays out of Git on purpose: it may hold paths and credentials
> specific to your machine. `.mcp.example.json` is the versioned one.

---

## This is generic. Adapt it.

**The rules here are what works in the project it came from.** Not all of them
will fit yours.

What you'll probably want to change:

| Where | What |
|---|---|
| `CLAUDE.md` | everything in brackets, the conventions, the commands |
| `CLAUDE.md` lines under "The project" | contract file, docs folder, test and deploy commands, staging, test account |
| `CLAUDE.md` › Budget | how many agents at once, when to start fresh, which model for which work |
| `DOCS/DESIGN-SYSTEM.md` | the spacing scale and the tokens |
| `.claude/agents/*` | what each specialist always checks in **your** project |
| `.claude/settings.json` | the deny, ask and allow rules, and the MCPs you actually use |
| `.claude/hooks/` | Needs Node >= 20. No Node? Delete the `hooks` block in `settings.json`: the deny and ask rules still protect you, the hooks do not |

**While there are `[ ]` in the files, the repository isn't yours yet.**

---

## Delete what you don't use

The most important part of this README, and the one almost nobody follows.

Someone who built 100 subagents and kept 12 put it well: **subtraction is the
whole game.** Too many agents make routing worse — similar descriptions confuse
who calls whom, and you end up with a team that gets in the way.

Honest suggestions:

- **Not deploying it yourself?** Delete `devops-engineer`.
- **No database?** Delete `data-engineer`.
- **No interface?** Delete `ux-designer` and `frontend-developer`.
- **Working alone, no board, features already decided?** `scrum-master` and
  `product-manager` will probably sit idle. Setup recommends it with your evidence.
- **Never evaluating new technology?** Delete `researcher`.
- **No deploy of your own?** Delete `ship` (and `devops-engineer`).
- **Nothing in production yet?** Delete `checkup`.
- **No Node?** Delete the hooks (see Requirements).

An agent you never call is not neutral: it costs context and pollutes the choice.
Delete without guilt, you can always bring it back.

**Delete freely: the skills adapt.** Every skill starts by reading
`.claude/agents/` to find out who actually exists, instead of trusting the list
written inside it. If an agent is gone, it says which step is uncovered instead of
failing halfway. If you created a new agent, it reads the description and uses it.

**The minimum that still makes sense:** `spec` + `tech-lead` +
`frontend-developer` + `quality-assurance`. That already delivers the essentials
— think first, build, and someone with no context trying to break it.

---

## Two things worth keeping

If you change everything else, keep these two. They're what makes the rest work.

**The contract.** All data crosses one contract: one place for the shapes, every call
asynchronous, an error you can force. While the backend is still a mock, add a
deliberate 300ms delay. It sounds trivial and is the most important mock-first
rule: with it you are forced to build the loading state; without it your app only
works on an internet that doesn't exist.

**The agents' context budget.** Each one has a line limit on its report. A
subagent exists to hold volume away from the main conversation — if it returns a
huge report, it undoes its own reason for existing.

---

## Spend less, lose less

Running a team of agents for a week teaches the same lessons every time. They are in
`CLAUDE.md` › Budget and in `/tech-lead`, as defaults to adapt:

- **Seniority by model.** Mechanical work on the cheapest model, engineering on the
  middle one, judgment on the top one. Set per call.
- **A ceiling on parallel agents**, and a fresh agent instead of resuming one with a
  huge history.
- **Scripts wait, agents don't.** Long tests write to a file; the agent reads it once.
- **Two robot rounds, then a person.** AI review stops improving things; 15 minutes
  of someone using it doesn't (`DOCS/HUMAN-CHECK.md`).
- **The lesson goes back in writing.** Every correction becomes a line in the agent's
  file or in Gotchas, so it isn't repeated next week.
- **Short sessions, one handoff file** (`DOCS/HANDOFF.md`), so a crash or a new
  session loses nothing.
- **Agents talk.** A finding goes to the agent still working on it, not into a
  reopened task.
- **Markdown for meaning, a database for state** (experimental, `.claude/state/`).

---

## Updating

The squadron has no installer: you copy files. To update, compare your `CLAUDE.md`
`Squadron version:` with the latest tag and read `CHANGELOG.md`. Take agents, skills
and hooks you never edited; merge by hand the ones you did. Never overwrite
`CLAUDE.md` or `DOCS/`: they are yours. Run `/squadron-setup adjust for the new
version` and it lists what changed since your version.

---

## Improvements welcome

This repository is generic on purpose, and generic always has room to improve.

If you adapted it to your context and found something that helps everyone, open
an issue or a PR. What helps most:

- **An agent you created and actually use**, with the reason it earns its own
  context
- **A rule you added to `CLAUDE.md`** after getting burned
- **An agent from here that you deleted**, and why — that's worth as much as
  adding one
- **A document in `DOCS/` that was missing** in your project

The bar for inclusion: **it has to earn its own context.** If the main
conversation already does it well, it doesn't become an agent.

---

## Where this came from

Born out of a Build in Public series by
[YellowKode](https://yellowkode.com), building a SaaS from zero to live with
an agent squad.

The roles weren't invented: they're the jobs on a real software team — Product
Owner, Tech Lead, QA, DevOps, Security — each with the responsibility it has in
real life.

---

Tested with Claude Code 2.1.197 on 2026-11-07. The v0.3 rules come from real
projects run with the squadron; v0.3 itself has not been through a full project yet.
