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

**All data goes through `src/lib/api.ts`. No exceptions.**

That file is not throwaway code, it is **the contract**: it declares what the
backend must return, and the frontend consumes it without knowing whether the
data is mocked or real.

Four rules, none of them optional:

1. **Every function is `async`**, even when returning a mock. Born `async`, lives
   `async`.
2. **A deliberate 300ms delay** in the mock. Without it you build the whole app
   with no loading state and only find out when you wire up the real thing.
3. **A way to force an error.** The error screen is the one nobody builds, and
   the only one the user sees on their worst day.
4. **No mocked data outside that file.** None.

Details in `DOCS/CONTRACT.md`.

**Practical consequence:** frontend and backend work in parallel without talking
to each other. If one is waiting on the other, the contract is incomplete or
somebody broke the rule.

---

## Definition of done

Nothing is called done without this:

- [ ] The IFO spec exists and is current
- [ ] Every acceptance criterion answers yes
- [ ] All three states exist: loading, error, empty
- [ ] `ux-designer` passed, or the findings became cards
- [ ] `quality-assurance` passed with no **blocker** findings
- [ ] No new mocked data outside `src/lib/api.ts`
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

**Enter at the right level:**

| Situation | Command |
|---|---|
| First time, or something changed | `/squadron-setup` |
| I don't know what to do next | `/product-manager` |
| I know what I want built | `/tech-lead` |
| I need the spec first | `/spec <feature>` |
| Just organizing the board | `/scrum-master` |

Running three layers to change a button color is bureaucracy, not process.

**The table above is the default expectation.** The truth is whatever is in
`.claude/agents/`. Every skill starts by reading that folder, so you can delete
or add agents without breaking anything.

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
- Put mocked data outside `src/lib/api.ts`
- Put a secret key in the frontend: it gets baked into the build and is visible
- Commit `.env`
- Say it's done without running it
- Change the contract on one side only
