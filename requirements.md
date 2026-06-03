# Sprint Requirements: CLI Features P1

## Source Issues

- **gh-toy-4ef** (P1): Add --version flag to CLI
- **gh-toy-v6z** (P1): Add input validation for empty or blank strings
- **gh-toy-kbk** (P1): Implement a help command

## Project Context

NoteAPI is a Node.js/Express/TypeScript REST API (`src/index.ts` starts the server on port 3000).
The entry point currently has no CLI argument handling. The three P1 issues call for adding:
1. CLI flags (`--version`, `--help`) handled at startup before the server binds
2. Validation that rejects blank/whitespace-only strings passed as arguments to the API

Tech stack: TypeScript, Express 4, Jest + supertest for tests, `npm test` runs the suite.

## Riskiest assumption (must be Task 1)

No third-party CLI parsing library is present; `process.argv` parsing must be done inline
or with `process.argv` directly. This keeps the dependency surface minimal and avoids a
`package.json` churn that could break CI.

---

## Requirement 1 — --version flag (gh-toy-4ef)

### What

When `ts-node src/index.ts --version` (or `-v`) is invoked, the process must:
- Print exactly: `noteapi v1.0.0` (version taken from `package.json`)
- Exit with code 0
- NOT start the HTTP server

### Acceptance

- `ts-node src/index.ts --version` prints `noteapi v1.0.0` and exits 0
- `ts-node src/index.ts -v` does the same
- Running without the flag still starts the server normally
- A Jest test (or supertest-adjacent) verifies the output (can use `child_process.spawnSync`)

### Implementation notes

- Read version from `package.json` at runtime (import/require) so it stays DRY
- Handle the flag check before `app.listen()` in `src/index.ts`

---

## Requirement 2 — Input validation for blank strings (gh-toy-v6z)

### What

The REST API already validates that `title` is a non-empty string, but it does not reject
whitespace-only values for `content` or query parameters. This requirement tightens that:

- `POST /api/notes` with `content: "   "` (whitespace only) → 400 with a clear error
- `GET /api/notes?q=   ` (whitespace-only search query) → treat as if no `q` was passed
  (return all notes, or the tag-filtered set) rather than filtering on blank string
- `GET /api/notes?tag=   ` (whitespace-only tag) → treat as if no `tag` was passed

### Acceptance

- `POST /api/notes` body `{ "title": "t", "content": "   " }` returns 400 `{ errors: [{ field: "content", message: "Content must not be blank" }] }`
- `GET /api/notes?q=%20%20` returns all notes (blank q treated as absent)
- `GET /api/notes?tag=%20` returns all notes (blank tag treated as absent)
- Unit tests added for the new validation paths in `tests/validation.test.ts`
- Integration tests added in `tests/notes.test.ts`

### Implementation notes

- Extend `validateCreateInput` in `src/utils/validation.ts` to check `content.trim().length > 0`
- Extend `validateUpdateInput` similarly for content
- In `src/api/notes.ts`, trim and check `tag` and `q` query params before using them

---

## Requirement 3 — Help command (gh-toy-kbk)

### What

When `ts-node src/index.ts --help` (or `-h` or the subcommand `help`) is invoked:
- Print a usage block listing all CLI flags and what the server does
- Exit with code 0
- NOT start the HTTP server

### Acceptance

- `ts-node src/index.ts --help` prints usage and exits 0
- `ts-node src/index.ts -h` does the same
- Output includes at minimum: tool name, description, `--help/-h`, `--version/-v`, and `PORT` env var
- A Jest test verifies the output (child_process.spawnSync)

### Help text format (target)

```
noteapi — REST API for managing notes with tags and search

Usage:
  ts-node src/index.ts [options]

Options:
  --help, -h       Show this help message and exit
  --version, -v    Print version and exit

Environment:
  PORT             Port to listen on (default: 3000)
```

---

## Out of scope

- Interactive CLI subcommands beyond `--help` and `--version`
- Config file support, JSON output mode, SIGINT handling (those are P2)
- No new npm dependencies

## Design note

No design doc needed — the changes are additive to `src/index.ts`, `src/utils/validation.ts`,
and `src/api/notes.ts`. No architectural decisions required.
