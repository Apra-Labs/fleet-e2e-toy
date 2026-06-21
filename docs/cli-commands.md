# CLI Command Reference

## Global flags

| Flag | Short | Behaviour |
|------|-------|-----------|
| `--help` | `-h` | Print global help or per-subcommand help (if command is given), exit 0 |
| `--version` | `-v` | Print `fleet-e2e-toy v<version>`, exit 0 |
| `--json` | — | Switch stdout to raw JSON; errors are always JSON regardless |

Global flags are evaluated before command dispatch. `--version` takes precedence over `--help`.

## Commands

### list

List all notes, with optional filters.

```
cli list [--tag <tag>] [--q <query>] [--json]
```

- `--tag`: client-side tag filter (exact match against each note's tags array).
- `--q`: forwarded to the API as `?q=` query parameter (server-side full-text search).
- Both flags may be combined; `--q` is applied server-side first, then `--tag` client-side.
- Output: one line per note in format `<id>: <title> [tag1, tag2]`; or JSON array with `--json`.

### read

Fetch a single note by ID.

```
cli read --id <id>
```

- `--id` is required; exits 1 with JSON error if missing or blank.
- Output: note fields printed as `key: value` lines; or JSON object with `--json`.

### create

Create a new note.

```
cli create --title <title> --content <content> [--tag <tag>]
```

- `--title` and `--content` are required.
- `--tag` is optional; a single value is sent as a one-element array; multiple `--tag` flags use last-value-wins (only the last tag is applied — see known limitations).
- Output: created note; or JSON object with `--json`.

### update

Update an existing note.

```
cli update --id <id> [--title <title>] [--content <content>]
```

- `--id` is required. At least one of `--title` or `--content` should be supplied (the API accepts a patch with only the fields that change).
- Output: updated note; or JSON object with `--json`.

### delete

Delete a note by ID.

```
cli delete --id <id>
```

- `--id` is required.
- Returns no body on success (HTTP 204). Exits 0 silently.

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | User error (missing flag, bad input) or API error |
| 130 | Interrupted (SIGINT / Ctrl-C) |

## Known limitations

- Multiple `--tag` flags on `create` use last-value-wins because the parser never produces array values. To tag a note with multiple tags at creation time, a different CLI design (e.g. `--tag foo --tag bar` accumulation) would be needed.
- `list --tag` is client-side only; it fetches all notes and filters locally, which becomes inefficient for large datasets. The API supports `?tag=` server-side but the CLI does not pass it.
