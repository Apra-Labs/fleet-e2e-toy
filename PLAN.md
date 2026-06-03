# NoteAPI CLI — Implementation Plan

> Implement the CLI foundation and resolve the top 3 P1 issues from the backlog: --version flag (gh-toy-4ef), help command/flags (gh-toy-kbk), and blank string validation (gh-toy-v6z).

---

## Tasks

### Phase 1: CLI Launcher and Versioning

#### Task 1: Create launcher script and CLI entrypoint skeleton
- **Change:** Create the CLI launcher script `./tool` (and `tool.cmd` for Windows compatibility) in the root of the repository. Make `./tool` executable and delegate execution to `src/cli.ts` via `ts-node`. Create a basic `src/cli.ts` file.
- **Files:** `tool`, `tool.cmd`, `src/cli.ts`
- **Model:** gemini-2.5-flash
- **Done when:** `./tool` executes without errors and delegates to `src/cli.ts`.
- **Blockers:** None

#### Task 2: Implement --version and -v flag (gh-toy-4ef)
- **Change:** Parse arguments in `src/cli.ts` and handle `--version` and `-v` flags by printing `fleet-e2e-toy v1.0.0` and exiting with status code 0.
- **Files:** `src/cli.ts`
- **Model:** gemini-2.5-flash
- **Done when:** Running `./tool --version` or `./tool -v` prints `fleet-e2e-toy v1.0.0` and exits 0.
- **Blockers:** Task 1

#### VERIFY: CLI Launcher and Versioning
- Run `./tool --version` and verify the output is exactly `fleet-e2e-toy v1.0.0`.
- Verify the exit code is 0.

---

### Phase 2: Help Subcommand and Flags

#### Task 3: Implement help subcommand and --help / -h flags (gh-toy-kbk)
- **Change:** Configure CLI to support `help` subcommand, `--help`, and `-h` flags. Print usage details listing all available commands and flags (such as version, help, and default/serve commands) and exit 0.
- **Files:** `src/cli.ts`
- **Model:** gemini-2.5-pro
- **Done when:** Running `./tool help`, `./tool --help`, or `./tool -h` prints comprehensive usage details and exits 0.
- **Blockers:** Task 1, Task 2

#### VERIFY: Help System
- Run `./tool help` and check usage listing.
- Verify the exit code is 0.

---

### Phase 3: Input Validation and Unit Tests

#### Task 4: Add blank string validation (gh-toy-v6z)
- **Change:** Add check in `src/cli.ts` to validate positional arguments. If an argument is empty or whitespace-only, print a user-friendly error to stderr and exit with non-zero exit code.
- **Files:** `src/cli.ts`
- **Model:** gemini-2.5-pro
- **Done when:** Running `./tool ""` or `./tool "   "` prints a clear error message to stderr and exits with a non-zero exit code.
- **Blockers:** Task 1

#### Task 5: Implement CLI Unit Tests
- **Change:** Create `tests/cli.test.ts` to verify the CLI flags (`--version`, `-v`, --help, -h, help) and input validation for empty/blank strings using `child_process` execution.
- **Files:** `tests/cli.test.ts`
- **Model:** gemini-2.5-pro
- **Done when:** Running `npm test` runs and passes all tests successfully.
- **Blockers:** Task 2, Task 3, Task 4

#### VERIFY: Input Validation and Unit Tests
- Run `npm test` and ensure all tests pass.
- Verify all requirements from requirements.md are met.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Wrapper script fails to execute on Windows / non-Unix platforms | Medium | Provide both Unix `tool` and Windows `tool.cmd` wrappers. |
| process.argv indexing errors or ts-node runner dependencies | Medium | Parse using process.argv.slice(2) and use ts-node natively. |
| Whitespace-only check bypass (e.g., carriage returns) | Low | Use standard String.prototype.trim() to ensure all whitespace is stripped. |

## Notes
- Each task results in one git commit.
- VERIFY tasks are checkpoints.
- Base branch: main
- Implementation branch: pmlite-e2e/s8.2-1780516661220
