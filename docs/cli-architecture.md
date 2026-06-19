# CLI Architecture

Added in sprint/p1-features. The CLI is a thin wrapper around the NoteAPI REST API, invoked via `ts-node src/cli/index.ts` or (after build) `noteapi`.

## Entry point and dispatch

`src/cli/index.ts` owns the top-level dispatch loop:

1. Parse raw `process.argv` with `parseArgs` from `src/cli/parser.ts`.
2. Check `--version` / `-v` first — print version and exit 0.
3. Check `--help` / `-h` next — print global or per-subcommand help and exit 0.
4. Switch on `args.subcommand` to one of five command modules; unknown subcommand exits 1.

The order (version before help before subcommand) is intentional: it allows `--version --help` to print the version string and stop rather than falling into the help path.

## Argument parser (`src/cli/parser.ts`)

Accepts `process.argv` and returns a `CliArgs` object:

```typescript
interface CliArgs {
  subcommand: string;          // first non-flag token, or "" if none
  flags: {
    id?: string;
    title?: string;
    content?: string;
    tag?: string;
    q?: string;
    help?: boolean;
    version?: boolean;
    h?: boolean;
    v?: boolean;
  };
}
```

Supported flag forms:
- `--key=value` — preferred form; all e2e tests use this.
- `--key value` — treated as value only when the next token does not start with `-`.
- `-h`, `-v` — single-character short flags, boolean only.

**Known constraint:** when using `--key value` (space form), any value beginning with `-` is treated as a new flag rather than a value. The `--key=value` form is unaffected and is the safe choice.

## API client (`src/cli/apiClient.ts`)

A thin fetch wrapper. The base URL defaults to `http://localhost:3000` and is overridden by the `NOTEAPI_URL` environment variable. All routes use the `/api/notes` prefix.

```
listNotes({ tag?, q? })   → GET  /api/notes[?tag=&q=]
getNote(id)               → GET  /api/notes/:id
createNote({ title, content, tags? })  → POST /api/notes
updateNote(id, { title?, content? })   → PUT  /api/notes/:id
deleteNote(id)            → DELETE /api/notes/:id
```

On a non-2xx response the client throws `Error("NoteAPI error <status>: <body>")`. Command handlers catch this and exit with code 1; they never let the raw error object reach stdout.

## Input validation (`src/cli/validate.ts`)

Two exported helpers:

- `isBlank(value: string): boolean` — true if value is empty or whitespace-only.
- `validateRequired(name, value): string | null` — returns an error message string or null. Wired into every handler before the API call is made.

This separation keeps validation logic testable in isolation (`tests/cli/validate.test.ts`).

## Command modules (`src/cli/commands/`)

| File | Required flags | Optional flags |
|------|---------------|----------------|
| `list.ts` | none | `--tag`, `--q` |
| `read.ts` | `--id` | |
| `create.ts` | `--title`, `--content` | |
| `update.ts` | `--id` | `--title`, `--content` |
| `delete.ts` | `--id` | |

All handlers follow the same pattern: validate required flags, call the API client, print JSON to stdout (success) or write an error message to stderr and exit 1 (failure). Stack traces are never surfaced to the user.

## Help system (`src/cli/help.ts`)

`printHelp(command?)` writes to stdout. When called with no argument or an unrecognised command it prints global usage. When called with a known subcommand name it prints that subcommand's usage. Exit codes are always 0 for help.

## Version (`src/cli/version.ts`)

`getVersion()` reads `package.json` at runtime via `fs.readFileSync`. This means the printed version always matches the deployed `package.json` without any build-time string embedding.

## Invocation

During development (no build required):

```bash
npm run cli -- list
npm run cli -- create --title="..." --content="..."
NOTEAPI_URL=http://localhost:3001 npm run cli -- list
```

After `npm run build`:

```bash
node dist/cli/index.js list
```

The `bin.noteapi` entry in `package.json` points to `dist/cli/index.js`. Note that `src/cli/index.ts` does not contain a `#!/usr/bin/env node` shebang, so `npm link` / global install will not produce an executable bin without adding the shebang and rebuilding.
