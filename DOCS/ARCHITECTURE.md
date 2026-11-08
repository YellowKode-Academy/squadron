# Architecture

> What was decided, and above all **what we gave up**.
> Owned by `software-architect`.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | [ ] | [ ] |
| Backend | [ ] | [ ] |
| Database | [ ] | [ ] |
| Hosting | [ ] | [ ] |

## Folder structure

```
src/
├── lib/
│   └── api.ts        ← the contract (example path). see DOCS/CONTRACT.md
├── [ ]
└── [ ]
```

---

## Decisions

> One per block. A document that decides ten things doesn't get read.
> **The most important field is "what we gave up".** A decision with no declared
> cost is marketing, not a decision.

### [ADR 001] · [the decision in one sentence]

- **Date:** [ ]
- **Context:** [what problem was on the table]
- **Alternatives considered:** [the two or three real ones]
- **We chose:** [what]
- **Why:** [reason]
- **What we gave up:** [the accepted cost]
- **Consequence:** [what gets easier, and what gets harder]
- **Signal to revisit:** [what would show this decision has aged]

---

## Principles for this project

- **Prefer boring that works.** Interesting technology gets expensive when it
  breaks at eleven at night.
- **Optimize for reversibility.** Between two similar options, the one that's
  cheaper to abandon.
- **One person maintains this.** A solution that assumes someone on call is wrong
  here.
- **The contract comes before the implementation.** See `DOCS/CONTRACT.md`.

## What was refused

| Request | Why not | What we did instead |
|---|---|---|
| [ ] | [ ] | [ ] |
