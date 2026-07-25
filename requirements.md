# Requirements: gh-toy-4ef — Add --version flag to CLI

## Source
- Repo: https://github.com/Apra-Labs/fleet-e2e-toy
- Beads issue: `gh-toy-4ef` (External: gh-1), Type: feature, Priority: P1
- Owner: Azure Pipeline · Created: 2026-05-12

## Description
The CLI tool should support a `--version` (or `-v`) flag that prints the current
version string and exits with code 0.

## Acceptance Criteria
- Running `./tool --version` (i.e. the entry point at `src/index.ts`) prints
  `fleet-e2e-toy v1.0.0` to stdout.
- Process exits with code 0 immediately after printing — the server must NOT
  start listening when `--version`/`-v` is passed.
- Works alongside other flags (i.e. `--version`/`-v` is checked before any
  other startup logic and short-circuits it, without breaking normal startup
  when the flag is absent).

## Current State (as of investigation)
- Entry point is `src/index.ts`, which currently unconditionally imports
  `./app` and calls `app.listen(PORT, ...)` — there is no argv parsing today.
- `package.json` name is `noteapi`, version `1.0.0`. The printed version
  string per the acceptance criteria is the fixed literal `fleet-e2e-toy v1.0.0`
  (not necessarily read dynamically from package.json, since the product name
  differs from the package name) — implementer should decide whether to hardcode
  or derive it, as long as the printed output matches exactly.
- No existing CLI argument parsing dependency in `package.json`; a minimal
  `process.argv` check is sufficient and avoids adding a new dependency.

## Scope
- In scope: add `--version`/`-v` handling to the CLI entry point only.
- Out of scope: any other CLI flags, packaging as a standalone binary, or
  changes to the HTTP API.

## Suggested Test
- Add/extend a test that spawns or invokes the entry point with `--version`
  and `-v` and asserts stdout equals `fleet-e2e-toy v1.0.0` and exit code 0,
  and that the HTTP server is not started in that path.
