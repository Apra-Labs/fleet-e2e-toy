# Sprint Requirements: CLI Interface for NoteAPI

## Source Issues
- gh-toy-qv2: CLI CRUD commands
- gh-toy-53n: Help system and input validation
- gh-toy-ow0: Add --version flag to CLI

## Context

The NoteAPI project is a Node.js + Express + TypeScript REST API for managing notes
(src/api/notes.ts, src/models/note.ts). It currently has no CLI interface. This
sprint adds a CLI tool (`note`) that wraps the REST API operations locally (talking
directly to the in-memory store, not via HTTP) so users can manage notes from the
terminal.

The package is currently v1.0.0 (see package.json).

## Functional Requirements

### 1. CLI CRUD Commands (gh-toy-qv2)

Add a `src/cli.ts` entry point that provides the following commands:

```
note create --title <title> --content <content> [--tags <tag1,tag2>]
note list [--tag <tag>] [--search <query>]
note get <id>
note update <id> [--title <title>] [--content <content>] [--tags <tag1,tag2>]
note delete <id>
```

- `create`: Creates a note, prints the created note as JSON.
- `list`: Lists all notes. Supports `--tag` to filter by tag and `--search` to
  full-text search title+content. Prints as JSON array.
- `get`: Retrieves a single note by ID. Prints as JSON. Exits with code 1 if not found.
- `update`: Updates fields of a note. Prints updated note as JSON. Exits with code 1
  if not found.
- `delete`: Deletes a note by ID. Prints `{"deleted": true}`. Exits with code 1 if
  not found.

The CLI must reuse the existing `noteStore` and validation utilities from
`src/utils/validation.ts`. It must NOT start an HTTP server.

Add `"cli": "ts-node src/cli.ts"` to the `scripts` section of `package.json` so
the CLI is runnable via `npm run cli -- <args>`.

### 2. Help System and Input Validation (gh-toy-53n)

- Add `--help` / `-h` flag: prints usage for the root command and for each
  subcommand (e.g., `note --help`, `note create --help`).
- Root `--help` lists all available subcommands with one-line descriptions.
- Subcommand `--help` lists its flags and required/optional status.
- Input validation:
  - `create` / `update`: title must not be empty; content must not be empty on
    create; tags must be an array of strings when provided.
  - When validation fails, print a human-readable error to stderr and exit with
    code 1 (do NOT print a JSON error body — this is CLI, not HTTP).
  - Reuse `validateCreateInput` and `validateUpdateInput` from
    `src/utils/validation.ts` where possible.

### 3. --version flag (gh-toy-ow0)

- `note --version` / `note -V` prints `noteapi/<version>` where `<version>` is read
  from `package.json` (currently `1.0.0`). Exits with code 0.

## Non-Functional Requirements

- TypeScript throughout; no `any` types; proper interfaces from `src/models/`.
- Tests in `tests/cli.test.ts` using Jest. Test every command (CRUD), `--help`,
  `--version`, and invalid-input paths. The CLI must be testable without spawning a
  subprocess — export the command parser / handler so tests can invoke it directly.
- No new npm dependencies beyond what is already in package.json. Use Node's built-in
  `process.argv` parsing or a minimal helper that doesn't need a new package.
- `npm test` must remain green; `npm run lint` must produce no errors.

## Risks and Front-loaded Considerations

1. **Argument parsing without a library**: The project must not add new dependencies.
   Parse `process.argv` manually or with a tiny helper. This is the riskiest part
   because manual parsing is error-prone — build it in Task 1 so the rest of the
   tasks have a solid base.
2. **Testability**: The CLI entry point must be importable (not only a runnable
   script). Export the main dispatch function so tests can call it with mock argv
   arrays.
3. **Store isolation**: Tests must clear the noteStore between test cases
   (noteStore.clear() exists). Verify this is called in afterEach.

## Design Note

No `design.md` is needed — the implementation path is clear (single file CLI, reuse
existing store and validation, parse argv manually, export for tests).
