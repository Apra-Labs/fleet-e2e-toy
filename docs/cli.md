# CLI (`noteapi`)

A command-line client for the NoteAPI REST service. It is a thin HTTP client, not an
alternate implementation of the note store — every subcommand calls the running Express API
over `fetch` and prints the JSON result. The CLI has no direct access to the in-memory
store; the API server must be running (or `NOTEAPI_URL` must point at one) for any
subcommand except `--help`/`--version` to succeed.

## Design

### Entrypoint and dispatch

`src/cli/index.ts` exports a pure `run(argv, io)` function that returns a process exit
code, separate from the `main()` that wires it to real `process.argv`/`process.exit`. This
split exists so tests can drive the CLI in-process (passing a fake `argv` and an `io` object
that records `out`/`err` calls) without spawning a subprocess or touching global state. The
`io` abstraction (`{ out, err }`) is threaded through every handler for the same reason —
all output goes through it rather than direct `console.log`/`process.stdout.write` calls
inside handler logic.

Top-level dispatch order in `run()`: no-args -> global usage (exit 1), `--version`/`-v` ->
version string (exit 0), `--help`/`-h`/`help` -> global usage (exit 0), otherwise look up
the subcommand in the `commands` registry. An unrecognized subcommand prints an error plus
usage and exits 1.

### Subcommand composition

Each subcommand's core logic lives in its own file under `src/cli/commands/` (`list.ts`,
`read.ts`, `create.ts`, `update.ts`, `delete.ts`) and is exported as a bare handler with no
help- or validation-awareness. `src/cli/commands.ts` wraps each bare handler with two
composable decorators before registering it in the `commands` dispatch table:

- `withHelp(name, handler)` — checks `--help`/`-h` before the handler's own argument
  parsing runs, and if present prints that subcommand's usage text and returns exit 0
  without invoking the handler at all.
- `withRequiredFlags(requiredFlags, handler)` — parses flags and validates each named flag
  is present and non-blank via `validateNonEmpty`; on failure it writes a plain error
  message (no stack trace) to stderr and returns exit 1, again without invoking the
  handler.

This wrapping order means help always wins over validation: `noteapi create --help` prints
usage even though `--title`/`--content` are missing. Required flags per subcommand: `read`
and `delete` require `--id`; `create` requires `--title` and `--content`; `update` requires
only `--id` (title/content are optional patch fields); `list` has no required flags
(`--tag`/`--q` are optional filters).

### Argument parsing

`src/cli/args.ts` provides a minimal `--flag value` parser (`parseFlags`) that does not use
a third-party CLI framework. A token is treated as a flag if it starts with `--` or is a
two-character `-x` short flag; the following token is consumed as its value unless that
token itself looks like another flag, in which case the flag is recorded with value `""`
(present-but-boolean). Repeated flags keep the last occurrence. This is deliberately
low-power — it does not support `=`-joined values (`--id=5`) or flag grouping — and is
sufficient for the fixed, known flag sets each subcommand validates against.

### Error handling and exit codes

Two error types flow up to `run()`'s try/catch around the handler call:

- `ApiError` (from `src/cli/client.ts`) — thrown when the HTTP call fails outright (network
  error, wrapped as status `0`) or the API responds non-2xx. The client tries to parse the
  response body as `{ error: string }` (matching the API's own error envelope) and falls
  back to the raw response text or an `HTTP <status>` message if that fails.
  `run()` catches this and prints `error: <message>` to stderr, exit code 1 — never a raw
  stack trace.
- Any other thrown `Error` — caught generically and printed the same way, exit code 1.

This guarantees no unhandled exception ever reaches the user as a Node stack trace; the
test suite asserts on the absence of stack-trace-shaped output (`at ...(...:N:N)`) as a
regression guard for this invariant.

### Version string

`--version`/`-v` is handled at the very top of `run()`, before subcommand dispatch, and
prints a fixed literal version string with exit code 0. It intentionally does not read
`package.json` at runtime — the string is hardcoded so the CLI's own `--version` output
never depends on how it was invoked (compiled `dist/` binary vs. `ts-node` in dev) or on
`package.json` being resolvable from the current working directory.

## Testing approach

CLI tests fall into two layers:

- **Unit/contract tests** per concern (`cli-args`, `cli-help`, `cli-version`, and one file
  per subcommand) that drive `run()` directly with a mocked `client` (or mocked `fetch`),
  asserting on exit codes, stdout/stderr content, and flag validation in isolation.
- **End-to-end test** (`tests/cli-crud.test.ts`) that boots the real Express app in-process
  (via `supertest`, the same pattern the API tests use) and drives the CLI's `run()` against
  it over real HTTP, covering the full create -> read -> list (with `--tag`/`--q`,
  matching and non-matching) -> update -> delete lifecycle, plus 404 and missing-required-flag
  paths. This is the test that proves the CLI and API actually agree on wire format, not
  just that each side individually does what its own mocks expect.

## Known gaps / deliberately deferred

The following are recognized as useful CLI extensions but are out of scope for the current
CLI surface and are tracked as backlog rather than implemented:

- No persistent CLI configuration file (e.g. for a default `NOTEAPI_URL` or default tags).
- No graceful `SIGINT` (Ctrl-C) handling — an in-flight request is simply abandoned if the
  process is killed.
- No structured `--json` output mode — all output is the human-readable JSON pretty-print
  currently returned by the handlers, not a machine-parseable flag-gated mode.

These are independent of each other and can be picked up in any order; none blocks the
others.
