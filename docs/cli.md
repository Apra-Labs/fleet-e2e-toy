# CLI (`noteapi-cli`)

A command-line client for the NoteAPI REST service, published as the `noteapi-cli` bin
entry (`src/cli/index.ts`, compiled to `dist/cli/index.js`). It is a thin HTTP client —
all business logic (validation, storage, search) stays in the API server; the CLI's job
is argument parsing, calling the API, and formatting output/exit codes for a terminal.

## Design

### Command dispatch

`src/cli/index.ts` exports a `run(argv): Promise<number>` function that:

1. Checks for `--version`/`-v` anywhere in argv (not just position 0) and short-circuits
   to print the version and exit 0. Version is checked before subcommand parsing because
   a global flag should work regardless of what else is on the command line (e.g.
   `noteapi-cli list --version` still prints the version).
2. Checks for a bare `--help`/`-h` as the first token and prints global usage.
3. Dispatches to one of five subcommand handlers (`list`, `read`, `create`, `update`,
   `delete`), each implemented as its own module under `src/cli/commands/`.
4. Wraps subcommand execution in try/catch: any thrown `Error` is rendered as
   `Error: <message>` on stderr with no stack trace, and the process exits 1. This keeps
   the "no stack traces in user-facing output" invariant in one place rather than
   scattering try/catch across every subcommand.

`run()` returns an exit code rather than calling `process.exit()` directly, which is what
makes the whole CLI testable in-process (supertest-style) instead of requiring a spawned
child process per test.

### Argument parsing

`src/cli/args.ts` provides a minimal shared `--flag value` / `--flag=value` parser
(`parseFlags`). It intentionally does not support short flags, flag stacking, or
positional arguments beyond the subcommand name — the CLI's flag surface is small enough
that a hand-rolled parser is simpler and has no dependency footprint. Each subcommand
calls `parseFlags` on its own `rest` args and then reads out the flags it cares about by
name.

### Validation

`src/cli/validation.ts` mirrors the trim-based non-empty check used server-side
(`src/utils/validation.ts`) rather than importing it directly, since CLI input (raw argv
strings) and API request bodies are different shapes. `isNonEmpty` treats `undefined`
and whitespace-only strings identically as "not provided". `requireNonEmptyFlags` throws
a plain `Error` carrying the subcommand's usage string, which flows into `index.ts`'s
catch block and becomes the `Error: <usage>` message shown to the user — so a validation
failure and a usage request converge on the same output shape.

### Help

`src/cli/help.ts` owns both global usage (list of subcommands) and per-subcommand usage
text (flags, whether required, one-line description). Usage strings are checked for a
help flag (`isHelpFlag`/`hasHelpFlag`) both globally (before dispatch) and again inside
`rest` args (after the subcommand is known but before the handler runs), so `--help`
works both as `noteapi-cli --help` and `noteapi-cli create --help`.

### API client

`src/cli/client.ts` centralizes all HTTP calls through `apiRequest<T>()`:

- Base URL defaults to `http://localhost:3000` and is overridable via the `NOTEAPI_URL`
  environment variable, so the CLI can point at any running instance without a config
  file.
- Non-2xx responses are converted to a thrown `ApiError` whose message is extracted from
  the API's `{ error }` or `{ errors: [{field, message}] }` response shape (falling back
  to a generic `Request failed with status N` if the body isn't JSON) — this is what lets
  server-side validation errors surface as readable CLI error text instead of a raw HTTP
  status.
- A network-level failure (server unreachable) is caught and re-thrown as an `ApiError`
  with a "Could not reach NoteAPI at `<url>`" message, so connection failures and API
  errors both funnel through the same `Error` -> `index.ts` catch -> exit 1 path.
- A `204 No Content` response resolves to `undefined` rather than attempting to parse an
  empty body as JSON.

### Version flag

`src/cli/version.ts` reads the version out of the package's own `package.json` at
runtime (resolved relative to the compiled file's location) rather than hardcoding a
version string, so the CLI's reported version always matches whatever was actually
packaged/installed. Output format is `noteapi v<version>` (the project's own naming
convention), not a project-agnostic template — a CLI's `--version` output should reflect
the actual product name.

## Testing approach

CLI integration tests run the Express app in-process and drive it through `run(argv)`
directly (no spawned subprocess, no separately-started server), matching the project's
existing "supertest against the app" convention rather than introducing a second test
style. This keeps CLI tests fast and lets them assert on stdout/exit-code behavior
without flakiness from process startup or port binding.
