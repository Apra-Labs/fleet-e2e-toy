# fleet-e2e-toy — Implementation Plan

> Implement CLI entry point and wrapper scripts, version flag (gh-toy-4ef), help subcommand and flags (gh-toy-kbk), and blank/empty string input validation (gh-toy-v6z) for NoteAPI CLI.

Sprint: pmlite-e2e/s8.3-1780540246079 (Epic: gh_toy-cuu)
Issues: gh-toy-kbk (help command), gh-toy-v6z (input validation), gh-toy-4ef (--version flag)

All CLI logic will be implemented in a new entry point `src/cli.ts` and triggered via a root-level wrapper script `tool`. This maintains clean separation from the existing Express REST API server in `src/index.ts` and `src/app.ts`.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Carriage returns (CRLF) in `tool` script break execution on Linux/macOS CI | High | Ensure `.gitattributes` enforces `eol=lf` for the `tool` file, and create the file with LF line endings. |
| process.exit() in CLI logic interferes with Express app server or test suites | Medium | Isolate CLI argument handling entirely inside `src/cli.ts`, keeping `src/index.ts` untouched. Test CLI behavior via sub-process execution rather than importing `cli.ts` directly into tests. |
| Permission issues running `./tool` | Medium | Explicitly set executable permissions (`chmod +x tool`) after creation, and commit this permission state to git. |

---

## Tasks

### Phase 1: CLI Features & Validation

#### Task 1.1: Create CLI entry point, wrapper scripts, and version flag (gh-toy-4ef)
- **Change:** Create a new CLI entry point `src/cli.ts` to parse argument options. Implement the version check: if the first argument is `--version` or `-v`, print `fleet-e2e-toy v1.0.0` to stdout and exit 0. Create a root-level shell script `tool` with execute permissions that runs the CLI via `npx ts-node src/cli.ts`.
- **Files:** `src/cli.ts`, `tool`
- **Model:** Gemini 3.5 Flash (Medium)
- **Done when:** Running `./tool --version` and `./tool -v` both output `fleet-e2e-toy v1.0.0` to stdout and exit with code 0.
- **Blockers:** None

#### Task 1.2: Implement help command and flags (gh-toy-kbk)
- **Change:** Extend `src/cli.ts` to handle the `help` subcommand, `--help`, and `-h` flags. Define a central usage block listing all commands and options. When invoked, print the usage info to stdout and exit with code 0.
- **Files:** `src/cli.ts`
- **Model:** Gemini 3.5 Pro (Strong)
- **Done when:** Running `./tool help`, `./tool --help`, and `./tool -h` all print the exact same usage information to stdout and exit with code 0.
- **Blockers:** Task 1.1

#### Task 1.3: Add input validation for empty or blank strings (gh-toy-v6z)
- **Change:** In `src/cli.ts`, add checks to reject empty strings (`""`) or whitespace-only strings (`"   "`) passed as CLI arguments. If validation fails, print a user-friendly error message to stderr and exit with a non-zero exit code (e.g., 1).
- **Files:** `src/cli.ts`
- **Model:** Gemini 3.5 Pro (Strong)
- **Done when:** Running `./tool ""` or `./tool "   "` prints a user-friendly error message to stderr and exits with a non-zero exit code.
- **Blockers:** Task 1.1

#### Task 1.4: Add CLI unit and integration tests
- **Change:** Create a new test suite `tests/cli.test.ts` to test the CLI commands. Use Node's `child_process` to spawn `./tool` (or execute `ts-node src/cli.ts`) with various argument configurations. Verify stdout, stderr, and exit codes for version flag, help subcommand/flags, and input validation failures.
- **Files:** `tests/cli.test.ts`
- **Model:** Gemini 3.5 Pro (Strong)
- **Done when:** `npm test` runs successfully, passing all existing tests and the new CLI-specific test suite.
- **Blockers:** Task 1.2, Task 1.3

#### VERIFY: CLI Features & Validation
- **Type:** verify
- **Steps:**
  1. Build the TypeScript codebase with `npm run build` to verify there are no compilation errors.
  2. Run the linter with `npm run lint` to verify compliance with code standards.
  3. Run the full test suite with `npm test` and verify that all CLI and API tests pass.
  4. Manually verify version outputs: `./tool --version` and `./tool -v` print `fleet-e2e-toy v1.0.0` and exit 0.
  5. Manually verify help outputs: `./tool help`, `./tool --help`, `./tool -h` print usage and exit 0.
  6. Manually verify empty/blank inputs: `./tool ""` and `./tool "   "` print errors and exit with a non-zero code.
- **Done when:** All validation and testing steps succeed without errors or regressions.

---

## Phase Sizing Rules
Phases are grouped by functional unit. Tasks within a phase must be ordered with non-decreasing model/tier complexity. Tasks 1.1 is assigned to a medium model (cheap task), while Tasks 1.2, 1.3, and 1.4 are assigned to a strong model (standard/premium tasks), satisfying monotonicity.

## Notes
- Each task results in one git commit.
- VERIFY tasks are checkpoints — stop and report after reaching one.
- Base branch: main
- Implementation branch: pmlite-e2e/s8.3-1780540246079
