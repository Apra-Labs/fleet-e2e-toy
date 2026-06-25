# Requirements: NoteAPI CLI (gh-toy-mi2, gh-toy-7rp, gh-toy-4ef)

## Source Issues
- **gh-toy-mi2** P1: CLI CRUD commands (list/read/create/update/delete)
- **gh-toy-7rp** P1: CLI help system and input validation
- **gh-toy-4ef** P1: Add --version flag to CLI

## Background
NoteAPI is an Express/TypeScript REST API running on port 3000 (local: 3001).
Existing routes in `src/api/notes.ts`: GET /notes, GET /notes/:id, POST /notes,
PUT /notes/:id, DELETE /notes/:id. There is no CLI today.

## Requirements

### R1: CLI entrypoint
- A TypeScript CLI at `src/cli/index.ts`, compiled to `dist/cli/index.js`
- Executable via `node dist/cli/index.js` (or after `chmod +x`, directly)
- `package.json` bin field pointing to `dist/cli/index.js` as `note`
- Uses `commander` for argument parsing (already a common pattern in this project)

### R2: --version flag (gh-toy-4ef)
- `note --version` and `note -V` print `fleet-e2e-toy v1.0.0` and exit 0
- Works alongside other flags / subcommands without breaking them

### R3: Help system (gh-toy-7rp)
- `note --help` and `note -h` print usage and exit 0
- Each subcommand supports `note <cmd> --help` / `note <cmd> -h`
- Help text lists options and their descriptions

### R4: Input validation (gh-toy-7rp)
- Empty or whitespace-only string arguments rejected with clear error + exit 1
- No stack traces in error output — only a human-readable message to stderr
- Applies to: --title, --content when creating/updating; --id on read/update/delete

### R5: CRUD subcommands (gh-toy-mi2)
All subcommands call the NoteAPI HTTP endpoint (default base URL: http://localhost:3000).
Base URL configurable via `--base-url` global option or `NOTE_API_URL` env var.

- **list** — `note list [--tag <tag>] [--q <query>]`
  → GET /notes?tag=&q= ; print JSON array to stdout; exit 0
- **read** — `note read --id <id>` (--id required)
  → GET /notes/:id ; print JSON object to stdout; exit 0
- **create** — `note create --title <title> [--content <content>] [--tags <tag,...>]`
  (--title required)
  → POST /notes ; print created note JSON to stdout; exit 0
- **update** — `note update --id <id> [--title <t>] [--content <c>] [--tags <tag,...>]`
  (--id required; at least one of --title/--content/--tags required)
  → PUT /notes/:id ; print updated note JSON to stdout; exit 0
- **delete** — `note delete --id <id>` (--id required)
  → DELETE /notes/:id ; print confirmation to stdout; exit 0

Non-zero exit on HTTP 4xx/5xx errors; error message to stderr.

## Risk: riskiest assumption
Commander v10+ is installed. If not, we install it. The CLI must handle
`commander`'s error output (it throws `CommanderError`s on invalid input)
and not let those surface as raw stack traces.

## Out of scope
- Design.md not needed; single obvious implementation path.
- No interactive prompts; no config file; tags as comma-separated in --tags.
