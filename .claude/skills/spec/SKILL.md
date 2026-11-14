---
name: spec
description: Writes or updates the IFO spec for a feature before any code exists. Use it whenever something new is going to be built, and whenever reality contradicts what was written. Invoke with /spec followed by the feature name.
---

# Spec · the IFO method

You write the spec that comes before the code. Fifteen well-written lines, not
three pages.

**Why this exists:** the agent is too fast. It builds the wrong thing before you
notice you asked for the wrong thing. The spec is the brake that forces you to
think before something very quick thinks for you.

---

## First: see who's on the team

Follow **Team discovery** in CLAUDE.md before planning anything.

If `product-owner` or `software-architect` don't exist, fill the blocks that
depend on them by asking whoever is driving.

---

## The method

Three blocks. Always all three, always in this order.

### I · Input — what comes in

The data that arrives, **with the real cases, not just the happy ones.**

Everybody writes the happy path. The value is in the rest: empty field, value out
of range, record that already exists, person without permission.

**The question that breaks a lazy spec:** *"and what if it already exists?"* Ask
it every time. If there's no answer, the spec isn't ready.

### F · Flow — what happens in between

The sequence, step by step, **including what fails.**

For each step, ask: if this step fails, what happens? A flow that only describes
success is half a flow.

### O · Output — what comes out

The result, **and what comes out when it goes wrong.**

It's not enough to say an error message appears. Say which one, and how the
person gets out of that state.

---

## How to run it

**1. Find out whether the pain is real.** If the request has nobody suffering
from it, call the `product-owner` agent first. A spec for an invented problem is
expensive waste.

**2. Write the IFO.** Pick the template by kind, in `features/` inside the docs
folder (`Docs folder:` in CLAUDE.md), copy it to `features/<feature-name>.md` and
fill it in:

| Kind | Template |
|---|---|
| A feature for the user | `_TEMPLATE.md` (15 lines of IFO) |
| An external integration that touches security (webhook, OAuth, payment) | `_TEMPLATE-integration.md`, no line limit |
| "Can this even work?" | `_TEMPLATE-spike.md`: hypothesis, number, result |
| A text tweak | no spec |

A filled example: `examples/spec-example.md`.

Write the **title as a result for the user**, never as a technical task:
- Bad: *"Create POST /clients endpoint"*
- Good: *"Register a new client from the clients screen"*

**3. Declare the contract.** What this feature adds or changes in
the contract file: field names, types, date format, error format. If nothing
changes, write "nothing changes".

This is the part that lets frontend and backend work in parallel. See
`CONTRACT.md` in the docs folder.

**4. Write what's out of scope.** What this feature explicitly does not do. It's
the part that prevents the most rework and the one almost everyone skips.

**5. Verifiable acceptance criteria.** Each line answerable yes or no by someone
else, with no interpretation. Always include all three states: loading, error,
empty.

---

## When the spec already exists

Two situations, and both end here:

**Reality contradicted the spec.** A case showed up that wasn't covered. **Fix
the spec, not just the code.** And record it in the *"what the spec didn't
foresee"* field — that field is the most valuable thing in the document, because
it's where you learn to write better specs.

**The scope changed.** Update it and record what changed and why. An outdated
spec is worse than no spec: it lies with authority.

---

## The test that decides

> **If you can't write the three blocks, you don't know what you want yet.** And
> coding is the worst possible move.

When you get stuck on a block, don't force it. That's information: either
discovery is missing (back to `product-owner`), or a technical decision is
missing (call `software-architect`), or the card is too big and needs splitting.

## Rules

- A spec with an open Owner decision is not `approved`.
- **Don't build anything.** You write the spec. Building belongs to `tech-lead`
  and the devs, afterwards.
- **One feature, one spec.** If you need "and" to explain what the feature does,
  it's two.
- **Time it.** A good spec takes a few minutes. If it's taking an hour, the scope
  is too big.
- **Fifteen lines.** A long document doesn't get read, and an unread spec is
  decoration.
