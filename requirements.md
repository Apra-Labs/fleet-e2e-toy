# Sprint s1 Requirements: Add --version flag to CLI

## Source Issues

- **gh-toy-4ef** (P1 open): Add --version flag to CLI
- **gh-toy-i5j** (P1 open, sprint meta-epic from prior run): sprint: CLI Implementation for P1 features

Note: Of the original 3 P1 backlog issues, gh-toy-kbk (help command) and gh-toy-v6z (input validation) have been CLOSED in a prior sprint. Only gh-toy-4ef remains as a concrete deliverable P1 feature.

## Deliverable

Implement a `--version` (and `-v`) flag for the NoteAPI CLI entry point that:

1. Prints the version string `noteapi v1.0.0` and exits with code 0
2. Works correctly alongside other existing flags
3. Is covered by at least one test

## Acceptance Criteria (from gh-toy-4ef)

- Running `node src/index.ts --version` (or `npm start -- --version`) prints the current version string and exits with code 0
- Running with `-v` as an alias also works
- Works alongside other flags (i.e., flag parsing handles --version before starting the server)
- Unit test added that validates the version output and exit code

## Project Context

- **Project**: NoteAPI — REST API for managing notes (Node.js + Express + TypeScript)
- **Entry point**: `src/index.ts` — currently starts Express server on port 3000
- **Version**: `1.0.0` (from `package.json`)
- **Test runner**: Jest with supertest
- **Commands**: `npm test`, `npm run build`, `npm run lint`
- **Code conventions**: See CLAUDE.md — validate inputs, no `any` types, use proper interfaces

## Risk Assessment

Low risk. This is a single-concern flag addition to the server entry point. The main risk is interference with the Express server startup logic. Must handle `--version` before calling `app.listen()`.

## Design Notes

No separate design document needed. The implementation path is clear:
1. Parse `process.argv` for `--version` or `-v` before starting the server
2. Print the version from `package.json` and call `process.exit(0)`
3. Add a test that spawns the process or mocks process.exit

Simple sprint — no PLAN.md/progress.json harness needed.
