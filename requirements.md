# Requirements — Sprint s1.1-1780537199340

## Source Issues

Three P1 issues from beads backlog:

- **gh-toy-4ef** (P1 feature): Add `--version` / `-v` flag to CLI entry point
- **gh-toy-v6z** (P1 bug): Add `isBlankOrEmpty` input validation helper
- **gh-toy-kbk** (P1 feature): Implement a `help` command (`./tool help` / `--help` / `-h`)

## Repo Context

Node.js + Express + TypeScript NoteAPI. In-memory store. Jest + supertest.

Key files:
- `src/index.ts` — server entry point; CLI flag parsing goes here
- `src/utils/validation.ts` — validation helpers
- `tests/validation.test.ts` — unit tests for validation module
- `package.json` — version string lives here (`"version": "1.0.0"`)

Run: `npm test` (Jest). No build step needed for tests (ts-jest).

## Feature Requirements

### gh-toy-4ef — --version flag

`src/index.ts` must parse `process.argv.slice(2)` before starting the server.
If `--version` or `-v` is present, print `fleet-e2e-toy v1.0.0` to stdout and `process.exit(0)`.

Acceptance:
- `ts-node src/index.ts --version` prints `fleet-e2e-toy v1.0.0`, exit 0
- `-v` also works
- Server does NOT start when this flag is passed

### gh-toy-kbk — help command

`src/index.ts` must handle `help`, `--help`, or `-h` in `process.argv.slice(2)`.
Print a usage message listing all subcommands and flags, then `process.exit(0)`.

Acceptance:
- `ts-node src/index.ts help` prints usage, exit 0
- `--help` and `-h` also work
- Usage text lists every subcommand and flag (including --version and --help itself)
- Server does NOT start

### gh-toy-v6z — isBlankOrEmpty validation helper

Add `export function isBlankOrEmpty(s: string): boolean` to `src/utils/validation.ts`.
Returns `true` when the string is empty or whitespace-only (`s.trim().length === 0`).

Add unit tests in `tests/validation.test.ts`:
- Empty string → true
- Whitespace-only string → true
- Non-blank string → false
- Non-zero exit if args are blank (validated via the helper)

## Risk / Order

Lowest risk to highest:
1. `isBlankOrEmpty` (pure function, isolated to validation module) → T1
2. `--version` flag (2-line change to `src/index.ts`) → T2
3. `help` command (builds on same argv parsing as T2) → T3

No design doc needed — all changes follow existing patterns.
