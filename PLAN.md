# Implementation Plan - Sprint pmlite-e2e/s8.2-1780536838068

This sprint implements three CLI tasks:
1. **Implement a help command** (`gh-toy-kbk`)
2. **Add input validation for empty or blank strings** (`gh-toy-v6z`)
3. **Add --version flag to CLI** (`gh-toy-4ef`)

These tasks are cohesive and build on the same codebase, adding a CLI interface (`./tool` script invoking `src/cli.ts` via `ts-node`) and CLI tests (`tests/cli.test.ts`).

---

## Phase 1: CLI Tool Implementation

### Tasks

#### Task 1: Create CLI wrapper and version flag
- **Change:** Create a new shell script `./tool` in the root workspace of the project that runs `ts-node src/cli.ts "$@"`. Add `chmod +x` executable permissions to it. Create `src/cli.ts` containing the initial CLI main entry point. Implement `--version` and `-v` flags that print `fleet-e2e-toy v1.0.0` (with version read from `package.json` or hardcoded/read via `require` or standard file reader) and exit with code 0. Create `tests/cli.test.ts` to unit test the `--version` and `-v` flag behaviors.
- **Files:** `src/cli.ts` (new), `tool` (new), `tests/cli.test.ts` (new)
- **Model:** gemini-3.5-flash
- **Done when:** `npm test` runs successfully, `./tool --version` outputs `fleet-e2e-toy v1.0.0` and exits with code 0, and all existing API tests pass.
- **Blockers:** Ensure `tool` is marked executable (`chmod +x tool`).

#### Task 2: Implement help subcommand and flags
- **Change:** Extend `main()` in `src/cli.ts` to support the `help` subcommand, as well as `--help` and `-h` flags. When matched, print usage information detailing all available subcommands and flags and exit with code 0. Add tests in `tests/cli.test.ts` for `help`, `--help`, and `-h`.
- **Files:** `src/cli.ts`, `tests/cli.test.ts`
- **Model:** gemini-3.5-pro
- **Done when:** `npm test` passes, `./tool help`, `./tool --help`, and `./tool -h` print the correct usage information and exit with code 0.
- **Blockers:** None.

#### Task 3: Add input validation for empty or blank string arguments
- **Change:** In the CLI arguments parsing logic within `src/cli.ts`, validate that all positional arguments (arguments that do not start with `-`) are not empty or blank (whitespace-only). If an argument is empty or blank, print an error message `Error: argument cannot be empty or blank` to stderr and exit with a non-zero code (e.g. 1). Add unit tests in `tests/cli.test.ts` to assert that empty strings `""` and whitespace-only strings `"   "` trigger the validation error and return a non-zero exit code.
- **Files:** `src/cli.ts`, `tests/cli.test.ts`
- **Model:** gemini-3.5-pro
- **Done when:** `npm test` passes, `./tool ""` and `./tool "   "` print the error message and exit with 1.
- **Blockers:** None.

#### VERIFY: CLI Tool
- Run full test suite (`npm test`) — all tests (API, validation, CLI) must pass.
- Confirm `./tool --version`, `./tool help`, `./tool --help`, and `./tool ""` each behave as specified.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| `tool` script lacks execute permission after commit | Medium | Explicitly run `chmod +x tool` during Task 1; note in done criteria. |
| Hardcoded version diverges from package.json | Low | Read the version dynamically from `package.json` or define it as a shared constant. |
| Positional arg validation blocks valid flags | Medium | Only validate non-flag positional arguments (e.g. check arguments that do not start with `-`). |
