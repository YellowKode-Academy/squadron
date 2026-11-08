# Data

> Schema, migrations and access policies.
> Owned by `data-engineer`. Starts from the contract, never from scratch.

---

## The starting point

The data format **was already decided** in the contract file. Modeling starts
there.

That doesn't mean copying it verbatim. It means **any difference between the
database and the contract is deliberate and translated at the edge**, never
leaking to the screen. If the database stores `created_at` and the contract says
`createdAt`, the conversion happens in the backend and the frontend never finds
out.

---

## Tables

### `[name]`

| Column | Type | Nullable? | Note |
|---|---|---|---|
| `id` | [ ] | no | |
| `[ ]` | [ ] | [ ] | |

- **Indexes:** `[column]` — [which query it serves]
- **Relationships:** [ ] → [ ] ([what happens when the parent is deleted])

> A date is a date, not a string. Money is not a float. A boolean is not `"yes"`.
> Getting this wrong is cheap today and expensive in every future query.

---

## Access policies

**Every table has policies enabled. A table with no policy is an open table.**
This is the most common and most serious mistake.

| Table | Who reads | Who writes |
|---|---|---|
| [ ] | [ ] | [ ] |

The service key never leaves the server. The client uses the public key.

---

## Migrations

Every schema change is a versioned migration, never a change made by hand in a
dashboard.

- One migration does one thing
- Every migration knows how to undo itself
- **Never drop a column in the same release that stops using it.** Stop using it,
  ship, confirm, and only then drop
- A migration that changes existing data runs against a copy first

| # | What it does | Date |
|---|---|---|
| [ ] | [ ] | [ ] |

---

## What this model makes hard

> Every model makes one thing easier and another harder. Say which.

[ ]

## Backup

- **Frequency:** [ ]
- **Where:** [ ]
- **Restore tested?** [ ]

> If you have never tested restoring it, you don't have a backup. You have hope.
