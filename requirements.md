# Requirements -- pmlite-e2e/s1-1784322248650

## Sprint goal

Build a command-line client for the NoteAPI REST service (`src/api/notes.ts`),
covering three P1 backlog issues:

- **gh-toy-mi2** -- CLI CRUD commands (list/read/create/update/delete)
- **gh-toy-7rp** -- CLI help system and input validation
- **gh-toy-4ef** -- `--version` flag

## Current state (as-is)

There is no CLI today. `src/` contains only the Express app (`app.ts`,
`index.ts`), the `/api/notes` router, the in-memory `noteStore`
(`src/models/note.ts`), and request-body validation helpers
(`src/utils/validation.ts`). The server exposes:

- `GET /api/notes` (optional `?tag=`, `?q=`)
- `GET /api/notes/:id`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `DELETE /api/notes/:id`
- `GET /health`

The server listens on `PORT` env var, default 3000 (`npm start`), or 3001 for
`npm run start:test` / the deploy and integ-test playbooks.

## Risk front-loaded: Task 1

The riskiest assumption is the CLI's transport: it must be a thin HTTP client
against the already-running Express server (not an in-process call into
`noteStore`), since the API surface (`src/api/notes.ts`) is the CRUD contract
the issue references and the server is what `deploy.md` / the integ-test
playbook stand up on port 3001. Task 1 of the plan must establish this
HTTP-client foundation (base URL from an env var, e.g. `NOTEAPI_URL`,
defaulting to `http://localhost:3000`) before any subcommand is built on top
of it, so every later CRUD command reuses one client instead of five
divergent `fetch` call sites.

## Scope

### gh-toy-mi2 -- CLI CRUD commands

New CLI entry point (e.g. `src/cli.ts`, wired as a `bin` in `package.json` and
compiled to `dist/cli.js`) with five subcommands, each calling the matching
API endpoint and printing results to stdout:

- `list [--tag <tag>] [--q <query>]` -- GET /api/notes, optional filters
- `read --id <id>` -- GET /api/notes/:id
- `create --title <title> --content <content>` -- POST /api/notes
- `update --id <id> [--title <title>] [--content <content>]` -- PUT /api/notes/:id
- `delete --id <id>` -- DELETE /api/notes/:id

Non-zero exit code on any API error (network failure, 4xx/5xx response); the
error body's `error` or `errors` field is surfaced to the user, never a raw
stack trace (mirrors the "never return raw error objects" convention already
enforced server-side in CLAUDE.md, applied here to CLI error output).

### gh-toy-7rp -- CLI help system and input validation

- `--help` / `-h` at the top level and per-subcommand: prints usage and exits
  0, without making any network call.
- Input validation: reject empty or whitespace-only values for required
  string arguments (`--title`, `--content`, `--id`) with a clear message on
  stderr and a non-zero exit code, before any HTTP request is made. Validate
  client-side, mirroring the same convention `src/utils/validation.ts` follows
  server-side, but do not import server code into the CLI -- the CLI is a
  separate process/entry point talking over HTTP.
- No stack traces in error output under any failure path (validation error,
  API error, network error).

### gh-toy-4ef -- `--version` flag

- `--version` / `-v` prints `fleet-e2e-toy v1.0.0` and exits 0, and works
  standalone or alongside other flags (checked before subcommand dispatch).
- Version string is not hardcoded in two places -- source it from
  `package.json` (`name`/`version`) or a single constant, whichever keeps the
  printed string `fleet-e2e-toy v<version>` in sync with `package.json`. Since
  `package.json`'s `name` is currently `noteapi` and `version` is `1.0.0`, the
  CLI must still print the literal product name `fleet-e2e-toy` -- treat this
  as a project constant, not `package.json.name`.

## Out of scope

- No database (already an explicit repo constraint -- in-memory store stays).
- No changes to the four items in `feature_list.json` (tag filter, full-text
  search, pagination, archiving) -- those are a separate, already-tracked
  backlog, not part of this sprint's requirement.
- No changes to the HTTP API itself beyond what's needed to support the CLI
  (the CLI is a pure client).

## Conventions to follow (from CLAUDE.md)

- No `console.log` in route handlers -- N/A to the CLI itself (the CLI's job
  *is* to print to stdout), but keep it out of `src/api/*`.
- No `any` types -- use proper interfaces (a `Note` type already exists in
  `src/models/note.ts`; reuse or mirror it for the CLI's response typing since
  the CLI must not import server-internal modules across the process
  boundary -- define the CLI's own response interfaces).
- Tests: CLI commands should have unit/integration-style tests under `tests/`
  the same way the existing API tests do (Jest).

## Design

No `design.md` -- this is a single, mechanical CLI-over-HTTP addition with one
obvious shape (a shared HTTP client module + five subcommands + arg parsing +
help/version handling in the same entry point). No competing architectures to
weigh.
