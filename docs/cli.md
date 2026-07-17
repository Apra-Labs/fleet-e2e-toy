# CLI client

NoteAPI ships a command-line client, `noteapi-cli` (bin name), invoked via the
compiled `dist/cli.js` entry point (source at `src/cli.ts`). It exercises the
`/api/notes` HTTP surface as an external consumer — it is a thin HTTP client,
not an in-process shortcut into the server's store.

## Design decision: pure HTTP client, no server-internal imports

The CLI is architecturally a separate process from the Express server. It
talks to the API exclusively over HTTP and never imports server modules
(`src/models/*`, `src/utils/*`, `src/api/*`). This was a deliberate
trade-off:

- **Why**: the CLI's value as a demo/tool is that it exercises the same
  contract any external client would — the CRUD HTTP surface. Reaching
  in-process into the store would let the CLI silently depend on server
  internals that aren't part of the API contract, and would break the moment
  CLI and server run in different processes (which is the normal deployment
  shape — the server is what `deploy.md` / integration-test playbooks stand
  up on a fixed port, and the CLI is expected to point at that already-running
  instance).
- **Consequence**: the CLI defines its own local types (e.g. `CliNote`,
  `CreateNotePayload`) that mirror the server's `Note` shape rather than
  importing it. This is intentional duplication — the two are allowed to
  drift only if the wire contract changes, not in day-to-day maintenance, and
  keeping them separate makes the process boundary explicit in the type
  system.
- **Consequence**: all five CRUD subcommands share one HTTP client module
  instead of five divergent `fetch` call sites, so URL construction, error
  normalization, and response parsing happen in exactly one place.

## Modules

### `src/cli/client.ts` — shared HTTP client

- `getBaseUrl()` reads the `NOTEAPI_URL` environment variable, defaulting to
  `http://localhost:3000`, and strips any trailing slash. This is the single
  source of truth for where the CLI sends requests — no subcommand hardcodes
  a URL.
- `notesClient` is a typed wrapper exposing `list`, `getById`, `create`,
  `update`, `remove`, each bound to the matching `/api/notes` endpoint.
- `ApiError` is thrown for both network failures and non-2xx responses. Its
  message is always a clean, single-line string — never a raw stack trace —
  built by `messageFromErrorBody`, which reads either an `error: string` or
  `errors: string[]` field from the response body (mirroring the server's
  `{ error: "message" }` wrapping convention) and falls back to
  `Request failed with status <n>` if neither is present or the body isn't
  JSON. Network failures (fetch throws) are also wrapped into `ApiError` with
  a message naming the unreachable URL.
- Response bodies are parsed defensively: empty bodies (e.g. 204 from
  delete) resolve to `undefined`, and a non-JSON body on an otherwise-ok
  response is treated as an error condition rather than returned as-is.

### `src/cli/validate.ts` — client-side input validation

- `validateTitle`, `validateContent`, `validateId` each reject `undefined`,
  empty, or whitespace-only values by throwing `CliValidationError` (a clean
  message, no stack trace, carrying the offending field name).
- Validation always runs **before** any HTTP call is made — bad input never
  reaches the network layer. This mirrors the spirit of the server-side
  `src/utils/validation.ts` convention (reject empty/blank required strings)
  but is a fully independent implementation, consistent with the no-shared-
  internals design decision above.
- Values are returned untrimmed; trimming (if any) is left as a server-side
  concern, keeping the CLI's validation scope limited to "is this blank."

### `src/cli.ts` — entry point

- Parses `argv` into a subcommand plus a flat `--flag value` map
  (`parseFlags`); a flag with no following value maps to `undefined` so
  validators report it as missing rather than the parser throwing.
- **`--version` / `-v`**: resolved first, before subcommand dispatch, and
  works standalone or alongside other flags. Prints the product name as a
  fixed constant (`fleet-e2e-toy`, chosen because `package.json`'s `name`
  field is `noteapi`, a different string used for the npm package) followed
  by the version pulled from `package.json` — the version number is a single
  source of truth, but the product name is intentionally not derived from
  `package.json.name`.
- **`--help` / `-h`**: recognized both globally (no command, or the flag
  appears where a command is expected) and per-subcommand (the flag appears
  anywhere in a subcommand's own args). Both forms print usage text and exit
  0 without making any network call. Per-subcommand help is checked before
  flag parsing/validation/dispatch, so it always short-circuits cleanly.
- **Subcommands**: `list [--tag <tag>] [--q <query>]`, `read --id <id>`,
  `create --title <title> --content <content> [--tags <tag1,tag2>]`,
  `update --id <id> [--title <title>] [--content <content>] [--tags ...]`,
  `delete --id <id>`. Each handler validates its required args, calls the
  matching `notesClient` method, and prints the JSON result to stdout via a
  single `printResult` helper (pretty-printed with 2-space indent).
- **Error handling contract**: any thrown error (validation, `ApiError`, or
  otherwise) is reduced to a single clean line via `cleanMessage` and written
  to stderr; the process exits with status 1. No error path anywhere in the
  CLI prints a stack trace. Unknown commands and missing commands print usage
  to stderr and exit 1 without attempting a network call.

## Environment

- `NOTEAPI_URL` — base URL the CLI targets. Defaults to
  `http://localhost:3000`. Set this when the server is running on a
  different host/port (for example, port 3001 for local dev per
  `CLAUDE.local.md`, or the port an integration-test playbook stands the
  server up on).

## Testing approach

CLI tests live under `tests/` (`cli.crud.test.ts`, `cli.help-validation.test.ts`,
`cli.version.test.ts`) and invoke the exported `run(argv)` function directly
rather than spawning a subprocess, mirroring the existing convention of
testing the Express app in-process with supertest rather than a running
server. CRUD tests point `NOTEAPI_URL` at an in-process instance of the same
Express app so the CLI is exercised against the real HTTP contract without
needing a separately-managed server process.
