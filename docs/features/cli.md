# CLI Feature — fleet-e2e-toy

## Overview

`fleet-e2e-toy` is a command-line interface for the NoteAPI REST service. It provides full CRUD access to notes via five subcommands, with built-in help, version reporting, and input validation.

## Architecture

### Technology Choices

**CLI framework: yargs (^18.0.0)**
yargs was promoted from a transitive dependency to an explicit runtime dependency in `package.json`. commander was evaluated and rejected — it was not present in the dependency tree. Hand-rolling `process.argv` parsing was also rejected because yargs provides subcommand dispatch, typed option coercion, and `--help` generation at no additional dependency cost.

**HTTP client: built-in global `fetch` (Node >= 20)**
No third-party HTTP library was added. The runtime environment is Node 20, which ships `fetch` as a global. This keeps the dependency surface minimal. If the runtime ever drops below Node 18, a one-line `undici` fallback is the upgrade path — not re-introducing `node-fetch` or `axios`.

**Entry point: `src/cli/index.ts` → `dist/cli/index.js`**
The CLI lives under `src/cli/` as a sibling subtree to the Express API under `src/api/`. The existing `tsconfig.json` (`rootDir=src`, `outDir=dist`) emits `dist/cli/index.js` automatically when `npm run build` (i.e., `tsc`) runs. No tsconfig changes were required.

**Binary exposure: `fleet-e2e-toy` bin field**
`package.json` carries a `bin` field mapping `"fleet-e2e-toy"` to `"dist/cli/index.js"`. After `npm install -g` or `npm link`, npm creates a `fleet-e2e-toy` symlink in the user's PATH. The compiled entry file begins with `#!/usr/bin/env node`.

### Source Layout

```
src/cli/
  index.ts        — yargs setup, subcommand handlers, error dispatch
  api-client.ts   — thin HTTP wrapper over the NoteAPI REST endpoints
  validation.ts   — CliValidationError class and validateNonEmpty helper
```

## API Base URL

The client reads `NOTEAPI_URL` from the environment. If the variable is absent, it defaults to `http://localhost:3000`. All API paths are rooted at `/api/notes` (matching the Express mount point).

```
NOTEAPI_URL=http://staging.internal:4000 fleet-e2e-toy list
```

## Commands and Flags

### Global flags

| Flag | Alias | Behaviour |
|------|-------|-----------|
| `--help` | `-h` | Print usage for the current scope and exit 0 |
| `--version` | `-V` | Print `fleet-e2e-toy v1.0.0` and exit 0 |

### `list`

List all notes. Output is one line per note: `<id>\t<title>`.

```
fleet-e2e-toy list [--tag <tag>] [--q <query>]
```

| Option | Required | Description |
|--------|----------|-------------|
| `--tag` | No | Filter notes by tag |
| `--q` | No | Full-text search query |

If no notes match, prints `No notes found.`

### `read`

Fetch a single note by ID and print its fields.

```
fleet-e2e-toy read --id <id>
```

| Option | Required | Description |
|--------|----------|-------------|
| `--id` | Yes | Note ID |

### `create`

Create a new note. Prints `created <id>: <title>` on success.

```
fleet-e2e-toy create --title <title> --content <content> [--tag <tag>]...
```

| Option | Required | Description |
|--------|----------|-------------|
| `--title` | Yes | Note title |
| `--content` | Yes | Note body |
| `--tag` | No | Tag (repeatable) |

### `update`

Update an existing note. At least one of `--title` or `--content` must be provided. Prints `updated <id>` on success.

```
fleet-e2e-toy update --id <id> [--title <title>] [--content <content>]
```

| Option | Required | Description |
|--------|----------|-------------|
| `--id` | Yes | Note ID |
| `--title` | No | Replacement title |
| `--content` | No | Replacement body |

### `delete`

Delete a note by ID. Prints `deleted <id>` on success.

```
fleet-e2e-toy delete --id <id>
```

| Option | Required | Description |
|--------|----------|-------------|
| `--id` | Yes | Note ID |

## Error Handling and Exit Codes

| Condition | Exit code | Output |
|-----------|-----------|--------|
| Validation failure (empty/whitespace arg) | 2 | `error: --<flag> must not be empty` on stderr |
| API error or network failure | 1 | `error: API error <status>: <message>` on stderr |
| Unknown command | 1 | `error: unknown command <name>` + usage on stderr |
| Missing required flag (yargs) | 1 | yargs message + usage on stderr |

Stack traces are never printed to stderr. The `CliValidationError` class is the sentinel that distinguishes validation exits (code 2) from all other errors (code 1).

## Input Validation Invariants

- Any flag value that is an empty string or contains only whitespace is rejected with `CliValidationError` before the HTTP call is made.
- Optional flags (`--tag`, `--q` on `list`; `--title`, `--content` on `update`) are only validated if actually supplied — omitting them is not an error.
- The `update` subcommand requires at least one of `--title` or `--content`; supplying `--id` alone exits 2.

## API Client Contract

`api-client.ts` exports five functions that map one-to-one to the REST endpoints:

| Function | Method | Path |
|----------|--------|------|
| `listNotes(tag?, q?)` | GET | `/api/notes[?tag=&q=]` |
| `getNote(id)` | GET | `/api/notes/:id` |
| `createNote(title, content, tags?)` | POST | `/api/notes` |
| `updateNote(id, updates)` | PUT | `/api/notes/:id` |
| `deleteNote(id)` | DELETE | `/api/notes/:id` |

Non-2xx responses are thrown as `Error` with the message extracted from the API's `{ error: "…" }` envelope. The `fetchJSON<T>` helper handles JSON parsing and passes raw text through when the body is empty (DELETE responses).

## Key Invariant: API Mount Path

The Express server mounts note routes at `/api/notes`, not `/notes`. The API client must use the `/api/notes` prefix in every path string. This was a source of a defect during the sprint (paths were initially written as `/notes`) and was corrected before release.
