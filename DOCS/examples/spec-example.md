# Reset a forgotten password from the login screen

> Example of `_TEMPLATE.md` filled in. The app, names and numbers are invented.

**Status:** approved
**Card:** [APP-42]
**Size:** M

---

## Why it exists

Users who forget their password can't get back in and write to support. Support
resets by hand, which takes hours.

**Evidence:** "I changed phones and now I can't log in. I just gave up." (support
inbox, three messages in one week)
**What they do today without this:** email support and wait for a manual reset.

---

## The spec · IFO

### Input · what comes in

- `email`: string, required, valid format, max 254 chars. Typed on the login screen.
- `token`: string, from the link in the email. Single use, valid 30 minutes.
- `newPassword`: string, required, 10 to 128 chars.

**Cases that aren't the happy path:**
- Empty or malformed email: inline error, nothing is sent.
- Email not registered: same response as success (never reveal who has an account).
- Requested twice in a row: the older token stops working.
- Token expired or already used: show "this link no longer works" with a button to ask again.
- More than 5 requests per hour for one email: stop sending, same neutral message.

### Flow · what happens in between

1. Person enters email and submits.
2. Server creates a token, stores only its hash, sends the email.
3. Person opens the link and enters a new password.
4. Server checks the token, saves the new password, ends all other sessions.

**Where it can fail:**
- Email provider is down → request is saved, retried 3 times, person sees the neutral message.
- Token check fails → no change, "this link no longer works".
- Password too short → inline error, token stays valid.

### Output · what comes out

**Success:**
- Step 1: "If that email has an account, we sent a link." Always this text.
- Step 4: person is logged in and sees "Password changed".
- Old sessions are ended; the token is marked used.

**Error:**
- Expired link → message plus "Send a new link".
- Network error → "Couldn't reach the server" plus a retry button, form kept.

---

## Contract

```ts
export type ResetResult = { ok: true } | { ok: false; reason: 'expired' | 'invalid' | 'weak' }

export async function requestPasswordReset(email: string): Promise<void>
export async function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<ResetResult>
```

> `requestPasswordReset` returns nothing on purpose: the caller can't tell whether
> the email exists.

---

## Acceptance criteria

- [ ] Known and unknown emails get the identical response. Check: test comparing both bodies and timing class
- [ ] Token works once. Check: confirm twice, second returns `expired`
- [ ] A new request kills the previous token. Check: test
- [ ] Token is stored hashed. Check: inspect the table
- [ ] Loading: button disabled with "Sending..." until the response
- [ ] Error: server failure shows a message and keeps the typed email
- [ ] Empty: not applicable (no list)
- [ ] Works at 375px

---

## Out of scope

- Reset by SMS or security questions.
- Changing the password while logged in (separate card).
- Account lockout after failed logins.

---

## Decisions

| Decision | Why | What we gave up |
|---|---|---|
| Same response for unknown emails | avoids leaking who has an account | person with a typo gets no hint |
| 30 minute token | limits the window if the inbox is exposed | slow email delivery may expire it |

---

## Owner decisions (open)

| Question | Reading A | Reading B | Decided (date) |
|---|---|---|---|
| Log the person in after reset? | yes, fewer steps | no, send to login | A, 2026-11-02 |

---

## Record

- [x] Spec approved
- [x] Built
- [x] `ux-designer` passed
- [x] `quality-assurance` passed
- [x] `security-engineer` passed
- [ ] Live

**What the spec didn't foresee:**
Email apps open links in a preview that consumed the single-use token before the
person clicked. Fixed: the link opens the form, and the token is only spent on
submit. Added to the flow above.
