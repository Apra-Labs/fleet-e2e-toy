# CLI Architecture

## Overview

The `src/cli/` layer is a standalone command-line interface that wraps the NoteAPI REST server. It is a separate entry point from the Express app and communicates with the API over HTTP. The CLI is invoked via `node dist/cli/cli.js` (or the compiled binary) and exits with a standard UNIX exit code.

## Layered structure

```
cli.ts          Entry point: parses args, dispatches to command handlers, owns error boundary
parse.ts        Pure arg parser: argv[] -> ParsedArgs (no side effects, testable in isolation)
validate.ts     Flag extractors: requireFlag / optionalFlag — throw CliError on bad input
help.ts         Static help strings for global and per-subcommand usage
version.ts      Reads package.json at runtime to print "fleet-e2e-toy v<version>"
config.ts       Loads ~/.fleet-e2e-toy.yaml for persistent CLI configuration
apiClient.ts    Thin fetch wrapper: one function per CRUD operation, throws CliError on HTTP errors
commands/       One file per subcommand (list, read, create, update, delete)
types.ts        Shared types: CliError, ParsedArgs, CommandResult
```

## Dispatch flow

1. `main(argv)` calls `parseArgs(argv)` to get a `ParsedArgs` struct.
2. Global flags (`--version`, `--help`) are handled before command dispatch.
3. The command string is looked up in `commandMap`; unknown commands write a JSON error to stderr and return exit code 1.
4. The handler is called inside a try/catch. `CliError` instances are serialised as `{ "error": "<message>" }` on stderr. All other errors produce a generic JSON message — no stack traces are ever exposed to the caller.
5. `main` returns an integer exit code; the entry-point shim assigns it to `process.exitCode`.

## Error contract

- All errors written to stderr are JSON-formatted: `{ "error": "message" }`.
- Successful output goes to stdout (plain text or JSON depending on `--json` flag).
- Non-zero exit codes: 1 for user/API errors, 130 for SIGINT (Ctrl-C).

## Flag parsing rules

- `--flag value` and `--flag=value` both set a string flag.
- `--flag` (no value following) sets a boolean `true`.
- Short flags (`-h`, `-v`) are single-character only.
- Last-value-wins for repeated flags (the parser does not accumulate arrays).
- The first non-flag positional argument is the command; subsequent positionals are collected but currently unused.

## API client configuration

The base URL is resolved in priority order:
1. `NOTEAPI_URL` environment variable.
2. `url` key in `~/.fleet-e2e-toy.yaml`.
3. Default: `http://localhost:3000`.

The config file uses a hand-rolled YAML parser that handles only top-level `key: value` scalar pairs. This was a deliberate choice to avoid adding a YAML dependency; nested structures and lists are silently ignored.

## Output modes

Commands support a `--json` flag that switches stdout output from human-readable text to raw JSON. This is implemented per-command; the flag is read from `parsed.flags["json"]`. Error output is always JSON regardless of this flag.

## Key invariants

- `parse.ts` is a pure function and must remain so — it has no access to `process` or the filesystem.
- `apiClient.ts` is a module-level singleton: `loadConfig()` is called once at import time and `baseUrl` is fixed. Tests that need a different base URL must set `NOTEAPI_URL` before the module is imported.
- The `--tag` filter on `list` is applied client-side after receiving the full notes list. The server supports `?tag=` but the CLI does not use it. This is consistent and correct, just less efficient at large scale.
- `CliError` carries an optional `statusCode` (HTTP status from the API). Handlers may inspect this for specialised messaging but currently do not.
