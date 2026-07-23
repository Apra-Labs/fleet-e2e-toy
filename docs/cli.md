# NoteAPI CLI

A command-line client (`noteapi-cli`) for driving the NoteAPI REST service from
the shell. It lives at `src/cli/` and is a thin wrapper: it parses arguments,
validates them, calls the HTTP API via a small fetch-based client, and prints
JSON results to stdout. It holds no business logic of its own — the API is the
source of truth.

## Design

- **Separation of concerns.** `src/cli/index.ts` owns argument parsing,
  validation, and command dispatch. `src/cli/api-client.ts` owns all HTTP
  communication with the NoteAPI (`listNotes`, `getNote`, `createNote`,
  `updateNote`, `deleteNote`). `src/cli/help.ts` owns static usage text and the
  version string. This split keeps the parser testable without a live server
  and the API client testable/mocked independently of argument parsing.
- **Base URL resolution.** The API client resolves its target base URL in this
  order: an explicit `baseUrl` option, then the `NOTEAPI_URL` environment
  variable, then `http://localhost:3000`. This lets tests and alternate
  deployments point the CLI at a different server without code changes.
- **Error handling contract.** Every command wraps its API call in a
  try/catch. API-level failures raise `ApiError` (a distinguished `Error`
  subclass); the CLI catches it, writes `{"error": "<message>"}` as a single
  line of JSON to stderr, and returns/exits with code `1`. Non-`ApiError`
  failures (e.g. network errors surfaced as generic exceptions) fall back to a
  generic per-command message so a bug in the client never leaks a raw stack
  trace to the user. The top-level entry point has an additional catch-all so
  an unexpected internal error still produces a clean JSON error and exit code
  1 rather than an uncaught exception.
- **Argument parsing** is hand-rolled (no external CLI framework): `-h` and
  `-v` are recognized as short flags anywhere in argv, `--foo` flags consume
  the next token as a value unless that token itself looks like another flag
  (starts with `--`), and repeated flags (e.g. multiple `--tag`) accumulate
  into a string array rather than overwriting. Positional arguments (i.e. the
  subcommand name) are collected separately from flags.

## Commands

| Command | Required flags | Optional flags | Notes |
|---|---|---|---|
| `list` | none | `--tag`, `--q` | Filters are passed through as query params; omitted filters return everything. |
| `read` | `--id` | none | |
| `create` | `--title`, `--content` | `--tag` (repeatable) | |
| `update` | `--id` | `--title`, `--content`, `--tag` (repeatable) | Only supplied fields are sent as updates; omitted fields are left untouched server-side. |
| `delete` | `--id` | none | |

All commands print their JSON result (or a `{"message": ...}` confirmation for
delete) to stdout on success and exit `0`. Any failure — validation, network,
or API-level — writes a single-line JSON `{"error": "..."}` to stderr and
exits `1`. Nothing is ever written via `console.log`; all output goes through
explicit `process.stdout.write` / `process.stderr.write` so exit codes and
streams stay predictable for scripting.

## Help and usage

- Running the tool with no arguments, or with `-h`/`--help` before any
  subcommand, prints top-level usage and exits `0`.
- Running `<subcommand> -h` / `<subcommand> --help` prints usage specific to
  that subcommand (its required/optional flags) and exits `0`.
- An unrecognized subcommand prints an `{"error": ...}` line to stderr plus
  the top-level usage, and exits `1`.

## Version flag

`--version` / `-v` short-circuits all other parsing: if present anywhere in
argv, the CLI immediately prints the fixed version string and exits `0`,
before any subcommand dispatch or validation happens. This means `--version`
takes precedence even when combined with other flags or a subcommand. The
version string format is stable and intended to be matched exactly by
callers/tests: `"<tool-name> v<semver>"`.

## Input validation

Required string flags (e.g. `--id`, `--title`, `--content`) must be present
and must not be empty or whitespace-only; optional string flags, if supplied,
are held to the same non-blank rule. Repeatable flags (e.g. `--tag`) apply the
same non-blank check to every entry in the array. Validation failures use the
same `{"error": "..."}` / exit-`1` contract as API failures, and never surface
a raw stack trace — this matters for scripting since consumers can reliably
`JSON.parse` stderr to distinguish user error from a crash.

## Testing approach

The CLI is covered from two angles:

- **Unit-style tests with a mocked API client** exercise argument parsing,
  validation edge cases, and help/version output without a running server.
- **End-to-end tests boot the real Express app** (the same app used in
  production, not a separate test double) and drive the CLI through full
  command sequences (create → read → list-with-filters → update → delete),
  including the missing-argument and missing-resource error paths. This
  end-to-end layer is what actually proves the CLI and the API agree on
  request/response shapes, since the unit tests only prove the CLI matches
  its own mock.

Both layers are necessary: the mocked tests give fast, isolated coverage of
CLI-only logic (parsing, validation, help text), while the end-to-end suite
is the only place that would catch a real contract mismatch between the CLI
and the API.
