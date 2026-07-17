# NoteAPI CLI (`fleet-e2e-toy`)

A thin command-line HTTP client for the NoteAPI REST API. It does not touch the
server or the in-memory store — every subcommand issues an HTTP request to a
running NoteAPI instance and renders the response.

## Architecture

The CLI lives under `src/cli/` as a small set of focused modules:

- **`src/cli/index.ts`** — entrypoint. Reads `process.argv`, handles
  `--version`/`-v` and global `--help`/`-h` up front (before any subcommand
  lookup, so neither ever triggers a network call), dispatches to the matching
  registered command, and normalizes any thrown error into a single
  `Error: <message>` line on stderr with a non-zero exit code. No raw stack
  traces or raw JSON error objects ever reach the terminal.
- **`src/cli/commands.ts`** — the command registry. Each subcommand implements
  a `Command` interface (`name`, `description`, `usage`, `run`) and is added
  via `registerCommand`. The dispatcher and the help system both read from
  this registry, so the command list and help text can never drift out of
  sync with what is actually runnable.
- **`src/cli/http.ts`** — the shared HTTP client. All requests go through a
  single `request()` helper that resolves the API base URL, issues the
  `fetch` call, parses the response body defensively (handles empty/204 and
  non-JSON bodies), and throws a typed `ApiError` on any non-2xx status.
- **`src/cli/validate.ts`** — shared CLI argument validation
  (`requireNonBlank`), used by every subcommand to reject missing, empty, or
  whitespace-only required arguments before any network call is made.
- **`src/cli/help.ts`** — pure rendering functions for global and
  per-subcommand usage text, sourced live from the command registry.
- **`src/cli/flags.ts`** — minimal flag parsing (`getFlag`): every flag in
  this CLI takes a value, so the parser simply returns the token following a
  given flag name.
- **`src/cli/notesRead.ts`** / **`src/cli/notesWrite.ts`** — the CRUD
  subcommand implementations (`list`, `read` / `create`, `update`, `delete`),
  registered into the command registry as a side effect of being imported by
  `index.ts`.

### HTTP error normalization

NoteAPI's server returns errors in two different shapes depending on the
failure:

- `{ error: "message" }` — generic 400s and 404s.
- `{ errors: [{ field, message }, ...] }` — POST/PUT validation failures
  (from `src/utils/validation.ts`).

`normalizeApiError()` in `src/cli/http.ts` collapses both shapes into a
single human-readable message: a plain `error` string is used as-is, and a
field-error array is joined into `field: message; field: message`. Any body
matching neither shape (empty body, HTML, unexpected JSON) falls back to a
generic `Request failed with status <code>` message. This keeps every
subcommand's error handling identical — they all just let the thrown
`ApiError` propagate to the dispatcher.

### Argument validation

CLI argument validation (`src/cli/validate.ts`) is deliberately separate from
the server-side request-body validation in `src/utils/validation.ts`. It
exists to reject bad input (missing, empty, or whitespace-only required
flags) client-side, before any network round-trip, with a clear
`Error: missing required argument '--id'`-style message and a non-zero exit
code — never a stack trace.

### Flag parsing caveat

Flags always take the next token as their value, with no awareness of
whether that token looks like another flag. For example,
`create --title --content foo` sets `--title` to the literal string
`"--content"` rather than treating it as missing. Prefer supplying every
required flag with an explicit value.

## Command surface

| Command | Usage | Endpoint |
|---|---|---|
| `list` | `list [--tag <tag>] [--q <query>]` | `GET /api/notes` (optional query filters) |
| `read` | `read --id <id>` | `GET /api/notes/:id` |
| `create` | `create --title <title> --content <content>` | `POST /api/notes` |
| `update` | `update --id <id> [--title <title>] [--content <content>]` | `PUT /api/notes/:id` |
| `delete` | `delete --id <id>` | `DELETE /api/notes/:id` |
| — | `--version` / `-v` | (no network call; prints CLI version and exits 0) |
| — | `--help` / `-h` | (no network call; prints global or per-command usage and exits 0) |

Notes:
- `read`, `update`, and `delete` require `--id`. `create` requires both
  `--title` and `--content`. `update` requires at least one of
  `--title`/`--content` in addition to `--id`.
- `--help`/`-h` works both globally (no args, or as the leading arg) and
  after a subcommand name (prints that subcommand's usage).
- Unknown subcommands and missing/blank required arguments produce a clear
  `Error: ...` message on stderr and a non-zero exit — never a stack trace.
- Successful responses are printed to stdout as pretty-printed JSON (except
  `delete`, which prints a one-line confirmation).

## Version flag

`--version`/`-v` prints `fleet-e2e-toy v<version>` and exits 0, sourced at
runtime from the `version` field in `package.json` — there is no second,
hardcoded copy of the version string to keep in sync.

## Invoking the CLI

The `bin` entry in `package.json` maps the `fleet-e2e-toy` command to the
**compiled** output, `dist/cli/index.js` — the CLI must be built before it
can be run as a binary; running against `src/` directly is not supported.

```bash
npm run build          # compiles TypeScript to dist/
npm link                # makes `fleet-e2e-toy` available on PATH
fleet-e2e-toy list
fleet-e2e-toy --version
```

Alternatively, invoke the compiled entrypoint directly without linking:

```bash
npm run build
node dist/cli/index.js list --tag work
```

## Pointing the CLI at a different server

By default the CLI targets `http://localhost:3000`. Set `NOTEAPI_URL` to
point it at a different host/port (a trailing slash, if present, is
stripped):

```bash
NOTEAPI_URL=http://localhost:3001 fleet-e2e-toy list
```

This is unrelated to the server's own `PORT` environment variable — the CLI
never starts a server, it only talks to one that is already running.
