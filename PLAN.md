# fleet-e2e-toy — Implementation Plan

> Add CLI entry point and support for --version and -v flags, printing version and exiting with code 0.

---

## Tasks

### Phase 1: CLI Version Flag

#### Task 1: Initialize CLI Entry Point and Create Tool Script
- **Change:** Create `src/cli.ts` with a basic scaffolding that imports and defines a main execution flow. Create a shell script named `tool` in the root of the repository that runs `node dist/cli.js "$@"`. Ensure `tool` is executable.
- **Files:** `src/cli.ts`, `tool`
- **Model:** cheap
- **Done when:** `src/cli.ts` exists, the `tool` script is present and executable, and running `npm run build` generates `dist/cli.js` without TypeScript compilation errors.
- **Blockers:** None

#### Task 2: Implement Version Flag Logic in CLI
- **Change:** Update `src/cli.ts` to parse arguments. If `--version` or `-v` is present in the arguments, print the version string `fleet-e2e-toy v1.0.0` to standard output and exit the process with code 0. Make sure the flag takes priority and works alongside other flags.
- **Files:** `src/cli.ts`
- **Model:** standard
- **Done when:** Running `./tool --version` and `./tool -v` print `fleet-e2e-toy v1.0.0` and exit with code 0.
- **Blockers:** Task 1

#### Task 3: Add CLI Version Flag Unit Tests
- **Change:** Create a new test file `tests/cli.test.ts` using Jest to verify that the CLI's argument parsing and runner correctly handle `--version` and `-v` flags, print the correct version string, and return an exit code of 0, including when other flags are present.
- **Files:** `tests/cli.test.ts`
- **Model:** standard
- **Done when:** Running `npm test` successfully executes the test suite and passes all tests.
- **Blockers:** Task 2

#### VERIFY: CLI Version Flag
- Run `npm run build` to verify compilation succeeds without TypeScript errors
- Run `npm test` to verify all tests (existing note/validation tests + new CLI tests) pass
- Run manual validation of version flags and exit codes
- Report: tests passing, any regressions, any issues found

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Launcher script (`tool`) is not executable on target environment | med | Set executable permissions using `chmod +x tool` during Task 1. |
| Version flag doesn't exit early when combined with other flags | low | Ensure argument parsing logic handles early-exit immediately upon detecting `--version` or `-v` flag before processing other flags or arguments. |
| CLI changes break the existing Express application | low | Keep the CLI entry point completely isolated in `src/cli.ts` and `tests/cli.test.ts` without modifying `src/index.ts` or `src/app.ts`. |
| Jest test runner hangs or fails due to direct `process.exit()` | high | Export a `run` function from `src/cli.ts` that returns the exit code, and call it inside the main block. Test `run` in Jest to avoid invoking `process.exit` in the test process. |

## Notes
- Each task should result in a git commit
- Verify tasks are checkpoints — stop and report after each one
- Base branch: main
- Implementation branch: e2e-s8.2-28207769589/sprint
