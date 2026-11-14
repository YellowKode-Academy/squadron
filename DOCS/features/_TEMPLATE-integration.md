# [Integration name, written as a result for the user]

> Use this instead of `_TEMPLATE.md` when the feature talks to something outside
> your system and touches security: a webhook, OAuth, a payment, a third-party API.
> Same IFO base, no 15-line limit: every extra section here exists because
> integrations fail at the edges.

**Status:** draft | approved | building | live
**Card:** [link]
**Size:** S | M | L  *(L doesn't enter a cycle: split it first)*

---

## Why it exists

[Which pain, whose.]

**Evidence:** [literal quote, and where you saw it]
**What they do today without this:** [the workaround]

---

## The spec · IFO

### Input · what comes in

- [payload or request: fields, types, required or not, limits]
- [who sends it, and how you know it's them: signature, token, IP rule]

**Cases that aren't the happy path:**
- [malformed payload]
- [valid payload, unknown account]
- [the same event arrives twice]
- [no permission]

### Flow · what happens in between

1. [step]
2. [step]

**Where it can fail:**
- [failure] → [what happens then]

### Output · what comes out

**Success:** [what the person sees, what changes in the system]
**Error:** [which error] → [what the person sees, how they get out]

---

## Trust boundaries

Who controls each field. Anything the caller controls is input, not truth.

| Field | Controlled by | Used for | Trusted? |
|---|---|---|---|
| [field] | caller / us / provider (verified) | [routing, auth, display] | no / yes, because [..] |

- **Never route, authorize or pick an account by a field the caller controls.**
  Derive it from something you hold: the verified signature, your own record.
- [Where the payload is verified, and what happens if verification fails]

## Secrets and where they live

| Secret | Lives in | Who can read it | Rotation |
|---|---|---|---|
| [name] | [secret store / env var, never the repo] | [role or service] | [how, how often] |

- Not in code, logs, error messages, URLs or the frontend bundle.
- [What happens to stored values when the secret rotates]

## Failure and retry

- **Idempotency:** [the key that makes a repeat harmless, and where it's stored]
- **Retries:** [who retries, how many times, with what backoff]
- **Revoked or expired key:** [what the system does, who is told, how it recovers]
- **Rate limit:** [the provider's limit, and what we do when we hit it]
- **Provider down:** [what the person sees, what is queued, what is dropped]

## What the third party can see

- [data we send, field by field, and why each is needed]
- **No credential, token or personal data in URLs** we hand to analytics, redirects
  or any service that logs URLs.
- [what the provider stores, and for how long]

## Permissions at session start

*Only if an agent runs this headless (no one to approve prompts).*

- **Allowed:** [exact tools and commands, listed up front]
- **Denied:** [what it must never do, e.g., writing outside `[path]`]
- **At a limit:** stop and report. Never widen permissions to get unstuck.

---

## Contract

```ts
[new types and functions, exact names and formats. Or "nothing changes".]
```

## Acceptance criteria

- [ ] [verifiable behavior]. Check: [command, test or screen]
- [ ] A forged or unsigned request is rejected. Check: [test]
- [ ] The same event twice changes state once. Check: [test]
- [ ] A revoked key produces [behavior]. Check: [test]
- [ ] No secret appears in logs or responses. Check: [grep or test]
- [ ] Loading, error and empty states exist

## Out of scope

- [doesn't do]

## Decisions

| Decision | Why | What we gave up |
|---|---|---|
| [what] | [reason] | [cost] |

## Owner decisions (open)

| Question | Reading A | Reading B | Decided (date) |
|---|---|---|---|
| [what] | [..] | [..] | |

## Record

- [ ] Spec approved
- [ ] Built
- [ ] `security-engineer` passed *(required)*
- [ ] `quality-assurance` passed
- [ ] Live

**What the spec didn't foresee:**
[what showed up in practice]
