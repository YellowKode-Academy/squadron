# Agent report examples

> Both examples are invented. Replace the content, keep the shape.

## 1. Tech-lead report (end of a delivery)

This version adds two lines, `Verified` and `Inferred`, so the reader can tell
what was run from what was only read.

```
Delivered: password reset from the login screen (request, email link, new password)
Team involved: product-owner, software-architect, backend-developer,
  frontend-developer, ux-designer, quality-assurance, security-engineer.
  Skipped: data-engineer (one new table, architect's schema was enough)
Findings: UX: error text used the wrong tone, fixed. QA: expired link showed a
  blank page. Security: token was logged on failure.
Fixed: blank page replaced by "this link no longer works"; token removed from logs
Becomes a card: rate limit per IP (APP-57); email template translation (APP-58)
Definition of done: spec criteria 8 of 8 checked; 375px checked in the browser
Verification: findings verified 3 of 3; not verified: none
Verified: ran `npm test` (41 passed), reset flow end to end in the browser at 375px,
  confirmed the token no longer appears in the server log
Inferred: email provider retries on a 5xx (read from its docs, not triggered);
  old sessions end on reset (read from the code, no second device used)
Open OWNER DECISIONs: none
```

## 2. Single agent report (compact, QA)

```
Agent: quality-assurance
Tested: password reset, spec DOCS/features/reset-password.md
Result: 7 of 8 criteria pass. 1 fails.
Fails: confirming a token twice returns `ok: true` the second time.
  Steps: request reset, open link, submit, press browser Back, submit again.
Verified: ran the steps above 3 times, same result each time; ran `npm test`
  (41 passed, none covers a double submit)
Inferred: a double click on the button likely hits the same bug (read the handler,
  did not try it)
Cleaned up: deleted the 4 test accounts and the 6 pending tokens I created;
  closed the browser session; no files left outside the repo
```
