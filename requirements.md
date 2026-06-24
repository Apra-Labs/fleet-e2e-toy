# Sprint Requirements: pmlite-e2e s1

## Source Issues

- **gh-toy-mi2** (P1): CLI CRUD commands (list/read/create/update/delete)
- **gh-toy-7rp** (P1): CLI help system and input validation
- **gh-toy-13t** (P1): Add input validation for empty or blank strings

## Context

The NoteAPI is a REST API (Node.js + Express + TypeScript) with an in-memory note store.
Current source layout:
- `src/api/notes.ts` — Express route handlers for GET/POST/PUT/DELETE /notes
- `src/models/note.ts` — Note interface/types
- `src/utils/validation.ts` — Existing validation helpers
- `src/app.ts` — Express app setup
- `src/index.ts` — Server entry point (port 3000)

There is currently **no CLI**. All three issues require building one from scratch.

## Risk Front-loaded

**Riskiest assumption (Task 1):** The CLI architecture and entry-point structure must be
established before any subcommand or validation logic is added. A wrong scaffold
(e.g. wrong tsconfig target, wrong bin path) would require reworking all subsequent tasks.
Start with a minimal working CLI entry point (`src/cli/index.ts`) that builds and runs
before adding subcommands.

## Feature Requirements

### gh-toy-mi2: CLI CRUD Commands

Implement a `notecli` binary (or `ts-node src/cli/index.ts`) with five subcommands:

1. **list** — `notecli list [--tag <tag>] [--q <query>]` — calls `GET /notes` with optional
   query params, prints results to stdout (one note per line or JSON array).
2. **read** — `notecli read --id <id>` (required) — calls `GET /notes/:id`, prints the note.
3. **create** — `notecli create --title <title> --content <content>` (both required) — calls
   `POST /notes`, prints created note.
4. **update** — `notecli update --id <id> [--title <title>] [--content <content>]` — calls
   `PUT /notes/:id`, prints updated note. At least one of --title/--content required.
5. **delete** — `notecli delete --id <id>` (required) — calls `DELETE /notes/:id`.

Each command must:
- Call the API at the configured base URL (default: `http://localhost:3000`).
- Print the API response to stdout.
- Exit non-zero on API error (non-2xx status or network failure).
- Not print stack traces on expected errors.

### gh-toy-7rp: CLI Help System and Input Validation

- `notecli --help` and `notecli -h` print global usage and exit 0.
- `notecli <subcommand> --help` prints per-subcommand usage and exits 0.
- Unknown subcommands print usage and exit non-zero.
- Input validation rejects empty strings and whitespace-only strings as argument values
  (e.g. `--title "  "` is invalid). Clear error message; non-zero exit code. No stack traces.

### gh-toy-13t: Input Validation for Empty/Blank Strings

When any argument value is an empty string (`""`) or whitespace-only (`"  "`):
- Reject with a clear human-readable error message naming the flag.
- Exit with a non-zero code.
- Add unit test covering both the empty and whitespace-only cases.
- Reference: gh-toy-v6z (pre-existing validation utility at `src/utils/validation.ts`).

## Design Notes

No design.md is warranted — the CLI is a new, isolated module with one obvious structure
(commander or yargs for argument parsing, `node-fetch` or `axios` for HTTP). Use `commander`
since it is a common, minimal dependency with good TypeScript types. Keep CLI code in
`src/cli/`, tests in `tests/cli/`.

## Acceptance Criteria Summary

- `npm run build` compiles without errors.
- `npm test` passes all tests including new CLI unit tests.
- `npm run lint` exits 0.
- All five subcommands work end-to-end.
- Help flags print usage and exit 0.
- Invalid (empty/blank) arguments are rejected with a clear message and non-zero exit.
