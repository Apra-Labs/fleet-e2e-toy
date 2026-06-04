# Implementation Plan - Sprint pmlite-e2e/s8.2-1780536838068

This sprint implements three CLI tasks:
1. **Implement a help command** (`gh-toy-kbk`)
2. **Add input validation for empty or blank strings** (`gh-toy-v6z`)
3. **Add --version flag to CLI** (`gh-toy-4ef`)

These tasks are cohesive and build on the same codebase, adding a CLI interface (`./tool` script invoking `src/cli.ts` via `ts-node`) and CLI tests (`tests/cli.test.ts`).

---

## Phase 1: CLI Tool Implementation

### Tasks

#### Task 0: Update feature list
- **Change:** Update `feature_list.json` at the start of implementation to match the 3 CLI features:
  1. `Create CLI wrapper and version flag` (`gh-toy-4ef`)
  2. `Implement help subcommand and flags` (`gh-toy-kbk`)
  3. `Add input validation for empty or blank string arguments` (`gh-toy-v6z`)
  with `passes` initially set to `false`.
- **Files:** `feature_list.json`
- **Model:** gemini-3.5-flash
- **Done when:** `feature_list.json` contains exactly the three CLI features, and `git status` shows the file modified.
- **Blockers:** None.

#### Task 1: Create CLI wrapper and version flag
- **Change:** Create a new shell script `./tool` in the root workspace of the project. Specify that `./tool` should invoke the local `ts-node` package (e.g. using `npx ts-node src/cli.ts "$@"`) to ensure portability in testing and CI environments. Add `chmod +x` executable permissions to it. Create `src/cli.ts` containing the initial CLI main entry point. Implement `--version` and `-v` flags that print `fleet-e2e-toy v1.0.0` and exit with code 0. Create `tests/cli.test.ts` to test CLI behaviors. The tests must execute `./tool` using Node's `child_process` (such as `execSync` or `spawnSync`) to verify executable permissions, stdout/stderr, and exit codes.
- **Files:** `src/cli.ts` (new), `tool` (new), `tests/cli.test.ts` (new)
- **Model:** gemini-3.5-flash
- **Done when:** `npm test` runs successfully, executing `./tool --version` via `execSync` outputs `fleet-e2e-toy v1.0.0` and exits with code 0.
- **Blockers:** Ensure `tool` is marked executable (`chmod +x tool`).

#### Task 2: Implement help subcommand and flags
- **Change:** Extend `main()` in `src/cli.ts` to support the `help` subcommand, as well as `--help` and `-h` flags. When matched, print usage information detailing all available subcommands and flags and exit with code 0. Add tests in `tests/cli.test.ts` that run `./tool help`, `./tool --help`, and `./tool -h` via `child_process` and verify stdout, stderr, and exit codes.
- **Files:** `src/cli.ts`, `tests/cli.test.ts`
- **Model:** gemini-3.5-pro
- **Done when:** `npm test` passes, `./tool help`, `./tool --help`, and `./tool -h` print the correct usage information and exit with code 0.
- **Blockers:** None.

#### Task 3: Add input validation for empty or blank string arguments
- **Change:** In the CLI arguments parsing logic within `src/cli.ts`, validate that all positional arguments (arguments that do not start with `-`) are not empty or blank (whitespace-only). Clarify that if help or version flags are present, they take precedence and the command should exit 0 immediately, bypassing the positional argument validation. If no help/version flags are present and any positional argument is empty or blank, print a user-friendly error message `Error: argument cannot be empty or blank` to stderr and exit with a non-zero code (e.g. 1). Add integration tests in `tests/cli.test.ts` that execute `./tool` via `child_process` to assert that empty strings `""` and whitespace-only strings `"   "` trigger the validation error and return a non-zero exit code, while ensuring `./tool --help ""` or `./tool --version ""` exit with code 0 and bypass validation.
- **Files:** `src/cli.ts`, `tests/cli.test.ts`
- **Model:** gemini-3.5-pro
- **Done when:** `npm test` passes, `./tool ""` and `./tool "   "` print the error message and exit with 1.
- **Blockers:** None.

#### VERIFY: CLI Tool
- Run full test suite (`npm test`) — all tests (API, validation, CLI) must pass.
- Confirm `./tool --version`, `./tool help`, `./tool --help`, and `./tool ""` each behave as specified when run directly in the shell.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| `tool` script lacks execute permission after commit | Medium | Explicitly run `chmod +x tool` during Task 1; note in done criteria. |
| Hardcoded version diverges from package.json | Low | Read the version dynamically from `package.json` or define it as a shared constant. |
| Positional arg validation blocks valid flags | Medium | Only validate non-flag positional arguments, and prioritize help/version flags to bypass validation and exit immediately. |
| Portability of `ts-node` globally | High | Use `npx ts-node` to invoke the local package in `./tool`. |

