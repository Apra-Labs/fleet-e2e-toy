# Sprint: CLI CRUD commands, help system + input validation, --version flag

Sprint root: gh-toy-k0w. Source issues: gh-toy-mi2 (P1), gh-toy-7rp (P1), gh-toy-4ef (P1).

## Context

NoteAPI (`src/`) is an Express REST API for notes (list/read/create/update/delete,
tag filter, full-text search — see `src/api/notes.ts`). There is currently **no
CLI** anywhere in this repo (confirmed: no `bin/`, no `cli.ts`, no `commander`/`yargs`
dependency in `package.json`). All three source issues describe a CLI client for
this API ("fleet-e2e-toy" is the CLI's product name per gh-toy-4ef's acceptance
string), so this sprint adds a new CLI entry point from scratch that talks to the
running NoteAPI server over HTTP — it does not touch the existing Express routes.

## Riskiest assumption (front-loaded as Task 1)

The riskiest assumption is the CLI's transport and process model: does it start its
own server, or does it act as an HTTP client against an already-running instance?
Given `src/index.ts` already boots the server standalone on `PORT` (default 3000,
3001 per `CLAUDE.local.md` locally) and the API layer has no CLI hooks, the CLI must
be a **separate HTTP client** using `fetch` (Node 22 has global fetch — confirmed via
`node --version` = v22.22.1) against a configurable base URL (`NOTEAPI_URL` env var,
default `http://localhost:3000`). This decision is recorded here rather than a
separate design.md since it is a single, low-ambiguity architectural call, not a
multi-option tradeoff — no design.md needed for this sprint.

## Scope

### gh-toy-mi2 — CLI CRUD commands (list/read/create/update/delete)

New file `src/cli.ts` (entry point) exposing 5 subcommands, each an HTTP call to
NoteAPI and stdout output, non-zero exit on API error (network failure or non-2xx
response):

- `list [--tag <tag>] [--q <query>]` — GET `/api/notes` with matching query params.
- `read --id <id>` — GET `/api/notes/:id`.
- `create --title <title> --content <content> [--tags <csv>]` — POST `/api/notes`.
- `update --id <id> [--title <title>] [--content <content>] [--tags <csv>]` — PUT `/api/notes/:id`.
- `delete --id <id>` — DELETE `/api/notes/:id`.

Print JSON (pretty) results to stdout on success. On API error (4xx/5xx or network
failure), print `{ "error": "<message>" }` to stderr and exit 1 — consistent with
this repo's existing convention of never leaking raw error objects (`CLAUDE.md`
"Never return raw error objects to the client").

### gh-toy-7rp — CLI help system and input validation

- `--help` / `-h` at the top level (no subcommand) prints usage listing all 5
  subcommands and exits 0.
- `--help` / `-h` after a subcommand prints that subcommand's usage (its flags) and
  exits 0.
- Input validation: reject a required flag that is missing, empty, or
  whitespace-only (e.g. `--title "  "`) with a clear `Error: <field> is required and
  must not be empty` message on stderr and exit code 1. No stack traces in error
  output for validation or API failures — catch and format, never let a raw
  exception reach the console.

### gh-toy-4ef — Add --version flag to CLI

- `--version` / `-v` prints `fleet-e2e-toy v1.0.0` and exits 0, and works whether or
  not other flags/subcommands are also present (checked first, before subcommand
  dispatch or validation).

## Out of scope

- No changes to the existing Express API routes, models, or validation helpers in
  `src/api/` or `src/utils/validation.ts` (reused where possible, not modified).
- No new dependencies unless a task genuinely needs one (Node's built-in `fetch`
  and `process.argv` parsing are sufficient at this scope — avoid pulling in
  `commander`/`yargs` for 5 subcommands and 3 flags each).
- No pagination, archiving, or other `feature_list.json` items — unrelated backlog.

## Testing

Add `tests/cli.test.ts` covering: each subcommand's happy path (mock the network
layer / spin up the Express `app` on an ephemeral port and point the CLI's base URL
at it), `--help`/`-h` output and exit code, `--version`/`-v` output and exit code,
and the empty/whitespace-argument validation error path. Follow existing test
conventions (`tests/notes.test.ts` uses supertest against the app directly; the CLI
tests instead need a live ephemeral-port listener since the CLI process makes real
HTTP calls).

## Design

No `design.md` — the only non-obvious decision (HTTP client vs. embedded server) is
captured above; everything else is a direct, single-path implementation of the
issue acceptance criteria.
