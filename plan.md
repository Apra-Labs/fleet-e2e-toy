# fleet-e2e-toy - Implementation Plan

> This plan details the implementation of a Command Line Interface (CLI) wrapper for the `fleet-e2e-toy` project. The CLI will feature help command and flag options, robust validation for empty or whitespace-only inputs, and a version flag.

---

## Tasks

### Phase 1: CLI Foundation and Validation

#### Task 1: Create CLI Launcher Scripts
- **Change:** Create three launcher scripts (`tool`, `tool.ps1`, `tool.cmd`) in the root directory to run `src/cli.ts` via `ts-node`. The bash script `tool` will execute `npx ts-node src/cli.ts "$@"`, `tool.ps1` will run `..\node_modules\.bin\ts-node.cmd src/cli.ts $args`, and `tool.cmd` will run `npx ts-node src/cli.ts %*`.
- **Files:** [NEW] [tool](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/tool), [NEW] [tool.ps1](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/tool.ps1), [NEW] [tool.cmd](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/tool.cmd)
- **Tier:** cheap
- **Done when:** The files exist in the project root with the correct execution format and permissions.
- **Blockers:** File permissions and execution policies for PowerShell scripts on Windows environments.

#### Task 2: Implement CLI Entry Point and Logic
- **Change:** Create the CLI entry point `src/cli.ts`. Parse the command line arguments from `process.argv.slice(2)`. Support `--version` and `-v` flags that print `fleet-e2e-toy v1.0.0` and exit 0. Support `help` command, `--help` and `-h` flags that print command usage details and exit 0. Validate that the first argument and the argument for the `add` command are not empty or whitespace-only (e.g. `trim().length === 0`), rejecting with a user-friendly error and exiting with a non-zero exit code. Stub `add` and `serve` commands.
- **Files:** [NEW] [cli.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/src/cli.ts)
- **Tier:** standard
- **Done when:** `npm run build` compiles the TypeScript files successfully, and running the tool with `--version` and `help` commands outputs the correct version and usage details.
- **Blockers:** None.

#### Task 3: Add CLI Unit Tests
- **Change:** Add a Jest test suite `tests/cli.test.ts` to test CLI behavior. Test the `--version` and `-v` flag output. Test the `help` command, `--help` and `-h` flags. Test empty string or whitespace argument validation on the first argument and the `add` subcommand. Verify that `add <title>` logs `Note added: <title>` and `serve` logs `Starting server...`.
- **Files:** [NEW] [cli.test.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/tests/cli.test.ts)
- **Tier:** standard
- **Done when:** Running `npm test` runs all CLI test suites and they pass successfully.
- **Blockers:** Command line execution using `execSync` might have shell differences between Windows and Unix.

#### VERIFY: CLI Foundation and Validation
- Run full test suite using `npm test`
- Confirm all Phase 1 changes work together by manually testing version, help, validation, and commands using `./tool`
- Report: tests passing, any regressions, any issues found

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Script execution failure on Windows due to PowerShell execution policies or path issues | med | Provide fallback CMD (`tool.cmd`) and Bash (`tool`) launcher scripts and specify exact execution paths for tests. |
| Incomplete validation for whitespace-only strings (e.g. carriage returns or unicode spaces) | low | Use standard `String.prototype.trim()` to filter out all whitespace before performing length checks. |
| Executing CLI tests hangs if the process does not terminate | med | Ensure all execution paths in `src/cli.ts` call `process.exit(code)` explicitly. |

## Notes
- Each task should result in a git commit
- Verify tasks are checkpoints – stop and report after each one
- Base branch: main
- Implementation branch: e2e-s8.1-26319774000
