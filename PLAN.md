# PLAN

This plan outlines the design and step-by-step implementation for adding CLI features (version flag, help command, and input validation) to the NoteAPI project.

## Phase 1: CLI Setup and Wrapper Scripts

This phase sets up the CLI entry point file and the shell executable wrappers.

### T1.1: Create basic CLI entry point `src/cli.ts`
- **Type**: work
- **Model**: Gemini 3.5 Flash (Medium)
- **Description**: Create the entry point file `src/cli.ts` with basic setup. It should import any necessary packages, accept arguments, and print a basic initialization message.
- **Acceptance Criteria**:
  - `src/cli.ts` exists.
  - Running `npx ts-node src/cli.ts` executes successfully without compilation errors.

### T1.2: Create wrapper scripts `tool` and `tool.cmd`
- **Type**: work
- **Model**: Gemini 3.5 Flash (Medium)
- **Description**: Create the Unix shell executable wrapper `tool` and the Windows batch wrapper `tool.cmd` in the repository root. Ensure both wrappers execute `npx ts-node src/cli.ts` and forward all arguments. Set executable permissions on the `tool` script (`chmod +x tool`).
- **Acceptance Criteria**:
  - The `tool` script exists at the root, is executable (`chmod +x`), and forwards arguments correctly.
  - The `tool.cmd` batch file exists at the root and forwards arguments correctly.

### T1.3: Verify CLI wrappers and entry point
- **Type**: verify
- **Model**: Gemini 3.5 Pro (Strong)
- **Description**: Verify that the entry point and wrappers are successfully installed and runnable from the command line.
- **Acceptance Criteria**:
  - Running `./tool` runs the script via `ts-node` and exits successfully.

---

## Phase 2: Feature Implementation

This phase implements the three required CLI features.

### T2.1: Implement Version Flag (`gh-toy-4ef`)
- **Type**: work
- **Model**: Gemini 3.5 Pro (Strong)
- **Description**: Add support for `--version` and `-v` flags. When either flag is passed, print `fleet-e2e-toy v1.0.0` followed by a newline, and exit with code `0`. This must work alongside other flags (e.g. `./tool foo --version` prints the version and exits 0).
- **Acceptance Criteria**:
  - Running `./tool -v` outputs `fleet-e2e-toy v1.0.0` and exits with code `0`.
  - Running `./tool --version` outputs `fleet-e2e-toy v1.0.0` and exits with code `0`.
  - Version output takes precedence and works even when passed alongside other flags.

### T2.2: Implement Help Command (`gh-toy-kbk`)
- **Type**: work
- **Model**: Gemini 3.5 Pro (Strong)
- **Description**: Add support for the `help` subcommand, as well as the `--help` and `-h` flags. When invoked, print clean usage information detailing the CLI version and options to stdout, and exit with code `0`.
- **Acceptance Criteria**:
  - Running `./tool help` prints usage information and exits with code `0`.
  - Running `./tool --help` or `./tool -h` prints usage information and exits with code `0`.

### T2.3: Implement Input Validation (`gh-toy-v6z`)
- **Type**: work
- **Model**: Gemini 3.5 Pro (Strong)
- **Description**: Extend `src/cli.ts` to inspect all provided CLI arguments. If any argument is an empty string `""` or a whitespace-only string (e.g., `"   "`), the tool must print a clear, user-friendly error message to stderr (or stdout) and exit with a non-zero exit code.
- **Acceptance Criteria**:
  - Running `./tool ""` or `./tool "   "` or `./tool subcommand ""` exits with a non-zero exit code (e.g., `1`) and prints an error message like `Error: Empty or whitespace-only arguments are not allowed`.

### T2.4: Verify CLI features manually
- **Type**: verify
- **Model**: Gemini 3.5 Pro (Strong)
- **Description**: Manually verify all CLI functions (`-v`, `--version`, `help`, `--help`, `-h`, and invalid blank inputs) to make sure they match acceptance criteria.
- **Acceptance Criteria**:
  - All manual tests of `./tool` options output correct responses and exit with appropriate exit codes.

---

## Phase 3: Verification & Quality Gates

This phase adds automated tests and runs quality gates to verify code health.

### T3.1: Add automated tests in `tests/cli.test.ts`
- **Type**: work
- **Model**: Gemini 3.5 Pro (Strong)
- **Description**: Create unit/integration tests in `tests/cli.test.ts` using Jest. The tests should execute `./tool` (or `ts-node src/cli.ts`) via Node's `child_process` and assert the stdout, stderr, and exit codes for all requirements.
- **Acceptance Criteria**:
  - Automated tests cover version flag, help subcommand/flags, empty/blank argument validations, and combinations of flags.
  - All tests pass when running `npm test`.

### T3.2: Verify quality gates
- **Type**: verify
- **Model**: Gemini 3.5 Pro (Strong)
- **Description**: Run tests, type checking, and linting checks to ensure code quality.
- **Acceptance Criteria**:
  - `npm test` passes successfully.
  - `npm run lint` passes successfully.
  - `npm run build` (TypeScript compilation) passes successfully.
