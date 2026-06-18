# Changelog

## [Unreleased] — CLI features sprint (temp-requirements, 2026-06-17/18)

Final review: APPROVED (claude-opus-4-8, 2026-06-18). All 55 tests pass; build and lint clean; CI green on HEAD 331c2b0.

### Added

- **`--version` / `-v` flag (gh-toy-4ef)** — prints `fleet-e2e-toy v<version>` sourced from `package.json` and exits 0. `--version --json` prints `{"name":"fleet-e2e-toy","version":"<version>"}`. Takes precedence over any subcommand.

- **`--json` global flag (gh-toy-aqd)** — accepted on any subcommand. Success output is a single valid JSON document on stdout; errors emit `{"error":"<message>"}` on stdout with a non-zero exit code. Default (no `--json`) is human-readable text with errors on stderr.

- **SIGINT graceful shutdown (gh-toy-69s)** — Ctrl-C prints `Interrupted.` to stderr, runs best-effort cleanup of any files registered during the run, and exits with code 130. No stack trace.

- **`write` subcommand** — writes a fixed-payload file, registers it with the temp-file registry, and reports success in the active output mode (`Wrote <path>` text or `{"command":"write","path":"<path>","status":"ok"}` JSON). Missing filename is an error.

- **Temp-file registry** (`src/cli/tempfiles.ts`) — `register`, `cleanupAll` (best-effort, never throws), `list` (defensive copy).

- **Injectable SIGINT factory** (`src/cli/signals.ts`) — `createSigintHandler({cleanup, write, exit})` for unit-testable signal handling without real signals.

### Changed

- `package.json` — added `bin` entry (`fleet-e2e-toy`) and `cli` npm script.
- `jest.config.ts` — added coverage exclusion for `src/cli/index.ts` (process shim).

### Tests

8 suites / 55 tests total: `cli-parse` (12), `cli-run` (6), `cli-version` (4), `cli-json` (4), `cli-tempfiles` (4), `cli-signals` (4), `validation`, `notes`.
