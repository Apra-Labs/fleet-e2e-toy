# CLI Client (`fleet-e2e-toy`)

## What it is

A command-line client for the NoteAPI REST server, added under `src/cli.ts` and
`src/cli/`. It is a thin, dependency-free wrapper around the built-in `fetch`
API — it does not add a database, a framework, or third-party HTTP libraries.
The server (`src/api/`, `src/models/`, in-memory store) is unchanged by this
CLI; the CLI is purely a client that talks to the server over HTTP.

## Why this design

- **Zero new runtime dependencies.** Node's built-in `fetch` is used directly
  in `src/cli/api-client.ts` rather than adding `axios`/`node-fetch`/a CLI
  framework like `commander`/`yargs`. The CLI's argument surface is small
  enough that a ~70-line hand-rolled parser (`src/cli/args.ts`) is easier to
  reason about and test than an external dependency, and keeps with the
  project's "no unnecessary dependencies" ethos (see `CLAUDE.md`).
- **Validate before any network call.** All CRUD subcommands validate their
  arguments (`src/cli/validate.ts`) before constructing a request. This keeps
  failure modes predictable: a validation error is always a fast, local,
  synchronous failure with `Error: ...` on stderr and exit code 1 — it never
  produces a partial network call or a stack trace.
- **Errors are typed, not stringly-checked.** `api-client.ts` throws two
  distinct error classes: `ApiError` (server responded with 4xx/5xx — message
  taken from the response body's `error` field when present) and
  `NetworkError` (the request itself failed — connection refused, DNS,
  etc). Command handlers (`src/cli/commands/notes.ts`) catch both explicitly
  in `handleError()` and never leak a raw `Error`/stack trace to the user.

## Command surface

```
fleet-e2e-toy [COMMAND] [OPTIONS]

Global flags:
  --help, -h     Show this help message
  --version, -v  Show version

Commands:
  list           List all notes       (--tag, --q)
  read           Read a note by ID    (--id, required)
  create         Create a new note    (--title, --content required; --tags optional)
  update         Update an existing note (--id required; at least one of --title/--content/--tags)
  delete         Delete a note        (--id, required)
```

Every subcommand also accepts its own `--help`/`-h`, which is checked
*before* validation and *before* any network call, and always exits 0.

`--version`/`-v` is checked before command dispatch and prints exactly
`fleet-e2e-toy v1.0.0` (see `CLI_NAME`/`CLI_VERSION` constants in
`src/cli.ts`) — exit code 0.

## Argument parsing (`src/cli/args.ts`)

Supports `--flag=value`, `--flag value` (space-separated), `--flag` (bare
boolean), and single-dash shorthand equivalents (`-f value`, `-f`).

**Known limitation (accepted, not a bug):** a value that itself starts with
`-` is treated as a new flag rather than as the value of the preceding flag
(e.g. `--title -5` parses `-5` as a boolean flag `5`, not as the title's
value). This is acceptable for this toy CLI's scope and is intentionally not
addressed — do not "fix" this without checking whether callers depend on the
current behavior.

## Validation rules (`src/cli/validate.ts`)

- `read` / `delete`: `--id` is required and must not be blank
  (empty-string or whitespace-only is rejected).
- `create`: `--title` and `--content` are both required and non-blank.
- `update`: `--id` is required; if `--title` or `--content` are supplied they
  must be non-blank; at least one of `--title`, `--content`, `--tags` must be
  present (an update with none of these is rejected, since it would be a
  no-op request).

All validation failures return `{ valid: false, message }` and are surfaced
as `Error: <message>` on stderr with exit code 1 — never as an HTTP error,
since no request is made.

## Output contract

- Success: pretty-printed JSON (`JSON.stringify(data, null, 2)`) on stdout,
  exit 0. A `204 No Content` response (e.g. `delete`) prints an empty line
  and still exits 0.
- Failure (validation, API 4xx/5xx, or network failure): `Error: <message>`
  on stderr, exit 1. Stdout never contains the string `"Error:"` on a failure
  path — this is asserted directly in `tests/cli.test.ts`.

## Configuration

The API base URL is read from `NOTEAPI_URL` at import time
(`DEFAULT_API_BASE_URL` in `src/cli/api-client.ts`), defaulting to
`http://localhost:3000`. There is no CLI flag or config file for this yet
(see "Deferred / not built" below).

## Testing approach

`tests/cli.test.ts` invokes `main(argv)` from `src/cli.ts` directly (in
process) rather than spawning a subprocess, consistent with the project's
existing convention of testing against the Express app object rather than a
running server. HTTP calls are exercised against the real in-memory Express
app via a local test server bound to an ephemeral port, with `NOTEAPI_URL`
pointed at it.

## Deferred / not built this sprint

The following were filed as separate (P2) issues and intentionally left open
— they are not regressions, just out of scope for the P1 goal:

- `--json` output mode flag (`gh-toy-aqd`)
- Config file support, e.g. `~/.fleet-e2e-toy.yaml` (`gh-toy-24g`)
- Graceful `SIGINT`/Ctrl-C handling (`gh-toy-69s`)
- Tag-filtering endpoint on the server side (`gh-toy-s5k`) — the CLI's
  `--tag` flag on `list` already sends the query param; whether the server
  honors it is tracked separately.
