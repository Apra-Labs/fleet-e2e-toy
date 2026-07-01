# CLI Commands Reference

The NoteAPI CLI provides five subcommands for managing notes, plus global flags.

## Global Flags

| Flag | Description |
|------|-------------|
| `--version`, `-v` | Print `fleet-e2e-toy v<version>` and exit 0. Short-circuits all other flags. |
| `--help`, `-h` | Print usage information and exit 0. Works globally and per-command. |

## Subcommands

### list

List all notes. Prints each note as `<id> <title>`, one per line.

```
noteapi list [--tag <tag>] [--q <search>]
```

- `--tag` filters by tag (passed as `?tag=` query param)
- `--q` searches by keyword (passed as `?q=` query param)

### read

Read and display a single note by ID.

```
noteapi read --id <id>
```

- `--id` is required; missing or blank value exits with code 5 (VALIDATION)
- Exits with code 4 (NOT_FOUND) if the API returns 404

### create

Create a new note. Prints the created note's ID to stdout.

```
noteapi create --title <title> --content <content> [--tag <tags>]
```

- `--title` and `--content` are required and must be non-empty/non-whitespace
- `--tag` accepts a comma-separated list of tags

### update

Update an existing note. Prints the updated note as JSON to stdout.

```
noteapi update --id <id> [--title <title>] [--content <content>] [--tag <tags>]
```

- `--id` is required
- At least one of `--title`, `--content`, or `--tag` should be supplied (the API decides what is valid)

### delete

Delete a note by ID. Exits 0 on success (HTTP 204), no stdout output.

```
noteapi delete --id <id>
```

- `--id` is required

## Error Contract

All errors are written to stderr as `{"error":"<message>"}` (JSON, one line). No stack traces are emitted.

Exit codes:

| Code | Meaning |
|------|---------|
| 0 | Success |
| 2 | Usage error (unknown command, missing required arg context) |
| 4 | Resource not found (404) |
| 5 | Validation failure (blank required flag, or 400 from API) |
| 6 | Network error (cannot reach API) |
| 7 | Server or unexpected error |

## Running the CLI

```bash
npm run cli -- list
npm run cli -- create --title "My Note" --content "Body text"
npm run cli -- read --id <id>
npm run cli -- update --id <id> --title "New title"
npm run cli -- delete --id <id>
```

Override the API base URL with the `API_URL` environment variable (default: `http://localhost:3000`):

```bash
API_URL=http://localhost:3001 npm run cli -- list
```
