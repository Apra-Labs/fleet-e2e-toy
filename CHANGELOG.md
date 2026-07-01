# Changelog

## Sprint: cli-features (2026-07-01)

### Sprint Goal

Deliver a fully functional CLI client for NoteAPI so that users can interact with the REST API from the command line without writing any HTTP calls themselves.

### What Was Added

- **CLI entry point** (`src/cli.ts`): standalone TypeScript CLI runnable via `ts-node src/cli.ts` or compiled as `noteapi`.
- **CRUD subcommands**: `list`, `read`, `create`, `update`, `delete` — each mapping to the corresponding REST endpoint with appropriate flags.
- **Global flags**: `--url` (base URL override), `--help`/`-h` (usage), `--version`/`-v` (version string from package.json).
- **Help system**: global usage summary when no subcommand is given or `--help` is used; per-subcommand help when `<subcommand> --help` is used.
- **Input validation**: required flags checked before any HTTP call; empty/whitespace-only values rejected with a named error and exit code 1.
- **URL resolution**: `--url` flag > `NOTEAPI_URL` env var > `http://localhost:3000` default.
- **Error handling**: all errors (network, HTTP non-2xx, validation, unknown commands) produce a human-readable stderr message and exit code 1 — no stack traces.
- **Unit tests** (`tests/cli.test.ts`): Jest suite with mocked `fetch`; covers URL resolution, each subcommand, help/version output, validation rejection, and API-error surfacing.

### Items Carried Forward

- Config file / persistent settings (`gh-toy-24g`) — deferred.
- JSON output mode (`gh-toy-aqd`) — deferred.
- SIGINT / graceful interrupt handling (`gh-toy-69s`) — deferred.
