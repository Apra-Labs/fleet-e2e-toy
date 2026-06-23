# CLI Architecture

## Overview

The `fleet-e2e-toy` CLI is a thin client that issues HTTP requests to the NoteAPI server and formats the results for a terminal user. It is invoked via `npm run cli -- <args>` (or `ts-node src/cli/index.ts <args>`).

## Entry point and dispatch

`src/cli/index.ts` is the entry point. It:

1. Calls `parseArgs(process.argv.slice(2))` from `src/cli/args.ts`.
2. Checks global flags in a strict priority order: `--version/-v` first, then `--help/-h`, then falls through to subcommand dispatch.
3. Looks up the subcommand in a static `commands` dispatch table (`Record<string, CommandHandler>`).
4. Calls the matching handler and assigns its return value to `process.exitCode`.

`CommandHandler` is typed as `(args: ParsedArgs) => number`. In practice, every current handler fires an async HTTP call without `await` and returns `0` synchronously, setting `process.exitCode = 1` inside a `.catch` handler. This works because Node.js drains the event loop before exiting, but it means the return value is not the actual exit code in error cases — the `.catch` side-effect is.

## Argument parsing (`src/cli/args.ts`)

`parseArgs` produces a `ParsedArgs` value:

```typescript
interface ParsedArgs {
  command: string | undefined;   // first non-flag token
  flags: Record<string, string | boolean>;
  positionals: string[];         // non-flag tokens after the command
}
```

Flag forms supported:
- `--flag value` — value-bearing (next token that is not itself a flag)
- `--flag=value` — inline value
- `--flag` — boolean `true`
- `-f` — short boolean flag

`validateNonBlank(value, argName)` is a companion utility that rejects `undefined`, `true`, `false`, and whitespace-only strings, returning the trimmed string value or throwing with a clear message. Command handlers call this before passing values to the API client.

## HTTP client (`src/cli/apiClient.ts`)

A zero-dependency HTTP client built on Node's built-in `http`/`https` modules. It resolves the base URL from `process.env.API_URL` (falling back to `http://localhost:${PORT ?? 3000}`), so the target server can be overridden at runtime without code changes.

Exported functions mirror the five NoteAPI operations:

| Function | Method | Path |
|---|---|---|
| `fetchNotes(tag?, q?)` | GET | `/api/notes[?tag=&q=]` |
| `fetchNote(id)` | GET | `/api/notes/:id` |
| `createNote(title, content, tags)` | POST | `/api/notes` |
| `updateNote(id, updates)` | PUT | `/api/notes/:id` |
| `deleteNote(id)` | DELETE | `/api/notes/:id` |

All functions throw on non-2xx HTTP status. The error message extracts `body.error` — note that validation failures from the API return `{ errors: [...] }` (plural), so only the first 400-class detail is currently surfaced; the exit code is still non-zero.

## Help system (`src/cli/help.ts`)

`printHelp(command?)` writes to stdout. If `command` is a known subcommand name, it prints command-specific help; otherwise it prints the global usage listing all five subcommands and global flags. Both forms show the `--help/-h` option so users can discover per-command help.

## Version reporting (`src/cli/version.ts`)

`printVersion()` imports `package.json` directly (via `resolveJsonModule`) and writes `fleet-e2e-toy v<version>` to stdout. This keeps the version string in a single source of truth.

## Subcommands (`src/cli/commands/`)

Each file exports one handler function. All handlers follow the same pattern:

1. Extract flag values and validate them with `validateNonBlank` where required.
2. Fire an async call to the apiClient.
3. On success, write JSON or human-readable text to stdout and call the callback with exit code 0.
4. On failure, write a plain error message to stderr and set `process.exitCode = 1`.

| File | Command | Required flags | Optional flags |
|---|---|---|---|
| `list.ts` | `list` | none | `--tag`, `--q`, `--json` |
| `read.ts` | `read` | `--id` | `--json` |
| `create.ts` | `create` | `--title`, `--content` | `--tags` (CSV), `--json` |
| `update.ts` | `update` | `--id` | `--title`, `--content`, `--tags` (CSV), `--json` |
| `delete.ts` | `delete` | `--id` | none |

## Key invariants

- Errors are always plain text on stderr. Raw Error objects and stack traces must never appear in output.
- `res.status(code).json(...)` is used in the API server; the CLI never calls `res.send()`.
- The in-memory store in the API server is intentional — no database is installed or required.
- `API_URL` environment variable is the canonical override point for pointing the CLI at a non-default server.
- The `npm run cli` script (added in this sprint) is the supported invocation method; direct `ts-node` calls also work.

## Test approach

CLI tests use Jest with `supertest`. Tests start the Express app in-process (not a running server), override `API_URL` to point at the test server's address, then invoke `run(argv)` directly from `src/cli/index.ts`. This exercises the full stack — argument parsing, validation, HTTP client, and command output — without requiring a separate server process.
