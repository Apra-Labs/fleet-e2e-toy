# NoteAPI CLI — Implementation Plan

> Implement a new CLI tool for the NoteAPI project with help command, version flag, and argument validation.

---

## Tasks

### Phase 1: CLI Foundation & Basic Flags

#### Task 1: Initialize CLI Foundation
- **Change:** Create src/cli.ts as the main entry point for the CLI. Create a tool executable shim (shell script) that runs the CLI via ts-node.
- **Files:** src/cli.ts, tool
- **Tier:** cheap
- **Done when:** ./tool executes without errors (even if it does nothing yet).
- **Blockers:** None.

#### Task 2: Implement --version flag (gh-toy-4ef)
- **Change:** Add logic to src/cli.ts to detect --version or -v flags. If present, print fleet-e2e-toy v1.0.0 and exit with code 0.
- **Files:** src/cli.ts
- **Tier:** cheap
- **Done when:** ./tool --version outputs fleet-e2e-toy v1.0.0 and exits with 0.
- **Blockers:** None.

#### Task 3: Implement help command and --help flag (gh-toy-kbk)
- **Change:** Add logic to handle help subcommand and --help / -h flags. Print usage information for all available commands and flags.
- **Files:** src/cli.ts
- **Tier:** standard
- **Done when:** ./tool help and ./tool --help print usage info and exit with 0.
- **Blockers:** None.

#### VERIFY: Phase 1
- Run ./tool --version
- Run ./tool --help
- Run ./tool help
- Confirm all exit with 0 and show correct output.

---

### Phase 2: Input Validation & Robustness

#### Task 4: Add input validation for blank strings (gh-toy-v6z)
- **Change:** Add a validation step for CLI arguments to ensure they are not empty or whitespace-only strings.
- **Files:** src/cli.ts
- **Tier:** standard
- **Done when:** Passing an empty string or whitespace-only string to an argument results in a user-friendly error message and a non-zero exit code.
- **Blockers:** None.

#### Task 5: Add CLI unit and integration tests
- **Change:** Create tests/cli.test.ts using Jest to test the CLI behavior (version, help, validation).
- **Files:** tests/cli.test.ts
- **Tier:** standard
- **Done when:** npm test runs and passes all CLI-related tests.
- **Blockers:** None.

#### VERIFY: Phase 2
- Run npm test
- Manually verify blank string rejection: ./tool some-arg ""
- Confirm non-zero exit code on validation failure.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Script execution permission | med | Ensure tool shim has execute permissions (chmod +x). |
| Windows/Unix compatibility | low | Use a cross-platform shim or handle both .sh and .ps1 if needed. |
| Input validation scope | low | Clearly define which arguments require non-empty strings. |

## Notes
- Each task should result in a git commit
- Verify tasks are checkpoints — stop and report after each one
- Base branch: main
- Implementation branch: e2e-s7.1-25981184634-cli-impl
