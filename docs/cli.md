# fleet-e2e-toy CLI

A command-line client for the NoteAPI REST service, added in `src/cli.ts`. It talks to
a running NoteAPI server over HTTP using the platform `fetch` API — it is a thin client,
not a reimplementation of the API's logic.

## Design

- **Single-file CLI, no dependencies beyond Node built-ins.** The parser, help text,
  validation, and command dispatch all live in `src/cli.ts`. This keeps the CLI easy to
  build (`npm run build`) and ship as a standalone `dist/cli.js` with a `#!/usr/bin/env node`
  shebang.
- **`main(argv)` returns a `CliResult` (`{ stdout, stderr, exitCode }`) instead of writing
  to process streams or calling `process.exit` directly.** This is the key testability
  decision: tests call `main()` and assert on the returned strings/exit code without
  spawning a subprocess or mocking global I/O. The real process-exit side effect only
  happens in the `require.main === module` guard at the bottom of the file, which is
  excluded from coverage instrumentation (`istanbul ignore next`) because it only runs
  when the file is executed as a script.
- **Target API base URL is configurable via `NOTEAPI_URL` env var**, defaulting to
  `http://localhost:3000`. This lets the CLI be pointed at any NoteAPI instance
  (e.g. the `PORT=3001` local override in `CLAUDE.local.md`) without code changes.
- **Version is read from `package.json` at runtime** (`getVersion()`), not hardcoded, so
  `--version`/`-v` always reflects the built package version.

## Argument parsing

`parseArgs` is a minimal hand-rolled parser (no external arg-parsing library) supporting:
- `--flag=value`
- `--flag value` (space-separated; the next token is consumed only if it doesn't itself
  look like a flag)
- `--flag` / `-f` as boolean flags when no value follows
- Non-flag tokens collected as positionals in `_` (the first positional is the subcommand)

## Commands

`list`, `read`, `create`, `update`, `delete` map directly to the NoteAPI REST endpoints
(`GET/POST/PUT/DELETE /api/notes[...]`). Output is `JSON.stringify(data, null, 2)` to
stdout on success; `delete` (204 No Content) prints nothing and exits 0.

Note IDs are always `encodeURIComponent`-escaped when interpolated into URLs.

## Error handling contract

- API-level errors (4xx/5xx responses) and network failures (fetch throws, e.g. server
  not running) both surface as `Error: <message>` on **stderr**, exit code 1. Network
  errors specifically read `Error: Could not connect to API at <base-url>`.
- Validation errors (see below) use the same `Error: <message>` / stderr / exit-1 contract,
  so callers/scripts only need to check exit code and parse `Error:`-prefixed stderr
  uniformly regardless of failure source.
- Nothing is ever written to stdout on failure — this is asserted directly in tests, since
  stdout is expected to be machine-parsable JSON on success.
- No stack traces are ever printed; all thrown errors are caught in `main()` and reduced to
  a single-line message.

## Input validation

Required string flags (`--id`, `--title`, `--content`) are validated with
`requireNonBlank`: missing entirely, empty string, or whitespace-only (including tabs and
newlines) are all rejected before any network call is made. `update` additionally requires
at least one of `--title`/`--content`/`--tags` to be present.

## Help and version precedence

Evaluation order in `main()`:
1. If the first positional is a valid subcommand **and** `--help`/`-h` is present anywhere
   in argv, print that subcommand's usage and exit 0 (subcommand help wins over everything
   else, including `--version`).
2. Else if `--version`/`-v` is present, print the version string and exit 0.
3. Else if `--help`/`-h` is present, or no subcommand was given at all, print global usage
   and exit 0.
4. Else if the first positional isn't a recognized subcommand, error with exit 1.
5. Otherwise dispatch to the subcommand handler.

This means `fleet-e2e-toy list --help --version` shows the `list` help text, not the
version — subcommand help always takes precedence. This is intentional and covered by
tests; version still wins over global help/no-args when no subcommand help applies.

## Testing approach

`tests/cli.test.ts` mocks `global.fetch` rather than spinning up a real server, keeping
CLI tests fast and independent of NoteAPI's own test suite. Coverage includes: version
flag variants, all five subcommands' happy paths, 404/500 API error mapping, network
failure, help output (global and per-subcommand), and validation rejection for blank/
whitespace/missing required flags — with explicit assertions that stdout stays empty and
no stack-trace patterns leak into stderr on failure paths.
