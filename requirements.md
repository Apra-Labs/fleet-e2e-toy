# Requirements: gh-toy-4ef — Add --version flag to CLI

## Source
GitHub issue: https://github.com/Apra-Labs/fleet-e2e-toy/issues/1
Repo: fleet-e2e-toy (Express/TypeScript NoteAPI service, entrypoint `src/index.ts`)

## Current state
`src/` contains an Express API (`app.ts`, `index.ts`, `api/notes.ts`, `models/note.ts`,
`utils/validation.ts`) with no CLI entrypoint and no version flag. `package.json` has a
`version` field that can be read at runtime.

## Requirement
Add a `--version` (or `-v`) flag that prints the current version string and exits with
code 0.

## Acceptance Criteria
- Running the tool with `--version` (or `-v`) prints something like
  `fleet-e2e-toy v1.0.0` (version sourced from `package.json`).
- Process exits with code 0 after printing the version.
- Works alongside other flags/args without conflict (checked before normal startup logic
  runs, e.g. before the HTTP server starts listening).
- Covered by a test (unit or integration) asserting the printed output and exit code.

## Scope
This issue only — do not implement other backlog items (help command, JSON output mode,
SIGINT handling, config file support, input validation) in this pass.
