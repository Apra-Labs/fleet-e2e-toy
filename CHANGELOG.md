# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — 2026-06-25

### Sprint: NoteAPI CLI (gh-toy-mi2, gh-toy-7rp, gh-toy-4ef)

Added a full-featured command-line interface (`note`) for managing notes via the NoteAPI REST service. The CLI covers the complete CRUD surface, a help system with per-subcommand help, input validation with human-readable errors, and a `--version` flag returning the version string `fleet-e2e-toy v1.0.0`.

#### Added

- **`note list`** — list all notes with optional `--tag` and `--q` filters (gh-toy-mi2)
- **`note read --id <id>`** — fetch a single note by ID (gh-toy-mi2)
- **`note create --title <title>`** — create a note with optional `--content` and `--tags` (gh-toy-mi2)
- **`note update --id <id>`** — update title, content, or tags on an existing note (gh-toy-mi2)
- **`note delete --id <id>`** — delete a note by ID (gh-toy-mi2)
- **`--base-url` / `NOTE_API_URL`** — configurable API base URL with default `http://localhost:3000` (gh-toy-mi2)
- **Help system** — `note --help` and `note <cmd> --help` via Commander's exitOverride pattern (gh-toy-7rp)
- **Input validation** — empty/whitespace strings rejected with clean stderr messages, no stack traces (gh-toy-7rp)
- **`note --version` / `note -V`** — prints `fleet-e2e-toy v1.0.0` and exits 0 (gh-toy-4ef)
- `commander` v10 added as a production dependency; Node.js engine pinned to >= 18 for native `fetch`
- 39 Jest tests covering version, help, validation, and all CRUD subcommands

#### Carried Forward

None. All three P1 source issues (gh-toy-mi2, gh-toy-7rp, gh-toy-4ef) were completed this sprint.
