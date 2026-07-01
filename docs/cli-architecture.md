# CLI Architecture

## Overview

The NoteAPI CLI (`src/cli/`) is a TypeScript command-line client for the NoteAPI REST API. It follows a layered structure: argument parsing, command dispatch, HTTP client, and per-command handlers. All output to the user goes to stdout; all errors go to stderr as JSON-wrapped objects.

## Directory Layout

```
src/cli/
  index.ts          Entry point and command dispatcher
  args.ts           Argument parser (flags + positional)
  client.ts         HTTP client and CliError / ExitCode definitions
  help.ts           Help text strings and print functions
  validation.ts     Required-flag validator
  version.ts        Version reader from package.json
  commands/
    list.ts         noteapi list
    read.ts         noteapi read
    create.ts       noteapi create
    update.ts       noteapi update
    delete.ts       noteapi delete
```

## Key Design Decisions

### All errors are JSON-wrapped on stderr

Every error path emits `{ "error": "<message>" }` to stderr and returns a non-zero exit code. No raw Error objects or stack traces are exposed to the caller. This makes the CLI usable from scripts that pipe stderr.

### Typed exit codes (ExitCode map in client.ts)

Exit codes are named constants rather than magic numbers:

| Code | Constant       | Meaning                     |
|------|----------------|-----------------------------|
| 2    | USAGE          | Wrong invocation / unknown command |
| 4    | NOT_FOUND      | 404 from the API            |
| 5    | VALIDATION     | Bad input (local or 400 from API) |
| 6    | NETWORK        | Cannot reach API server     |
| 7    | SERVER         | 5xx or other non-2xx        |

HTTP status codes are mapped to exit codes in `suggestedExitCode()` inside `client.ts`.

### CliError propagates exit codes through the call stack

`CliError extends Error` and carries an `exitCode` field. The dispatcher in `index.ts` catches `CliError` and returns the appropriate process exit code without re-logging the stack trace.

### --version short-circuits all other flags

`--version` / `-v` is checked before command dispatch and help. This is intentional: `noteapi --version --help` prints the version and exits 0.

### CommandHandler interface

Every subcommand exports a function matching:

```typescript
export type CommandHandler = (
  flags: Record<string, string | boolean>,
  positional: string[]
) => Promise<void> | void;
```

New commands are registered by adding an entry to the `commands` map in `index.ts`.

### Arg parser behaviour

`parseArgs` in `args.ts` handles:
- `--flag value` and `--flag=value`
- `-f value` and `-f`
- The first non-flag token becomes `command`; further non-flag tokens are `positional`

A value token is consumed only when it does not start with `-`. This means boolean flags can appear before or after the command name.

### API base URL

The client reads `process.env.API_URL` and falls back to `http://localhost:3000`. Tests override this via `API_URL` in the test environment rather than mocking `fetch`.

### Version resolution across build modes

`version.ts` uses `path.join(__dirname, "../../package.json")`. This resolves correctly for both:
- `ts-node src/cli/index.ts` (`__dirname` = `src/cli`, so `../../package.json` = repo root)
- Compiled `dist/cli/index.js` (`__dirname` = `dist/cli`, so `../../package.json` = repo root)

## Invariants Future Contributors Must Know

1. Never bypass `validateRequired()` for flags that the API will reject -- client-side validation gives callers a consistent VALIDATION exit code rather than a SERVER or network error.
2. Do not use `res.send()` in API handlers (REST server side) and do not use `process.stdout.write` with non-JSON-terminated output in the CLI -- keep the contract clean for callers.
3. The `commands` map in `index.ts` is the single registration point. There is no auto-discovery.
4. Tests use `run(argv)` imported from `index.ts` -- not a running server or child process -- so `require.main === module` guards the auto-run block.
