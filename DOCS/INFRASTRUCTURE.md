# Infrastructure

> Where it runs, how it ships, and what needs secrets.
> Owned by `devops-engineer`.

---

## Environments

| Environment | Where | URL |
|---|---|---|
| Local | machine | http://localhost:[ ] |
| Production | [ ] | [ ] |

## Server

- **Provider:** [ ]
- **Access:** by key, passwords disabled
- **Application user:** [ ] *(never root)*
- **Firewall:** 80, 443, [SSH port]
- **Automatic security updates:** [ ]

## Domain and DNS

| Record | Type | Points to |
|---|---|---|
| [ ] | A | [ ] |
| www | CNAME | [ ] |

- **HTTPS:** [ ] — automatic renewal enabled?

> An expired certificate is the silliest and most common production problem.

---

## Environment variables

> **No real values in this file.** Only the name and what it's for.
> `.env.example` versioned, `.env` never.

| Name | What it's for | Where it lives |
|---|---|---|
| `[ ]` | [ ] | server |

**Secret keys live only on the server.** In React and similar, an environment
variable is baked into the build and visible to anyone who opens the browser. If
the browser needs protected data, it asks the backend, and the backend talks to
the external service.

---

## Deploy

```bash
[the single command that ships everything]
```

**If the deploy depends on someone remembering seven steps, it doesn't exist.**
Every manual step becomes a runbook here. A deploy only one person knows how to
do is a risk, not expertise.

- **Roll back to the previous version:** [how, and how fast]
- **Does the process restart on its own if it crashes?** [ ]
- **Does it come back on its own after a reboot?** [ ]

---

## When it goes down

Diagnose in order, from most likely to least:

1. Is the application running? (process)
2. Does it respond locally on the server? (`curl localhost`)
3. Is the web server up and pointing to the right place?
4. Is the certificate valid?
5. Does DNS resolve to the right IP?
6. Is the firewall letting it through?
7. Did the disk or memory fill up?

## Monitoring

- **Does anything alert you if it goes down?** [ ]

> Without it, the person who finds out is the user.

- **Logs:** [where, and with rotation?]

> Without rotation the disk fills up. And a full disk takes everything down.
