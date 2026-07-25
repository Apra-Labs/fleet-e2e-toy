# CLI (`fleet-e2e-toy`)

NoteAPI ships a command-line client (`npm run cli -- <args>`) that talks to the
running NoteAPI server over HTTP. It is a thin client only — all validation and
business rules for note data live in the API; the CLI's own responsibility is
argument parsing, pre-flight input validation, and turning API/network failures
into clean, scriptable exit codes.

## Design

### Argument parsing

The CLI uses a small hand-rolled argv parser rather than an external argument-parsing
dependency (consistent with the project's preference for minimal dependencies).
The parser produces a subcommand name, a flag map, a positionals list, and the raw
argv array.

**Known limitation, intentionally worked around:** the flag map only retains the
*last* occurrence of a repeated flag (e.g. `--tag a --tag b` collapses to
`tag: "b"` in the flag map). Commands that need to accept a flag multiple times
(`create --tag`, `update --tag`) do not rely on the flag map for that flag —
they re-scan the raw argv array themselves to collect every occurrence. This
keeps the parser itself simple while still supporting repeatable flags where needed.

### Command dispatch and precedence

`run(argv)` resolves flags/subcommand and applies flags in a fixed precedence
order, checked before any subcommand handler or network call runs:

1. `--version` / `-v` — short-circuits everything else, including `--help` and
   subcommand dispatch, so it works even when combined with other flags.
2. `<command> --help` — prints that subcommand's usage and returns without
   invoking the handler (no side effects, no network calls).
3. Global `--help` / `-h` (or the bare `help` subcommand) — prints global usage.
4. Otherwise the named subcommand handler runs.

Every subcommand handler is invoked inside a single try/catch in `run()`. Two
typed error classes are recognized: a validation error (thrown before any HTTP
call, for missing/blank required flags) and an API error (thrown by the HTTP
client on a non-2xx response or transport failure). Both are rendered to stderr
as `Error: <message>` with exit code 1. Any other thrown error is rendered the
same way as a fallback — the CLI never lets a raw stack trace reach the user.

### Input validation

Required string flags (`--title`, `--content`, `--id`, etc.) are validated
before any HTTP request is made: missing, empty, or whitespace-only values are
rejected with a one-line, human-readable error and a non-zero exit. This
fail-fast validation avoids sending obviously-invalid requests to the API and
keeps error messages CLI-specific rather than surfacing raw API validation
responses.

### API client

The HTTP client is a thin typed wrapper (one function per NoteAPI endpoint)
around `fetch`, configurable via the `NOTEAPI_URL` environment variable
(defaults to `http://localhost:3000`). It normalizes both failure modes a CLI
needs to distinguish from success:

- Non-2xx HTTP responses — the error message is extracted from the API's
  `{ error: string }` or `{ errors: string[] }` response body when present,
  falling back to a generic status line.
- Transport-level failures (host unreachable, network error) — surfaced as the
  same error type with status `0`, so callers can treat "API said no" and
  "couldn't reach the API" uniformly without inspecting a status code.

A `204 No Content` response (used by delete) resolves to `undefined` rather
than attempting to parse an empty body as JSON.

### Version string

The version flag prints a fixed, hardcoded string (`fleet-e2e-toy v1.0.0`) and
exits 0. It is intentionally not read from `package.json` at runtime — the
version command is a stable, low-risk smoke-test surface, and a fixed string
avoids any indirection that could make that check depend on packaging/build
state.

## Trade-offs considered

- **Hand-rolled parser vs. a parsing library:** chosen to avoid adding a
  dependency for a CLI surface with only a handful of subcommands and flags.
  The cost is the last-value-wins limitation described above, worked around at
  the call site for the two commands that need repeatable flags.
- **Fixed version string vs. reading `package.json`:** a fixed string was
  chosen for predictability of the version output regardless of build
  environment; the trade-off is that the version must be updated by hand in
  the CLI source when the package version changes.
- **Uniform `Error: <message>` rendering for all failure types:** validation
  errors, API errors, and unexpected errors are all rendered through the same
  one-line stderr format. This keeps the CLI's error surface predictable and
  script-friendly at the cost of losing type-specific formatting.
