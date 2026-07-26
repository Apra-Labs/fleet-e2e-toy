# Requirements: --version flag (gh-toy-4ef)

## Goal
Add a `--version` (and `-v`) flag to the CLI entry point.

## Acceptance Criteria
- Running `./tool --version` (and `./tool -v`) prints `fleet-e2e-toy v1.0.0`.
- Exits with code 0.
- Works alongside other flags/args without breaking existing server startup behavior.

## Approach
- Add a `tool` executable wrapper script at the repo root that runs the TypeScript
  entry point (`src/index.ts`) via `ts-node`.
- In `src/index.ts`, check `process.argv` for `--version`/`-v` before starting the
  Express server. If present, print the version string and exit(0) instead of
  calling `app.listen`.
