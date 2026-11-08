# CLAUDE.md

Rules for this project. Read every session, by me and by every agent on the squad.

> **First time in this repository?** Run `/squadron-setup`. It fills this file in, adapts
> the rules to your context, and tells you which agents to delete.
>
> **Something changed since?** `/squadron-setup adjust for <what changed>`. Someone joined
> the team, a database appeared, the product became something else: run it again.
>
> **While there are `[ ]` here, this project is not configured yet.** If you are
> an agent and you hit a `[ ]` in a document you depend on, say so instead of
> assuming a value.
>
> Before adding a line here: does it change behavior in every task, and will
> someone update it when reality changes? If not, it is a prompt or a document,
> not a rule.

---

## The project

- **Name:** [name]
- **What it is:** [one sentence. what it does, for whom]
- **Stage:** [ideation | building | live]

## How we work: Spec Driven Development

**Nothing gets built before a spec exists.** Not because process is pretty, but
because the agent is too fast: it builds the wrong thing before you notice you
asked for the wrong thing.

The spec follows the **IFO** method, and fits in 15 lines:

- **I — Input:** what comes in, with the real cases, not just the happy ones
- **F — Flow:** what happens in between, including what fails
- **O — Output:** what comes out, and what comes out when it goes wrong

One spec per feature, in `DOCS/features/`. Template at
`DOCS/features/_TEMPLATE.md`.

**If you can't write the three blocks, you don't know what you want yet — and
coding is the worst possible move.** Stop and go back to `product-owner`.

When reality contradicts the spec, **fix the spec, not just the code.** An
outdated spec is worse than no spec, because it lies with authority.

---

## Where the truth lives

Before deciding anything, read what has already been decided. In this order:

| File | Answers |
|---|---|
| `DOCS/PRD.md` | what the product is, for whom, and what it is not |
| `DOCS/features/*.md` | the IFO spec for each feature |
| `DOCS/CONTRACT.md` | how data crosses the system |
| `DOCS/ARCHITECTURE.md` | what was decided, and why |
| `DOCS/DESIGN-SYSTEM.md` | color, spacing, type, components |
| `DOCS/DATA.md` | schema, migrations, access policies |
| `DOCS/INFRASTRUCTURE.md` | where it runs, how it ships, what needs secrets |

**An outdated document is a bug.** When behavior changes, update the document in
the same delivery.

---

## The rule that never bends: the contract

**All data crosses the system through one contract. No exceptions.**

Contract file: [src/lib/api.ts]

Every agent reads the path from this line. The contract declares what the backend
returns and what the frontend consumes. Whether the data behind it is mocked or real
is invisible to the screens.

Core rules (always):
1. The contract lives in one place (one file or one folder). Data shapes are not
   declared anywhere else.
2. Every call is asynchronous, mocked or real.
3. The error path can be forced on demand.
4. No fake data outside the contract.

Mock-first rules (only while there is no real backend; `/squadron-setup` removes
this block otherwise):
5. The mock waits about 300 ms, so loading states get built.
6. Screens handle loading, error and empty.

Details in `DOCS/CONTRACT.md`.

**Practical consequence:** frontend and backend work in parallel without talking
to each other. If one is waiting on the other, the contract is incomplete or
somebody broke the rule.

---

## Definition of done

Nothing is called done without this:

- [ ] The IFO spec exists and is current
- [ ] Every acceptance criterion answers yes
- [ ] All three states exist: loading, error, empty (mock-first)
- [ ] `ux-designer` passed, or the findings became cards
- [ ] `quality-assurance` passed with no **blocker** findings
- [ ] No new fake data outside the contract file
- [ ] Backend returns exactly what the contract declares
- [ ] Works on mobile at 375px
- [ ] Console is clean
- [ ] If it touches credentials: `security-engineer` passed
- [ ] Affected documents updated

---

## The squad

Skills conduct, agents execute.

```
product-manager        what now, and why
       ├── scrum-master   process, board, cycle
       └── tech-lead      delivery, and it dispatches the agents
```

Who is on the team: the files in `.claude/agents/`. Default list in README.

**Enter at the right level:**

| Situation | Command |
|---|---|
| First time, or something changed | `/squadron-setup` |
| I don't know what to do next | `/product-manager` |
| I know what I want built | `/tech-lead` |
| I need the spec first | `/spec <feature>` |
| Just organizing the board | `/scrum-master` |

Running three layers to change a button color is bureaucracy, not process.

## Team discovery

Before planning, list `.claude/agents/` and read each file's `name` and `description`.
**The folder is the truth**; any list written elsewhere is only the default
expectation, because this repository is meant to be pruned.
- An agent that is gone: do not invent a replacement. Say which step is now
  uncovered. If it is small, do it yourself and say so.
- An agent you did not know about: read its description and use it if it fits.
- The folder is empty or nearly so: work in the main conversation and say you are
  working without the team.

---

## Code conventions

- **Language:** code, comments and documents in English
- **Comments explain why, never what.** The code already says what.
- **No magic numbers.** A value that appears from nowhere becomes a named
  constant.
- **Errors are never swallowed.** An empty `catch` is a bug.
- [other conventions for this project]

## Commands

```bash
[install]    # npm install
[run]        # npm run dev
[test]       # npm test
[build]      # npm run build
[typecheck]  # npx tsc --noEmit
```

**Run the type check before saying you're done.** A passing build does not mean
correct types.

---

## Never do this

- Build without a spec
- Put fake data outside the contract file
- Put a secret key in the frontend: it gets baked into the build and is visible
- Commit `.env` (blocked by a hook)
- Commit on main (blocked by a hook)
- Say it's done without running it
- Change the contract on one side only
- Loosen `.claude/settings.json`, a hook, or an agent's tools without review (treat
  them like production code)

These hooks cover Bash, PowerShell and the file tools. If you add an MCP tool that
can commit or write files, add its matcher too.
