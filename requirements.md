# Requirements: gh-toy-4ef -- Add --version flag to CLI

## Source
- Beads issue: `gh-toy-4ef` (External: gh-1), P1 feature, repo `fleet-e2e-toy`
- Labels: `e2e-testing`, `integ-canary`

## Description
The CLI tool (`src/index.ts`, entry point invoked via `npm start` / `ts-node src/index.ts`)
should support a `--version` (or `-v`) flag that prints the current version string and
exits with code 0.

## Acceptance Criteria
- Running the CLI with `--version` or `-v` prints `fleet-e2e-toy v1.0.0` (version sourced
  from `package.json` `version` field, currently `1.0.0`).
- Process exits with code 0 after printing the version.
- The flag works alongside other flags/behavior -- checking for `--version`/`-v` must
  happen before the app starts listening on a port, and must not interfere with normal
  server startup when the flag is absent.

## Scope
- Single-issue task: implement only this CLI flag. No other issues from the backlog are
  in scope for this sprint.
- Likely touches `src/index.ts` (entry point) and possibly a small new helper for reading
  the version from `package.json`.
- Add/extend tests under `tests/` to cover the new flag behavior.

## Design
No design.md needed -- single, obvious implementation path (parse argv before app.listen).