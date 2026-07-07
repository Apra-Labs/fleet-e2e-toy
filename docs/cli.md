# NoteAPI CLI (`fleet-e2e-toy`)

## Overview

`fleet-e2e-toy` is a command-line client for the NoteAPI HTTP service. It
lives under `src/cli/` and is compiled to `dist/cli/index.js`, exposed as the
`fleet-e2e-toy` bin entry in `package.json`. It talks to a running NoteAPI
instance over HTTP — it does not access the in-memory store directly.

Run it during development with `npm run cli -- <command> [flags]`, or after
`npm run build` via the compiled binary.

## Design

### Command dispatch

`src/cli/index.ts` is the single entry point. It:

1. Parses `process.argv` into a `command` string and a `flags` object
   (`parseArgs`). Flags support both `--key value` and `--key=value` forms;
   a flag with no following value (or followed by another `--flag`) is
   treated as a boolean `true`. `-h` and `-v` are recognized as short
   boolean flags.
2. Handles `--version`/`-v` and `--help`/`-h` **only when they appear in the
   command position** (e.g. `fleet-e2e-toy --version`, not
   `fleet-e2e-toy create -v`). This is a known, accepted limitation — the
   acceptance criteria only require the standalone form.
3. Looks up the command in a `Record<string, CommandHandler>` registry
   populated via `registerCommand(name, handler)`. Each command module
   (`src/cli/commands/*.ts`) registers itself against `list`, `read`,
   `create`, `update`, `delete`.
4. Wraps every handler invocation in a try/catch. Handler errors (including
   `apiClient` errors and validation errors) are caught centrally, printed
   as `Error: <message>` to stderr, and the process exits non-zero. No
   stack traces are ever surfaced to the user — this is a hard requirement,
   not just a style preference.

### HTTP client (`src/cli/apiClient.ts`)

A thin typed wrapper around `fetch` targeting `/api/notes` on the running
NoteAPI. Base URL is read from the `NOTEAPI_URL` env var, defaulting to
`http://localhost:3000`. All request/response typing reuses the `Note`,
`CreateNoteInput`, `UpdateNoteInput` interfaces from `src/models/note.ts` —
the CLI does not define its own duplicate note shapes.

Error handling contract: on a non-2xx response, the client tries to parse
the JSON error body and extract a message from either `{ error: string }`
or `{ errors: [{ field, message }] }` (falls back to `"Request failed"` if
neither shape matches). Network failures (server not running, wrong URL)
are converted into `cannot reach NoteAPI at <url>` rather than letting the
raw `fetch` rejection propagate. This is the single place API error
translation happens — command handlers do not need their own try/catch
around API calls beyond what the top-level dispatcher already provides.

### Validation (`src/cli/validation.ts`)

`requireNonBlank(name, value)` is the shared guard for required string
flags: it throws a plain `Error` if the value is `undefined` or blank after
trimming, with the message `"<name> must not be empty"`. Command handlers
call this before making any network call, so blank-flag errors never reach
the API client.

**Known inconsistency (not a bug, but worth knowing):** commands that check
for a *missing* flag first (e.g. `create.ts`'s `--title is required` check
on a falsy value) will catch an explicitly-empty string (`--title ''`)
before it reaches `requireNonBlank`, producing a differently-worded error
message than the "must not be empty" path. Both are clean, non-zero-exit
errors and both are covered by tests — the wording is just not unified.
Anyone adding new required flags should decide up front whether to route
through `requireNonBlank` exclusively to avoid adding more of these
divergent branches.

### Help system (`src/cli/help.ts`)

Static, hand-written usage strings per command plus a top-level summary.
`COMMAND_NAMES` is the single source of truth for which subcommands exist
and is used both for dispatch validation (`isCommandName`) and for usage
text generation. Help output always goes to stdout and exits 0 (as opposed
to error output, which goes to stderr and exits non-zero) — this matters
for scripts piping `--help` output.

## API contract exercised by the CLI

| CLI command | HTTP call | Required flags | Optional flags |
|---|---|---|---|
| `list` | `GET /api/notes[?tag=&q=]` | — | `--tag`, `--q` |
| `read` | `GET /api/notes/:id` | `--id` | — |
| `create` | `POST /api/notes` | `--title`, `--content` | `--tags` (comma-separated) |
| `update` | `PUT /api/notes/:id` | `--id` | `--title`, `--content`, `--tags` |
| `delete` | `DELETE /api/notes/:id` | `--id` | — |

## Invariants for future contributors

- Never let a raw error object or stack trace reach the CLI user — all
  errors must funnel through the top-level `try/catch` in `run()` in
  `src/cli/index.ts`, which prints `Error: <message>` and sets a non-zero
  exit code.
- The CLI is a pure HTTP client. It must not import from `src/store/` or
  otherwise touch the in-memory note store directly — that would break the
  "CLI talks to a running server" model and the `NOTEAPI_URL` override.
- `COMMAND_NAMES` in `help.ts` and the `registerCommand` calls in
  `index.ts` must stay in sync; a command present in one but not the other
  will produce confusing behavior (e.g. help text for a command that
  doesn't dispatch, or vice versa).
- `VERSION` in `src/cli/version.ts` is the single source of truth for the
  `--version`/`-v` output (`fleet-e2e-toy v<VERSION>`); do not hardcode the
  version string elsewhere.
- Known pre-existing bug (not introduced by the CLI, but visible through
  it): `noteStore.update` in `src/models/note.ts` pins `updatedAt` to the
  existing note's `updatedAt` rather than bumping it on update. `update`
  CLI calls therefore return a note whose `updatedAt` never changes. Fixing
  this is out of scope for the CLI feature and tracked as a future task.

## Testing

Integration tests in `tests/cli/` exercise the compiled/dispatch behavior
directly (not via a spawned subprocess): `crud.test.ts` covers CRUD happy
paths plus bogus-id and missing-flag error paths; `help-validation.test.ts`
and `validation.test.ts` cover `--help` output and blank-flag rejection;
`version.test.ts` covers `--version`/`-v`. Tests follow the existing
project convention of exercising app logic in-process rather than starting
a real server/process where possible.
