# Requirements: gh-toy-4ef - Add --version flag to CLI

## Issue

The CLI tool should support a `--version` (or `-v`) flag that prints the current
version string and exits with code 0.

## Acceptance Criteria

- Running the entry point with `--version` (or `-v`) prints `fleet-e2e-toy v1.0.0`
  to stdout.
- Process exits with code 0 immediately after printing (no server started).
- The flag works alongside other flags/argv (i.e. the check happens before the
  normal server-startup path, and existing behavior with no flag is unchanged).

## Risk / riskiest assumption

The repo has no existing CLI argument parsing (`src/index.ts` only calls
`app.listen`). The riskiest assumption is where to hook flag detection so it
runs before `app.listen` in all invocation paths (`npm start`, `ts-node
src/index.ts`, `node dist/index.js`) without breaking `npm test` (which imports
`src/app.ts`, not `src/index.ts`, so app.ts must stay side-effect free).

## Context

- Repo: `noteapi` (fleet-e2e-toy), Express/TypeScript REST API.
- Entry point: `src/index.ts` -- currently just starts the HTTP server via
  `app.listen`.
- `src/app.ts` builds and exports the Express app; it is imported directly by
  the Jest/supertest test suite, so it must remain free of process-exit /
  argv-parsing side effects.
- `package.json` `"version"` is `"1.0.0"`.

## Design

No design.md needed -- this is a single, mechanical addition (argv check +
early exit) with one obvious implementation path, confined to `src/index.ts`.

## Implementation Notes

- Add a check in `src/index.ts`, before `app.listen`, for `--version` or `-v`
  in `process.argv`. On match: `console.log("fleet-e2e-toy v1.0.0")` then
  `process.exit(0)`.
- Do not touch `src/app.ts` -- keep the flag handling out of the importable
  app module so tests importing `app` are unaffected.
- Add a test that invokes the CLI (e.g. spawn `ts-node src/index.ts
  --version`) and asserts stdout `fleet-e2e-toy v1.0.0` and exit code 0.
