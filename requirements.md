# Requirements: gh-toy-4ef -- Add --version flag to CLI

## Issue
- ID: `gh-toy-4ef`
- Repo: Apra-Labs/fleet-e2e-toy
- Type: feature, priority 1
- External ref: gh-1

## Description
The CLI tool should support a `--version` (or `-v`) flag that prints the
current version string and exits with code 0.

## Acceptance Criteria
- Running `./tool --version` prints `fleet-e2e-toy v1.0.0`
- Exit code is 0
- Works alongside other flags (i.e. adding this flag must not break existing
  behavior of the app entrypoint)
- `-v` shorthand behaves the same as `--version`

## Current State
- The repo currently has no CLI entrypoint -- `src/index.ts` only starts the
  Express app (`app.listen(...)`) and there is no `src/cli.ts`.
- `package.json` version is `1.0.0`, so the printed string should be
  `fleet-e2e-toy v1.0.0` (matches the acceptance text literally).
- No `bin` field or `tool` script wrapper exists yet.

## Suggested Approach
- Add a CLI entrypoint (e.g. `src/cli.ts`) that inspects `process.argv` for
  `--version`/`-v` before falling through to starting the Express app, so
  normal server startup (`src/index.ts`) is unaffected.
- Print exactly `fleet-e2e-toy v1.0.0` and call `process.exit(0)`.
- Add a test (e.g. `tests/cli.test.ts`) that spawns the CLI with `--version`
  and `-v` and asserts stdout and exit code.

## Out of Scope
- No other issues from the backlog are in scope for this sprint -- only
  `gh-toy-4ef`.
