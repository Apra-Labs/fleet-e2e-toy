# NoteAPI CLI — API Contracts and Feature Design

## Subcommand Reference

All subcommands target the base URL resolved at runtime (see `NOTECLI_BASE_URL` in cli-architecture.md). Default base: `http://localhost:3000`.

### list

```
notecli list [--tag <tag>] [--q <query>]
```

- HTTP: `GET /api/notes`
- Optional `--tag` appends `?tag=<value>` to the query string.
- Optional `--q` appends `?q=<value>` to the query string.
- Both filters may be combined.
- Output: JSON array of notes, pretty-printed to stdout.
- Exit 0 on success; exit 1 on non-2xx or network error.

### read

```
notecli read --id <id>
```

- HTTP: `GET /api/notes/:id`
- `--id` is required; blank/whitespace values are rejected before the HTTP call.
- Output: JSON object of the note, pretty-printed to stdout.
- Exit 0 on success; exit 1 on error (including 404).

### create

```
notecli create --title <title> --content <content>
```

- HTTP: `POST /api/notes` with JSON body `{ title, content }`.
- Both `--title` and `--content` are required; empty or whitespace-only values are rejected.
- Output: JSON object of the created note (including assigned `id` and timestamps), pretty-printed to stdout.
- Exit 0 on success; exit 1 on error.

### update

```
notecli update --id <id> [--title <title>] [--content <content>]
```

- HTTP: `PUT /api/notes/:id` with JSON body containing only the provided fields.
- `--id` is required.
- At least one of `--title` or `--content` must be provided; omitting both is rejected locally before any HTTP call.
- If `--title` or `--content` is provided, it must not be empty or whitespace-only.
- Output: JSON object of the updated note, pretty-printed to stdout.
- Exit 0 on success; exit 1 on error.

### delete

```
notecli delete --id <id>
```

- HTTP: `DELETE /api/notes/:id`
- `--id` is required; blank/whitespace values are rejected before the HTTP call.
- Output: prints `Note deleted successfully.` to stdout on HTTP 204.
- Exit 0 on success; exit 1 on error.

## Help System

- `notecli --help` and `notecli -h` print global usage listing all five subcommands and exit 0.
- `notecli <subcommand> --help` prints per-subcommand usage (flags, descriptions) and exits 0.
- An unknown subcommand name prints `Error: unknown subcommand '<name>'` followed by global usage to stderr and exits 1.

## Error Behavior Contract

| Error condition | Output stream | Exit code | Stack trace |
|---|---|---|---|
| Missing required flag | stderr (Commander built-in) | 1 | No |
| Empty/blank flag value | stderr, "Error: --<flag> must be a non-empty string" | 1 | No |
| update with no --title/--content | stderr, "Error: at least one of --title or --content must be provided" | 1 | No |
| API non-2xx response | stderr, "Error: <API error message or HTTP status>" | 1 | No |
| Network failure | stderr, "Error: Network error: <OS message>" | 1 | No |
| Unknown subcommand | stderr, usage text | 1 | No |

## Input Validation Rules

`validateRequiredString(value, flagName)` — throws if value is empty string or whitespace-only. Used by: `read` (id), `create` (title, content), `delete` (id).

`validateOptionalString(value, flagName)` — throws only if value is defined AND empty/whitespace-only. Used by: `update` (title, content — when present).

Both functions throw plain `Error` (not `CliError`); the subcommand `catch` block converts these to stderr output and exit 1.

## HTTP Client Contract

`httpClient(options: HttpClientOptions): Promise<unknown>`

- `options.baseUrl` — optional, overrides environment and default.
- `options.method` — HTTP method string.
- `options.path` — path string starting with `/`.
- `options.body` — optional, serialized as JSON; adds `Content-Type: application/json` header.
- Returns parsed JSON body on 2xx (or `null` on 204).
- Throws `CliError(status, message)` on non-2xx, where `message` is the API's `error` field if present.
- Throws `CliError(null, 'Network error: ...')` on fetch-level failure.
