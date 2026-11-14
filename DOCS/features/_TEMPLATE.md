# [Feature name, written as a result for the user]

> Copy this file to `DOCS/features/<feature-name>.md` and fill it in.
> **Nothing gets built before this exists.**
>
> Touches security (webhook, OAuth, payment, third-party API)? Use `_TEMPLATE-integration.md`. Unsure it's feasible? Use `_TEMPLATE-spike.md`. A text tweak needs no spec.

**Status:** draft | approved | building | live
**Card:** [link]
**Size:** S | M | L  *(L doesn't enter a cycle: split it first)*

---

## Why it exists

[Two or three lines. Which pain, whose.]

**Evidence:** [the literal quote from someone with the problem, and where you saw
it]
**What they do today without this:** [the ugly workaround they already use]

> If the answer above is "nothing", stop. The pain doesn't hurt enough.

---

## The spec · IFO

The heart of the document. Fifteen well-written lines beat three pages.

### Input · what comes in

[The data that arrives, with **the real cases, not the happy ones**.]

- [field: type, required or not, limits]
- [where it comes from: form, URL, another system]

**Cases that aren't the happy path:**
- [empty field]
- [value out of range]
- [the record already exists]
- [the person lacks permission]

### Flow · what happens in between

[The sequence, step by step, **including what fails**.]

1. [step]
2. [step]
3. [step]

**Where it can fail:**
- [possible failure] → [what happens then]
- [possible failure] → [what happens then]

### Output · what comes out

[The result, and **what comes out when it goes wrong**.]

**Success:**
- [what the person sees]
- [what changes in the system]

**Error:**
- [which error] → [what the person sees, and how they get out of it]

---

## Contract

What this feature adds or changes in the contract file:

```ts
[new types and functions, with exact names and formats]
```

> If nothing changes in the contract, write "nothing changes".

---

## Acceptance criteria

Each line answerable yes or no by someone else, with no interpretation.
Each one has a `Check:` (the command, test or screen that proves it).

- [ ] [verifiable behavior]. Check: [command, test or screen]
- [ ] [verifiable behavior]. Check: [command, test or screen]
- [ ] Loading: [what appears while the data hasn't arrived]
- [ ] Error: [what appears when it fails, and how to retry]
- [ ] Empty: [what appears with no items, and the way out for the person]
- [ ] Works at 375px

---

## Out of scope

[What this feature explicitly **does not** do. The part that prevents the most
rework and the one almost everyone skips.]

- [doesn't do]
- [doesn't do]

---

## Decisions

[Only what was decided on purpose and someone might question later.]

| Decision | Why | What we gave up |
|---|---|---|
| [what] | [reason] | [cost] |

---

## Owner decisions (open)

> An ambiguous business rule is not fixed by an agent. Mark it, ask, wait.

| Question | Reading A | Reading B | Decided (date) |
|---|---|---|---|
| [what] | [..] | [..] | |

---

## Record

> Fill this in during and after. **When reality contradicts the spec, fix the
> spec here, not just the code.**

- [ ] Spec approved
- [ ] Built
- [ ] `ux-designer` passed
- [ ] `quality-assurance` passed
- [ ] `security-engineer` passed *(if it touches credentials or permissions)*
- [ ] Live

**What the spec didn't foresee:**
[the case that showed up in practice and wasn't written here. This is the most
valuable thing in the document: it's where you learn to write better specs.]
