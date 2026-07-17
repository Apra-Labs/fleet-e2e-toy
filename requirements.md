# Requirements — pmlite-e2e/s1-1784318425991

Sprint root: gh-toy-2fq. Source issues: gh-toy-mi2, gh-toy-7rp, gh-toy-4ef (all P1).

## Context

NoteAPI is a Node.js + Express + TypeScript REST API (`src/api/notes.ts`) backed by
an in-memory store (`src/models/note.ts`), exposing `GET/POST/PUT/DELETE
/api/notes[...]`. There is currently **no CLI** anywhere in `src/` or `package.json`
(`bin` field absent) — this sprint adds one from scratch. It is a thin HTTP client
over the existing REST API; it does not touch the server code.

Server error responses are always `{ error: "message" }` (400/404) per
`CLAUDE.md` conventions; `POST`/`PUT` validation failures instead return
`{ errors: [{field, message}, ...] }` from `src/utils/validation.ts`. The CLI must
handle both shapes when reporting API errors.

## Riskiest assumption (Task 1)

The CLI needs an HTTP client + arg-parsing/dispatch skeleton before any subcommand,
help text, or the version flag can be wired in. Get the skeleton (entrypoint,
command dispatch, shared HTTP helper hitting `NOTEAPI_URL`/default
`http://localhost:3000`) right first — every other task builds on it.

## Scope — the 3 source issues

### gh-toy-4ef — `--version`/`-v` flag
- `--version` or `-v` anywhere in argv prints a version string and exits 0.
- Version string sourced from `package.json` `version` field (no hardcoding a
  second copy of the version).
- Works standalone and does not require a subcommand.

### gh-toy-7rp — help system + input validation
- `--help`/`-h` (no args, or as the sole/leading arg) prints global usage and
  exits 0.
- `--help`/`-h` after a subcommand name prints that subcommand's usage and exits 0.
- Any required argument that is empty or whitespace-only is rejected before any
  network call, with a clear `Error: ...` message on stderr and non-zero exit —
  never a raw stack trace.
- Unknown subcommands / missing required args also produce a clear message and
  non-zero exit, not a stack trace.

### gh-toy-mi2 — CRUD subcommands
Each subcommand calls the matching NoteAPI endpoint and prints results to stdout;
non-zero exit + clear error message (no raw stack trace, no raw JSON error object)
on any API error (network failure, 4xx/5xx).

- `list [--tag <tag>] [--q <query>]` → `GET /api/notes` with matching query params.
- `read --id <id>` → `GET /api/notes/:id`; `--id` required.
- `create --title <title> --content <content>` → `POST /api/notes`; both required.
- `update --id <id> [--title <title>] [--content <content>]` → `PUT
  /api/notes/:id`; `--id` required, at least title/content optional.
- `delete --id <id>` → `DELETE /api/notes/:id`; `--id` required.

## Out of scope

Every other backlog issue (gh-toy-24g config file, gh-toy-69s SIGINT handling,
gh-toy-aqd `--json` mode, gh-toy-s5k tag-filter endpoint, gh-toy-13t — superseded by
gh-toy-7rp's validation requirement) stays untouched this sprint.

## Design

No `design.md` — single obvious path (a small `commander`-or-hand-rolled CLI over
`fetch`/`http`), no shared interfaces beyond the one HTTP helper captured in Task 1
above.
