# NoteAPI CLI Architecture

## Overview

`notecli` is a command-line client for the NoteAPI REST service. It is a compiled TypeScript binary (`dist/cli/index.js`) exposed via the `notecli` bin entry in `package.json`. All CLI source lives under `src/cli/` and all CLI tests under `tests/cli/`.

## Module Layout

```
src/cli/
  index.ts          — Entry point: wires Commander program, registers subcommands, handles unknown-subcommand and top-level async errors
  client.ts         — HTTP client wrapper (httpClient) and CliError class
  validation.ts     — CLI argument validation helpers
  commands/
    list.ts         — list subcommand
    read.ts         — read subcommand
    create.ts       — create subcommand
    update.ts       — update subcommand
    delete.ts       — delete subcommand
```

## Architecture Decisions

### Commander as argument parser

Commander was chosen over yargs and raw `process.argv` parsing. It is a minimal, well-typed dependency with first-class TypeScript support, handles `--help`/`-h` automatically per command, and has stable behavior for unknown-subcommand detection via the `command:*` event.

### Subcommand modules as factory functions

Each subcommand is implemented as a `make<Name>Command(): Command` factory function rather than a class or inline registration. This keeps each file testable in isolation — tests can call the factory, invoke the command action with a mocked HTTP client, and assert behavior without spawning a child process.

### CliError as a typed error class

`CliError` extends `Error` and carries a nullable `status: number | null`. The `null` status represents network-level failures (no HTTP response), while a numeric status represents an API non-2xx response. The entry point catches `CliError` specifically and prints only `err.message` — no stack trace is ever shown to users.

### Native fetch (no external HTTP library)

The `httpClient` wrapper uses the Node.js built-in `fetch` (available since Node 18) rather than `node-fetch` or `axios`. This avoids an extra runtime dependency while meeting all requirements. Network errors are caught and re-thrown as `CliError(null, message)`.

### NOTECLI_BASE_URL environment variable

Base URL resolution follows a three-tier precedence: `options.baseUrl` (per-call override, used in tests) > `NOTECLI_BASE_URL` environment variable > `http://localhost:3000` default. This allows targeting any server instance (e.g. `start:test` on port 3001) without code changes.

### Validation separated from the existing `src/utils/validation.ts`

The CLI introduces its own `src/cli/validation.ts` rather than reusing the existing server-side helpers. The existing helpers validate request body content in Express handlers; CLI helpers validate flag values and embed the flag name in the error message (`--<flag> must be a non-empty string`). The concerns are distinct: CLI messages are user-facing at argument-parse time, server messages are API response bodies.

## Key Invariants

- All subcommand `action` handlers are `async` and use `try/catch`; errors are printed to stderr and result in `process.exit(1)`. No unhandled promise rejections reach the top level.
- `process.stdout.write` is used for success output; `process.stderr.write` for errors. This separation allows callers to capture clean JSON from stdout.
- The `delete` subcommand returns HTTP 204 (no body). `httpClient` detects status 204 and returns `null`; the delete command prints a fixed string `"Note deleted successfully.\n"` rather than attempting to JSON-serialize a null response.
- Unknown subcommands print to stderr and exit 1 via `program.on("command:*")`. Commander's default behavior (exiting with a different code) is overridden.
- `validateRequiredString` is called even on flags already declared `.requiredOption()` because Commander's requiredness check only catches omission, not blank strings.
