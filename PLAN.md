# Sprint s1 Plan: Add --version Flag to CLI

## Overview

Add `--version` / `-v` flag to `src/index.ts` that prints `noteapi v1.0.0` and exits 0 before starting the server. Add a unit test to validate the behavior.

## Phase 1: Implementation

### Task s1-t1
- **Title**: Add --version / -v flag to src/index.ts
- **Type**: work
- **Model**: haiku
- **Description**: Modify `src/index.ts` to parse `process.argv` for `--version` or `-v` before calling `app.listen()`. If the flag is found, print `noteapi v1.0.0` (read from `package.json` or hardcoded as a constant matching the version) and call `process.exit(0)`. The check must happen before any server startup logic. No new dependencies needed — use `process.argv.includes()`.

### Task s1-t2
- **Title**: Add unit test for --version flag
- **Type**: work
- **Model**: haiku
- **Description**: Add a test file `tests/version.test.ts` that tests the `--version` and `-v` flag behavior. Use Jest with child_process `spawnSync` to invoke `ts-node src/index.ts --version` and assert: (1) stdout contains `noteapi v1.0.0`, (2) exit code is 0. Also test the `-v` alias. Alternatively, if spawning is slow or fragile, mock `process.argv` and `process.exit` in Jest and import the relevant logic as an exported helper function from `src/index.ts`.

### Task s1-t3 (VERIFY)
- **Title**: Run tests and verify all pass
- **Type**: verify
- **Model**: haiku
- **Description**: Run `npm test` and confirm all tests pass, including the new version flag tests. Check that the existing notes and validation tests still pass. If any failures are found, investigate and fix before marking this task done.

## Phase Summary

| Task  | Title                                  | Type   | Model |
|-------|----------------------------------------|--------|-------|
| s1-t1 | Add --version / -v flag to src/index.ts | work  | haiku |
| s1-t2 | Add unit test for --version flag       | work   | haiku |
| s1-t3 | Run tests and verify all pass          | verify | haiku |
