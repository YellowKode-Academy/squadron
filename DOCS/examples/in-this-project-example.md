# `## In this project` example

> Each agent ends with this section. `/squadron-setup` fills it on an existing
> project. Below: two agents of an invented Go service with a real API.

## backend-developer

## In this project

- **Contract:** the OpenAPI file at `api/openapi.yaml`. Change it first, then the
  code. Never add a field the file doesn't declare.
- **Mock-first does not apply.** The backend is real: no mock layer, no 300ms delay.
- **Async:** Go has no async by default. Every call can fail and take time: return
  errors, pass a `context.Context` with a timeout.
- **Tests:** `go test ./...`. Lint: `golangci-lint run`.
- **Run locally:** `make dev` (needs the Postgres from `docker compose up db`).
- **Never touch `migrations/` without `data-engineer`.**
- **Layout:** handlers in `internal/http/`, business rules in `internal/service/`.
  Handlers don't talk to the database.

## quality-assurance

## In this project

- **Run the app:** `make dev`, then open `http://localhost:8080`.
- **Tests:** `go test ./...` for the backend, `npm test` in `web/` for the UI.
- **Test data:** `make seed` creates users `qa-a` and `qa-b`. Don't use real accounts.
- **Clean up:** `make reset-db` after a session; delete anything you created by hand.
- **Known flaky:** `TestExportLarge` fails on a slow disk; run it three times before
  reporting.
- **Out of bounds:** don't call the payment sandbox more than 20 times an hour.

## The `## Squadron` section in the project's own CLAUDE.md

On an existing project, setup adds this at the end of the project's CLAUDE.md
instead of replacing it:

```markdown
## Squadron (agent team)

Squadron version: 0.3.0. The project's rules above win wherever the two differ.

Contract file: api/openapi.yaml
Docs folder: docs/
Test command: go test ./...
Deploy command: make deploy (see docs/infrastructure.md)
Staging: no
Test account: qa@example.test, password in the team vault

- **Doc names:** PRD → docs/overview.md, CONTRACT → docs/api.md,
  ARCHITECTURE → docs/architecture.md. Specs go in docs/features/.
- **Doesn't apply here:** mock-first (the backend is real), the 375px line (no UI).
- **Skipped:** the squadron's `/ship`; the project's `make deploy` and its own
  `/release` skill already do it.
- **Mandatory:** security-engineer before anything that touches login or webhooks.
```
