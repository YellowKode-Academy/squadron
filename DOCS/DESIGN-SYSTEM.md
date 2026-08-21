# Design system

> Decided once, obeyed always.
> Owned by `ux-designer`. Consulted by `frontend-developer` **before** writing any
> new style.

---

## Why this exists

When the interface is generated screen by screen by an AI, each screen comes out
with slightly different spacing, a slightly different shade, a slightly different
button. None of them is wrong on its own. Together, the product looks like five
products stitched together.

**It's cheap to define at the start and expensive to fix at the end.** It's what
visually separates an amateur project from a product.

---

## Color

| Token | Value | Use |
|---|---|---|
| `[ ]` | `#[ ]` | [ ] |

> Two different greys for the same secondary text is the most common deviation
> and the most invisible. One role, one token.

## Spacing

Scale: `4, 8, 12, 16, 24, 32, 48, 64`

**Every padding and margin lands on the scale.** A value outside it is a magic
number, and a magic number is where inconsistency starts.

## Typography

| Token | Size | Weight | Use |
|---|---|---|---|
| `[ ]` | [ ] | [ ] | [ ] |

> If the whole product has more than five sizes, someone invented one.

## Radius, shadow and border

| Token | Value |
|---|---|
| `[ ]` | [ ] |

---

## Components

| Component | Where it lives | Variants |
|---|---|---|
| [ ] | `[ ]` | [ ] |

**Before creating a component, look for a similar one.** If it exists, extend it
instead of duplicating. The same element on different screens is the same
component.

## Interaction states

Every clickable element has: default, hover, visible focus, disabled.

**Visible focus is not optional:** keyboard users depend on it.

---

## Accepted deviations

> A deliberate deviation isn't a deviation, as long as it's recorded.

| Where | What stands out | Why |
|---|---|---|
| [ ] | [ ] | [ ] |
