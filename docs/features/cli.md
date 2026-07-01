# NoteAPI CLI Client

`src/cli.ts` is a standalone TypeScript CLI that wraps the NoteAPI REST server.
It can be run directly with `ts-node src/cli.ts` or compiled and invoked as `noteapi`.

## Subcommands

| Subcommand | Required flags | Optional flags | HTTP call |
|------------|---------------|----------------|-----------|
| `list` | — | `--tag <tag>`, `--q <query>` | `GET /api/notes` |
| `read` | `--id <id>` | — | `GET /api/notes/:id` |
| `create` | `--title <title>`, `--content <content>` | `--tags <t1,t2,...>` | `POST /api/notes` |
| `update` | `--id <id>` | `--title`, `--content`, `--tags` (at least one) | `PUT /api/notes/:id` |
| `delete` | `--id <id>` | — | `DELETE /api/notes/:id` |

All subcommands print JSON to stdout on success. `delete` prints a plain confirmation string instead of JSON.

## Global Flags

```
--url <base-url>   Override the API base URL for this invocation
-h, --help         Print usage summary (or subcommand help when after a subcommand)
-v, --version      Print "noteapi-cli v<version>" and exit 0
```

Global flags must appear before the subcommand token. Everything after the subcommand is owned by that subcommand's parser.

## URL Resolution

The base URL is resolved in priority order:

1. `--url <base-url>` flag on the command line
2. `NOTEAPI_URL` environment variable
3. Default: `http://localhost:3000`

Trailing slashes are stripped from the resolved URL before constructing request paths.

## Help System

- Running the CLI with no arguments prints the global usage summary and exits with code 1 (usage error).
- `--help` / `-h` at the global level prints the usage summary and exits 0.
- `<subcommand> --help` (or `-h`) prints that subcommand's usage and exits 0.
- Help text is checked before any argument validation or API call.

## Input Validation

Validation runs before any HTTP request is made:

- Missing required flags produce `Error: --<flag> is required for <subcommand>` on stderr, exit 1.
- Present but blank (empty or whitespace-only) required flag values produce `Error: --<flag> must not be empty or whitespace-only`, exit 1.
- The `update` subcommand requires at least one of `--title`, `--content`, or `--tags`; supplying none produces an error.
- Unknown global flags produce `Error: Unknown global flag: <flag>`, exit 1.
- Unknown subcommands produce `Error: Unknown command: <subcommand>`, exit 1.

## Error Handling

All errors follow the same pattern: a human-readable message is written to stderr prefixed with `Error: `, no stack traces are printed, and the process exits with code 1. This applies to:

- Network failures reaching the server
- Non-2xx HTTP responses (message extracted from `{ "error": "..." }` or `{ "errors": [...] }` response bodies)
- Argument parsing errors
- Validation errors

## API Client Contract

`apiRequest(baseUrl, path, options)` is the single HTTP helper. It:

- Accepts an optional `query` map — entries with `undefined` values are omitted from the query string.
- Sets `Content-Type: application/json` only when a `body` is present.
- Returns the parsed JSON body on success, or `undefined` for empty responses (e.g., 204).
- Throws `CliError` on network failure or non-2xx status.

`--tags` values are split on commas, each segment trimmed, and empty segments discarded before being sent in the request body.

## Version

`--version` / `-v` reads `version` from `package.json` at build time and prints `noteapi-cli v<version>`, then exits 0.

## Examples

```bash
# List all notes
noteapi list

# Filter by tag and search query
noteapi list --tag work --q "meeting"

# Read a note
noteapi read --id abc123

# Create a note with tags
noteapi create --title "Hello" --content "World" --tags "personal,idea"

# Update title only
noteapi update --id abc123 --title "Updated title"

# Delete a note
noteapi delete --id abc123

# Use a different server
noteapi --url http://staging.example.com:3000 list

# Per-subcommand help
noteapi create --help
```
