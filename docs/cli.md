# NoteAPI CLI

The `note` CLI provides command-line access to the NoteAPI REST service. It is implemented in TypeScript at `src/cli/` and compiled to `dist/cli/index.js`.

## Installation and Build

The CLI is registered as a bin entry in `package.json`:

```json
"bin": { "note": "dist/cli/index.js" }
```

Run `npm run build` to compile. After installing globally or linking the package, the binary is available as `note`.

Node.js >= 18 is required (native `fetch` is used; no third-party HTTP client).

## Version String

`note --version` (or `note -V`) prints:

```
fleet-e2e-toy v1.0.0
```

Exit code 0.

## Base URL Configuration

All subcommands resolve the API base URL in this precedence order:

1. `--base-url <url>` global flag passed on the command line
2. `NOTE_API_URL` environment variable
3. Default: `http://localhost:3000`

The base URL is stripped of any trailing slash before path concatenation.

## API Path Prefix

All subcommands route to `/api/notes` (e.g. `GET http://localhost:3000/api/notes`).

## Exit Codes

| Condition | Code |
|---|---|
| Success | 0 |
| `--help` or `--version` displayed | 0 |
| Validation failure | 1 |
| HTTP 4xx / 5xx error | 1 |
| Unknown error | 1 |

Errors are written to stderr as a single human-readable line (`Error: <message>`). Stack traces are never surfaced to the user.

HTTP error messages are formatted as `HTTP <status>: <message>` where `<message>` is extracted from the response body's `error` field when present, otherwise the HTTP status text.

## Global Options

| Flag | Description |
|---|---|
| `--base-url <url>` | Override the API base URL |
| `-V, --version` | Print version string and exit |
| `-h, --help` | Print usage and exit |

## Subcommands

### list

List notes, with optional filtering.

```
note [--base-url <url>] list [--tag <tag>] [--q <query>]
```

- `--tag <tag>` — filter by a single tag
- `--q <query>` — full-text search query

Sends `GET /api/notes` with query parameters. Prints a JSON array to stdout.

### read

Fetch a single note by ID.

```
note [--base-url <url>] read --id <id>
```

- `--id <id>` — required; must be a non-empty string

Sends `GET /api/notes/:id`. Prints the note JSON object to stdout.

### create

Create a new note.

```
note [--base-url <url>] create --title <title> [--content <content>] [--tags <tag,...>]
```

- `--title <title>` — required; must be a non-empty string
- `--content <content>` — optional body text (defaults to empty string)
- `--tags <tag,...>` — optional comma-separated list of tags; each tag is trimmed, empty entries are dropped

Sends `POST /api/notes` with a JSON body `{ title, content, tags }`. Prints the created note JSON to stdout.

### update

Update an existing note.

```
note [--base-url <url>] update --id <id> [--title <title>] [--content <content>] [--tags <tag,...>]
```

- `--id <id>` — required; must be a non-empty string
- At least one of `--title`, `--content`, or `--tags` must be provided; omitting all three is a validation error (exit 1)
- If `--title` is provided it must be non-empty
- `--tags` follows the same comma-separated / trim / drop-empty rules as `create`

Sends `PUT /api/notes/:id` with only the supplied fields in the JSON body. Prints the updated note JSON to stdout.

### delete

Delete a note by ID.

```
note [--base-url <url>] delete --id <id>
```

- `--id <id>` — required; must be a non-empty string

Sends `DELETE /api/notes/:id`. Prints `Deleted note <id>` to stdout on success.

## Input Validation

The `requireNonEmptyString(name, value)` helper (in `src/cli/validation.ts`) is used to validate all required string inputs. It trims the value and throws `Error: --<name> must be a non-empty string` if the result is empty. The top-level error handler catches this and writes it to stderr before exiting 1.

## HTTP Client

All HTTP calls go through `src/cli/http.ts`. The `request<T>()` function:

- Accepts `method`, `baseUrl`, `path`, `query` (key-value pairs serialised with `URLSearchParams`), and `body`
- Sets `Content-Type: application/json` and JSON-serialises the body when one is provided
- Uses the Node.js built-in `fetch` (requires Node >= 18)
- Throws on non-2xx responses; 204 No Content returns `undefined`

## Help System

Every subcommand registers `.exitOverride()` so Commander throws a `CommanderError` on `--help` rather than calling `process.exit` directly. The top-level handler inspects the error code (`commander.helpDisplayed`, `commander.version`) and exits 0, keeping the process lifecycle testable without spawning subprocesses.

Subcommand help is available via `note <cmd> --help` or `note <cmd> -h`.
