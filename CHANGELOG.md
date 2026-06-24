# Changelog

## [Sprint pmlite-e2e s1] — 2026-06-24

### Sprint Goal

Deliver a fully functional `notecli` command-line client for the NoteAPI, covering all five CRUD operations, a help system, and input validation — building the CLI from scratch against a pre-existing Express/TypeScript REST API.

### What Was Implemented

- **notecli binary** (`src/cli/index.ts`, compiled to `dist/cli/index.js`): a Commander-based CLI entry point registered as the `notecli` bin in `package.json`.
- **Five CRUD subcommands**: `list` (GET /api/notes with optional `--tag`/`--q` filter params), `read` (GET /api/notes/:id), `create` (POST /api/notes), `update` (PUT /api/notes/:id with at-least-one-field enforcement), `delete` (DELETE /api/notes/:id).
- **HTTP client wrapper** (`src/cli/client.ts`): typed `httpClient` function using Node.js built-in `fetch`; introduces `CliError` class carrying HTTP status; resolves base URL via `options.baseUrl` > `NOTECLI_BASE_URL` env var > `http://localhost:3000`.
- **Input validation** (`src/cli/validation.ts`): `validateRequiredString` and `validateOptionalString` helpers that reject empty and whitespace-only flag values, naming the failing flag in the error message.
- **Help system**: `--help`/`-h` globally and per subcommand (Commander built-in); unknown subcommand handler prints usage to stderr and exits 1.
- **Unit test suite** (`tests/cli/`): 4 test files covering validation, HTTP client error handling, all five subcommands (with mocked client), and help/unknown-subcommand behavior. Total test count: 65 (up from 21).
- **Path fix** (m5w.10): corrected subcommand paths from `/notes` to `/api/notes` throughout, matching the Express router mount point.

### Carried Forward

- gh-toy-m5w.8 (P3): Pagination support (`GET /api/notes?page=&limit=`) — not in sprint scope; deferred.
- gh-toy-m5w.9 (P3): Note archiving endpoints and `archived` field — not in sprint scope; deferred.
- gh-toy-13t (P1): Source issue "Add input validation for empty or blank strings" — implemented within this sprint but issue not closed via bd; carried forward for explicit closure.
- gh-toy-7rp (P1): Source issue "CLI help system and input validation" — implemented within this sprint but issue not closed via bd; carried forward.
- gh-toy-mi2 (P1): Source issue "CLI CRUD commands" — implemented within this sprint but issue not closed via bd; carried forward.
- gh-toy-4ef (P1): Add --version flag to CLI — not addressed this sprint.
- gh-toy-24g (P2): Config file support (`~/.fleet-e2e-toy.yaml`) — not in sprint scope.
- gh-toy-69s (P2): Graceful SIGINT handling — not in sprint scope.
- gh-toy-aqd (P2): JSON output mode via `--json` flag — not in sprint scope.

### Acceptance Criteria Status

All three source-issue acceptance criteria (gh-toy-mi2, gh-toy-7rp, gh-toy-13t) met. `npm run build`, `npm run lint`, and `npm test` all pass (65 tests, 0 failures). Live end-to-end smoke against the Express server confirmed all five subcommands round-trip correctly.
