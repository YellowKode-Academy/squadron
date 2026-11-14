# The contract

Default location: `src/lib/api.ts`. The real path is the `Contract file:` line in
`CLAUDE.md`.

The first three rules below and the last one are core. The 300ms delay is
mock-first: it matters while the backend is still fake.

> The central rule of this project. If you only read one document in this folder,
> read this one.

---

## The problem it solves

AI tooling generates the interface screen by screen, and each screen is born with
its own invented data inside the component. None of them is wrong on its own.
Together, the fake data is scattered across fifteen places.

Then comes the moment to wire up real data and the project falls apart: the
backend returns one shape, the frontend expected another, the screen breaks, and
a back-and-forth starts that lasts weeks.

**The fix is to concentrate all mocked data in a single file.** Once you do that,
the file stops being throwaway code and becomes **the contract**.

This has a name and it's old: **contract-first**. The difference is that today it
fits in thirty lines.

---

## What it looks like

```ts
// src/lib/api.ts  (example path)

export type Client = {
  id: string
  name: string
  email: string
  createdAt: string   // ISO 8601
}

const MOCK: Client[] = [
  { id: '1', name: 'Ana', email: 'ana@x.com', createdAt: '2026-08-01T10:00:00Z' },
]

export async function listClients(): Promise<Client[]> {
  await delay(300)
  return MOCK
}
```

The component calls `listClients()`. That's it. It does not know, and must not
know, where the data comes from.

When the backend exists, **one function changes**:

```ts
export async function listClients(): Promise<Client[]> {
  const r = await fetch(`${BASE}/clients`)
  if (!r.ok) throw new ApiError(r.status)
  return r.json()
}
```

No component changes. The screen never notices.

---

## The four rules

None of them optional. Each exists because of a mistake that already happened.

### 1. Every function is `async`, even returning a mock

If the mock is synchronous, you write the whole app with no loading state. Then
you wire up the real thing and every screen flashes, breaks, or shows empty.

**Born `async`, lives `async`.**

### 2. A deliberate 300ms delay

It sounds trivial. It's the most important of the four.

With the delay you are **forced** to see loading, and therefore to build it.
Without it, your app only works on an internet that doesn't exist.

### 3. A way to force an error

A flag, a special id, anything. Because the error screen is the one nobody
builds, and the only one the user sees on their worst day.

### 4. No mocked data outside this file

None. The day a mock moves back inside a component, the contract stops holding —
and you won't remember that three weeks later.

---

## What this unlocks

**Frontend and backend work in parallel without talking to each other.** The
contract already said everything that needed agreeing. Each side reads the same
file and works.

> If one is waiting on the other, the contract is incomplete or someone broke the
> rule. That's the symptom, not the cause.

**The agent gets it right the first time.** Compare the two requests:

| Request | Result |
|---|---|
| *"build me a clients backend"* | invents `created_at` where the frontend expects `createdAt`, wraps it in `{ data: [...] }`, and you spend the afternoon fixing it |
| *"read the contract file and implement exactly this contract"* | gets it right, because nothing was left to guess |

**The AI wasn't getting it wrong because it's dumb. It was getting it wrong
because nobody had told it what right was.** The contract is you telling it.

---

## Who obeys what

| Role | Obligation |
|---|---|
| `software-architect` | decides the format **before** any code exists |
| `frontend-developer` | consumes only from here; if a function is missing, creates it with a mock before using it |
| `backend-developer` | implements exactly this: same field, same type, same format |
| `data-engineer` | if the database stores it differently, translates at the edge; the frontend never knows |
| `quality-assurance` | a mock outside this file is a bug, even if the screen works |

**Changing the contract is a decision, not a repair.** It changes on both sides,
on purpose, and the document is updated with it.

---

## When the API already exists

The project has a real backend and nothing to mock. The contract still exists, in
a different shape:

- It can be a **typed client**, an **OpenAPI file**, or the **DTOs** the backend
  already publishes.
- Point `Contract file:` in `CLAUDE.md` at it. Same obligations: one place, nobody
  invents a field.
- **Mock-first rules don't apply** to a real backend: no 300ms delay, no mocked
  data, no forced-error flag. Use the real error cases (4xx, 5xx, timeout).
- In languages without async by default (Go, PHP), "everything async" means
  **every call can fail and take time**: handle errors, set timeouts, and give the
  caller a loading and an error state.

---

## Current state

> Fill this in as the project moves.

- **File:** [same as `Contract file:` in CLAUDE.md]
- **Entities declared:** [list]
- **Still mocked:** [list]
- **Already real:** [list]
