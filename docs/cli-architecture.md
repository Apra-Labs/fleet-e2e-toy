# CLI Architecture

## Overview

The NoteAPI project includes a TypeScript CLI (`src/cli/`) that wraps the REST API for interactive and scripted use. The CLI is a pure process-level wrapper: it parses arguments, calls the HTTP API, and writes structured output to stdout/stderr. It does not import or share state with the Express application layer.

## Design Decisions

### Separation from the API layer

The CLI lives entirely in `src/cli/` and communicates with the server exclusively through HTTP (`src/cli/apiClient.ts`). This means the CLI works against any running NoteAPI instance (local or remote) and the server code is never imported by CLI tests. The base URL defaults to `http://localhost:3000` and is overridden by the `NOTEAPI_URL` environment variable.

This was a deliberate choice over importing the Express app directly: it keeps the CLI independently testable and reflects real deployment (the CLI is a client, not an in-process caller).

### Structured error contract

All CLI errors are written to stderr as `{"error": "message"}` JSON — never as stack traces or raw Error strings. Exit codes are always non-zero on failure. This contract is enforced throughout dispatch, validation, and the top-level catch in `main()`. Tests assert both the JSON shape and the absence of stack-trace text.

### ParsedArgs shape and known limitation

`parseArgs` (`src/cli/parser.ts`) treats all short flags (`-x`) as boolean. Long flags in `BOOLEAN_LONG_FLAGS` (`--version`, `--help`) are always boolean. All other long flags consume the next token as their string value unless the next token starts with `-`, in which case the flag becomes `true`. A flag value that starts with `-` (e.g. `--title "-urgent"`) will therefore be parsed as a boolean `true` and the leading-dash token will be treated as a separate flag. This is a known, accepted limitation for a toy CLI.

### Validation before API calls

`validateRequired` (`src/cli/validate.ts`) is called on all required flags before any HTTP request is made. It rejects undefined, empty, and whitespace-only values and throws a typed `ValidationError`. The top-level `main()` catch converts any error to the structured stderr JSON shape.

## Module Map

| Module | Responsibility |
|--------|---------------|
| `src/cli/index.ts` | `main(argv)` entrypoint; short-circuits for `--version` and `--help`; dispatches to subcommand handlers; top-level error catch |
| `src/cli/parser.ts` | Pure argument tokeniser; produces `ParsedArgs` |
| `src/cli/types.ts` | Shared interfaces: `ParsedArgs`, `CommandResult`, `FlagValue` |
| `src/cli/version.ts` | Reads `name` and `version` from `package.json` at runtime |
| `src/cli/help.ts` | Generates global and per-command usage text; exits 0 |
| `src/cli/validate.ts` | `validateRequired`: asserts non-blank string flags |
| `src/cli/apiClient.ts` | Thin fetch wrapper for all five NoteAPI endpoints |
| `src/cli/commands/list.ts` | `list` subcommand; supports `--tag` and `--q` |
| `src/cli/commands/read.ts` | `read` subcommand; requires `--id` |
| `src/cli/commands/create.ts` | `create` subcommand; requires `--title`; accepts `--body`, `--tags` |
| `src/cli/commands/update.ts` | `update` subcommand; requires `--id`; accepts `--title`, `--body`, `--tags` |
| `src/cli/commands/delete.ts` | `delete` subcommand; requires `--id` |

## CommandResult Contract

Every subcommand handler returns a `CommandResult`:

```typescript
interface CommandResult {
  code: number;       // 0 = success, non-zero = failure
  stdout?: string;    // written to process.stdout if present
  stderr?: string;    // written to process.stderr if present (JSON-shaped on error)
}
```

Handlers never write to process streams directly — they return values and `main()` performs all I/O. This makes the handlers fully unit-testable without capturing process output.

## Test Strategy

CLI tests (`tests/cli-*.test.ts`, `tests/cliValidate.test.ts`) run against `main()` with captured stdout/stderr rather than against a running server, except for the CRUD end-to-end suite (`tests/cli-crud.test.ts`) which starts an in-process Express server bound to port 0 (OS-assigned) and resets the note store between each test. This provides true integration coverage without port conflicts or flakiness.

## Invariants

- `main()` never throws to the top level. Every code path returns a numeric exit code.
- Errors emitted to stderr always have the shape `{"error": "..."}`. Stack traces must never reach stderr.
- The CLI does not touch `src/api/`, `src/app.ts`, `src/models/`, or `src/utils/` — those layers are server-only.
- `--version` and `--help` short-circuit before any command dispatch or validation.
