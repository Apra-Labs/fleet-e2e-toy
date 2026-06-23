# CLI Architecture

## Overview

The `fleet-e2e-toy` CLI is a thin HTTP client that wraps the NoteAPI REST endpoints. It lives entirely under `src/cli/` and compiles to `dist/cli/index.js`, which is registered as the `fleet-e2e-toy` binary via `package.json#bin`.

## Entry point and dispatch

`src/cli/index.ts` is the single entry point. It:

1. Intercepts global flags (`--version`/`-v`, `--help`/`-h`) before any subcommand dispatch.
2. Reads `process.argv[2]` as the subcommand name and looks it up in a static `commands` map (`Record<string, CommandHandler>`).
3. Passes the remaining `process.argv` slice to the matched handler.
4. Awaits the handler's integer exit code and sets `process.exitCode` — never calls `process.exit()` directly, so async cleanup can run.

Unknown subcommands write to stderr and return exit code 1.

## Command handlers

Each subcommand lives in its own file under `src/cli/commands/`:

| File | Subcommand |
|------|-----------|
| `list.ts` | `list [--tag <tag>] [--q <query>]` |
| `read.ts` | `read --id <id>` |
| `create.ts` | `create --title <t> --content <c> [--tag <tag>...]` |
| `update.ts` | `update --id <id> [--title <t>] [--content <c>] [--tag <tag>...]` |
| `delete.ts` | `delete --id <id>` |

All handlers share the same signature: `(args: string[]) => Promise<number> | number`. Adding a new subcommand means creating a file, exporting a function with this signature, and adding it to the `commands` map in `index.ts`.

Each handler parses its own flags with a local `parseArgs` helper (index-walk over the args array). There is no third-party arg-parsing library.

## HTTP client

`src/cli/client.ts` provides a thin typed wrapper over the Fetch API:

- `baseUrl()` reads `process.env.API_BASE_URL`, defaulting to `http://localhost:3000`. Tests override this env var to point at a test server.
- `CliError` (a subclass of `Error`) carries an HTTP `status` code (0 when the request never reached the server) and a human-readable message.
- `parseErrorMessage` tries to decode the API's `{ error }` or `{ errors[] }` shapes before falling back to the HTTP status text.
- All public functions (`listNotes`, `getNote`, `createNote`, `updateNote`, `deleteNote`) are typed against the existing `Note`, `CreateNoteInput`, and `UpdateNoteInput` model interfaces from `src/models/`.

## Version reporting

`src/cli/version.ts` reads `version` from `package.json` at require-time and exports the string `fleet-e2e-toy v<version>`. This is the single source of truth; no hard-coded version strings exist elsewhere in the CLI.

## Input validation

`src/cli/validation.ts` exports `assertNonBlank(name, value)`. It trims the value and throws a `CliError` if the result is empty. Commands call this after they confirm the flag is present but before calling the API, so the error message is "Error: `<name>` must not be empty" and the exit code is 1 — consistent across all subcommands.

## Help system

`src/cli/help.ts` exports:

- `GLOBAL_USAGE` — top-level help string listing all subcommands and global flags.
- `COMMAND_USAGE` — a map of per-subcommand usage strings.
- `printHelp(command?)` — writes the appropriate string to stdout. The dispatch logic in `index.ts` determines whether to pass a subcommand name.

Help always exits 0 and writes to stdout (not stderr), matching POSIX convention.

## Key invariants

- **No database** — the CLI is stateless; all persistence is in the API server's in-memory store.
- **No global arg-parsing library** — arg parsing is intentionally local to each command to keep dependencies minimal.
- **Exit codes** — 0 for success, 1 for any error (validation, HTTP, unknown command). Handlers never call `process.exit()`.
- **No `console.log`** — all output goes through `process.stdout.write` or `process.stderr.write` per project conventions.
- **No `any` types** — model interfaces from `src/models/` are reused; the one `require` for `package.json` has an explicit eslint-disable comment and a cast.
- **`API_BASE_URL` env var** — the only knob for pointing the CLI at a non-default server. Tests rely on this.
