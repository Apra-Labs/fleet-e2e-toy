# Sprint Requirements: NoteAPI CLI Client

## Source Issues

- **gh-toy-mi2** (P1): CLI CRUD commands — list, read, create, update, delete subcommands
- **gh-toy-7rp** (P1): CLI help system and input validation
- **gh-toy-4ef** (P1): Add --version flag to CLI

## Context

The NoteAPI REST server already exists (`src/`) and exposes:
- `GET /api/notes?tag=X&q=Y` — list notes with optional tag/search filters
- `GET /api/notes/:id` — read one note
- `POST /api/notes` — create (body: title, content, tags)
- `PUT /api/notes/:id` — update (body: title, content, tags — all optional)
- `DELETE /api/notes/:id` — delete
- `GET /health` — health check

No design file is needed — the CLI structure is straightforward with one obvious implementation path.

## Deliverables

### 1. CLI entry point (`src/cli.ts`)

A standalone Node.js CLI script (executable via `ts-node src/cli.ts` or compiled).

- Default API base URL: `http://localhost:3000` (overridable via `--url` flag or `NOTEAPI_URL` env var).
- Global flags: `--url <base-url>`, `--help`/`-h`, `--version`/`-v`.
- Non-zero exit on API error; human-readable error on stderr, no stack traces.

### 2. Subcommands (gh-toy-mi2)

| Subcommand | Flags | Behaviour |
|------------|-------|-----------|
| `list` | `--tag <tag>`, `--q <query>` | GET /api/notes with optional filters; print results to stdout |
| `read` | `--id <id>` (required) | GET /api/notes/:id; print note to stdout |
| `create` | `--title <t>` (required), `--content <c>` (required), `--tags <t1,t2>` | POST /api/notes; print created note |
| `update` | `--id <id>` (required), `--title <t>`, `--content <c>`, `--tags <t1,t2>` | PUT /api/notes/:id; print updated note |
| `delete` | `--id <id>` (required) | DELETE /api/notes/:id; print confirmation |

### 3. Help system (gh-toy-7rp)

- `--help`/`-h` globally: print usage summary and list of subcommands, exit 0.
- `--help`/`-h` per subcommand: print subcommand usage with its flags, exit 0.
- No stack traces in error output — wrap all errors.

### 4. Input validation (gh-toy-7rp)

- Reject empty or whitespace-only required arguments with a clear error message and exit code 1.
- Validate required flags are present before making any API call.

### 5. --version flag (gh-toy-4ef)

- `--version`/`-v` at global level: print `noteapi-cli v<version>` from package.json, exit 0.

## Risks

**Risk 1 (highest):** The CLI makes HTTP calls to a running server. Integration tests require the server to be up. The deploy.md and integ-test-playbook.md already cover this. Mitigation: unit-test the CLI with mocked HTTP calls; integration tests use the real server.

## Out of Scope

- Persistence/config file (`gh-toy-24g`).
- JSON output mode (`gh-toy-aqd`).
- SIGINT handling (`gh-toy-69s`).
- Tag filtering endpoint changes — the server already handles this.
