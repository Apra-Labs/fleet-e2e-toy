# fleet-e2e-toy — Implementation Plan

> Implement a CLI interface for the NoteAPI project, including versioning, help documentation, and robust input validation for command-line arguments.

---

## Tasks

### Phase 1: CLI Foundation

#### Task 1: Initialize CLI Entry Point
- **Change:** Create a basic `src/cli.ts` file that imports and uses `process.argv` to handle basic execution.
- **Files:** `src/cli.ts`
- **Tier:** cheap
- **Done when:** File exists and can be executed via `ts-node`.
- **Blockers:** None

#### Task 2: Create Tool Scripts
- **Change:** Create a `tool` (bash) script and `tool.cmd` (Windows command script) in the root of the project to provide a convenient interface for the CLI.
- **Files:** `tool`, `tool.cmd`
- **Tier:** cheap
- **Done when:** `./tool` can be executed from the shell.
- **Blockers:** Task 1

#### Task 3: Implement Version Flag
- **Change:** Add logic to `src/cli.ts` to detect `--version` and `-v` flags. Print `fleet-e2e-toy v1.0.0` and exit with code 0.
- **Files:** `src/cli.ts`
- **Tier:** cheap
- **Done when:** `./tool --version` prints `fleet-e2e-toy v1.0.0` and exits 0.
- **Blockers:** Task 2

#### VERIFY: CLI Foundation
- Run `./tool --version` and verify output is exactly `fleet-e2e-toy v1.0.0`.
- Run `./tool -v` and verify same output.
- Verify exit code is 0.
- Report test results and push to remote branch.

---

### Phase 2: Help Subcommand

#### Task 4: Implement Help System
- **Change:** Implement a `help` subcommand and `--help` / `-h` flags in `src/cli.ts`. The output must list all available commands (`help`) and flags (`--version`, `--help`).
- **Files:** `src/cli.ts`
- **Tier:** standard
- **Done when:** `./tool help`, `./tool --help`, and `./tool -h` all produce identical, descriptive output and exit 0.
- **Blockers:** Phase 1

#### VERIFY: Help Subcommand
- Compare output of `./tool help` and `./tool --help` — must be identical.
- Verify all documented features are listed.
- Verify exit code is 0.
- Report test results and push to remote branch.

---

### Phase 3: Validation & Quality

#### Task 5: Implement Argument Validation
- **Change:** Add logic to `src/cli.ts` to validate positional arguments. If an argument is an empty string (`""`) or only contains whitespace (`"   "`), print a user-friendly error to stderr and exit with code 1.
- **Files:** `src/cli.ts`
- **Tier:** standard
- **Done when:** `./tool ""` prints an error and exits non-zero.
- **Blockers:** Phase 2

#### Task 6: Add CLI Unit Tests
- **Change:** Create `tests/cli.test.ts` and add tests for versioning, help, and input validation using `child_process` to invoke the tool.
- **Files:** `tests/cli.test.ts`
- **Tier:** standard
- **Done when:** `npm test` passes with the new test suite.
- **Blockers:** Task 5

#### VERIFY: Validation & Quality
- Run `npm test` and ensure all 21 existing + new tests pass.
- Manually verify `./tool "  "` fails with descriptive error.
- Verify all requirements from requirements.md are met.
- Report test results and push to remote branch.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing CLI dependencies | Low | Use manual argv parsing to avoid adding new packages. |
| Windows/Linux script compatibility | Medium | Provide both bash and command wrappers for the tool. |
| Input validation too strict | Low | Only target empty/whitespace strings as requested. |

## Phase Sizing Rules
Phases are grouped by functional unit (Foundation, Documentation, Validation). Tiers are non-decreasing within each phase (cheap -> cheap -> cheap in Phase 1, standard in Phase 2, standard -> standard -> standard in Phase 3).

## Notes
- Each task results in one commit.
- VERIFY tasks are checkpoints.
- Base branch: main
- Implementation branch: e2e-s8.1-26289667647/sprint
