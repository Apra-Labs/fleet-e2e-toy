# fleet-e2e-toy — Implementation Plan

Sprint: CLI features — Help, version reporting, and input validation

Issues:
- gh-toy-kbk: Implement a help command
- gh-toy-4ef: Add --version flag to CLI
- gh-toy-v6z: Add input validation for empty or blank strings

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| `process.exit()` terminates the Jest test process | High | Design `src/cli.ts` with a `runCli` method that returns `{ exitCode, output, isError }` or similar, or spy/mock `process.exit` and catch the thrown error. |
| Empty/blank arguments passed in shell are swallowed | Low | Jest unit tests will directly mock `process.argv` or call the core validation helpers to ensure correct handling of empty/whitespace arguments. |

---

## Tasks

### Phase 1: CLI Features

#### Task T1.1: Create validation logic for CLI string arguments
- **ID:** T1.1
- **Title:** Add CLI argument validation function
- **Description:** Implement `validateCliArg(value: string): { valid: boolean; error?: string }` in `src/utils/validation.ts` to check if a string is empty or whitespace-only. Add corresponding unit tests in `tests/validation.test.ts`.
- **Model:** Gemini 3.5 Flash
- **Type:** work
- **Files:** `src/utils/validation.ts`, `tests/validation.test.ts`
- **Done when:** `validateCliArg` correctly identifies empty `""` and blank `"   "` strings as invalid and returns `{ valid: false, error: "..." }`, while returning `{ valid: true }` for non-blank strings. Unit tests assert these outcomes and `npm test` runs cleanly.

#### Task T1.2: Implement version flag support in CLI
- **ID:** T1.2
- **Title:** Add CLI version flag support
- **Description:** Create `src/cli.ts` with version flag logic handling `--version` and `-v` to print the version string `fleet-e2e-toy v1.0.0` (reading version from package.json) and exit with code 0. Create `tests/cli.test.ts` and write tests for version printing.
- **Model:** Gemini 3.5 Flash
- **Type:** work
- **Files:** `src/cli.ts`, `tests/cli.test.ts`
- **Done when:** `runCli(["--version"])` and `runCli(["-v"])` print the version and exit 0. Unit tests verify the version output format `fleet-e2e-toy v1.0.0`.

#### Task T1.3: Implement help command and flags in CLI
- **ID:** T1.3
- **Title:** Add CLI help subcommand and flags
- **Description:** In `src/cli.ts`, detect `help` subcommand or `--help`/`-h` flags. When triggered, print detailed usage output listing all subcommands and flags and exit with code 0. Update `tests/cli.test.ts` to assert help output details.
- **Model:** Gemini 3.5 Flash
- **Type:** work
- **Files:** `src/cli.ts`, `tests/cli.test.ts`
- **Done when:** Help output is printed and exit code is 0 when help is requested. Help text contains all available flags and subcommands.

#### Task T1.4: Implement input validation in CLI and create wrapper scripts
- **ID:** T1.4
- **Title:** Add validation to CLI arguments and create shell wrappers
- **Description:** In `src/cli.ts`, check all incoming arguments and reject empty/blank inputs with a clear error message to stderr and a non-zero exit code (1). Create the `./tool` and `./tool.cmd` wrapper scripts in the repository root to allow executing the CLI directly via ts-node. Add unit tests for invalid inputs.
- **Model:** Gemini 3.5 Flash
- **Type:** work
- **Files:** `src/cli.ts`, `tests/cli.test.ts`, `tool`, `tool.cmd`
- **Done when:** Passing `""` or `"   "` to the CLI prints a user-friendly error message, exits with 1, and unit tests verify this behavior. `./tool` is executable and forwards arguments correctly.

#### Task T1.5: Verify Phase 1 CLI Implementation
- **ID:** T1.5
- **Title:** Phase 1 Verification
- **Description:** Build the TypeScript project, run the linter, and execute the full test suite. Perform smoke testing on the compiled output to verify that all flags (`--version`, `-v`, `--help`, `-h`, `help`) and validation rules function exactly as required.
- **Model:** Gemini 3.5 Pro
- **Type:** verify
- **Files:** None (compilation/testing verification)
- **Done when:** `npm run build` succeeds, `npm run lint` passes with no warnings, `npm test` runs with all tests green, and manual smoke tests verify all exit codes and stdout/stderr outputs match requirements.
