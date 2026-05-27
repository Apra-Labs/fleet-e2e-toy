# fleet-e2e-toy — Implementation Plan

> Implement version flag, help subcommand/flags, and empty or blank string validation in the fleet-e2e-toy CLI tool.

---

## Tasks

### Phase 1: CLI Features

#### Task 1: Add CLI entry point and wrapper scripts
- **Change:** Create the CLI entry point `src/cli.ts` to parse process arguments. Create the shell wrapper `tool` (bash) and `tool.ps1` (powershell) in the root directory to run the CLI tool using `ts-node src/cli.ts`.
- **Files:** [NEW] [cli.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/src/cli.ts), [NEW] [tool](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/tool), [NEW] [tool.ps1](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/tool.ps1)
- **Tier:** cheap
- **Done when:** Wrapper scripts execute the CLI entry point, exit code matches the script's exit code, and no runtime errors occur.
- **Blockers:** None

#### Task 2: Implement version flag
- **Change:** In `src/cli.ts`, check if the first argument matches `--version` or `-v`. If so, print `fleet-e2e-toy v1.0.0` to stdout and exit with code 0.
- **Files:** [MODIFY] [cli.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/src/cli.ts)
- **Tier:** cheap
- **Done when:** Running `./tool --version` or `./tool -v` prints `fleet-e2e-toy v1.0.0` to stdout and exits with code 0.
- **Blockers:** Task 1

#### Task 3: Implement help subcommand and flags
- **Change:** In `src/cli.ts`, define a central helper function to print the CLI usage information covering all subcommands and flags. Handle the `help` subcommand, as well as `--help` and `-h` flags. Exit with code 0 after printing the help text.
- **Files:** [MODIFY] [cli.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/src/cli.ts)
- **Tier:** cheap
- **Done when:** `./tool help`, `./tool --help`, and `./tool -h` print the full usage text to stdout and exit with code 0.
- **Blockers:** Task 1, Task 2

#### Task 4: Add input validation for empty or blank strings
- **Change:** In `src/cli.ts`, validate that the first argument is not empty or whitespace-only. Also check if the command is `add`, and validate that the note title is not empty or whitespace-only. Print a user-friendly error message to stderr and exit with code 1.
- **Files:** [MODIFY] [cli.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/src/cli.ts)
- **Tier:** standard
- **Done when:** Running `./tool ""` or `./tool "   "` prints a user-friendly error to stderr and exits with a non-zero exit code.
- **Blockers:** Task 1

#### Task 5: Add CLI unit tests
- **Change:** Create `tests/cli.test.ts` to test the CLI features. Use Node's `child_process` execution to run the CLI tool (using `ts-node src/cli.ts`) with different arguments and verify stdout, stderr, and exit codes.
- **Files:** [NEW] [cli.test.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/tests/cli.test.ts)
- **Tier:** standard
- **Done when:** The CLI test suite is successfully executed via `npm test` and all tests pass.
- **Blockers:** Task 2, Task 3, Task 4

#### Task 7: Fix: Implement/stub add and serve commands
- **Change:** Stub `add` and `serve` commands in `src/cli.ts`. `add <title>` should print "Note added: <title>" to stdout and exit 0. `serve` should print "Starting server..." to stdout and exit 0. Also add these subcommands to printHelp output.
- **Files:** [MODIFY] [cli.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/src/cli.ts)
- **Tier:** standard
- **Done when:** `./tool add "hello"` prints "Note added: hello", `./tool serve` prints "Starting server...", both exit 0.
- **Blockers:** Task 1

#### Task 8: Fix: Validate note title for add command
- **Change:** Validate that the note title for `add` subcommand is not empty or whitespace-only. Print a user-friendly error to stderr and exit with non-zero exit code.
- **Files:** [MODIFY] [cli.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/src/cli.ts)
- **Tier:** standard
- **Done when:** Running `./tool add ""` or `./tool add "   "` prints a user-friendly error to stderr and exits with a non-zero exit code.
- **Blockers:** Task 7

#### Task 9: Fix: Add test coverage for add/serve commands and validation
- **Change:** Add unit tests to `tests/cli.test.ts` for verifying `add` and `serve` stubs, as well as validation on the note title.
- **Files:** [MODIFY] [cli.test.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/tests/cli.test.ts)
- **Tier:** standard
- **Done when:** Running `npm test` passes all tests.
- **Blockers:** Task 8

#### VERIFY: CLI Features
- Run full test suite (`npm test`)
- Confirm all Phase 1 changes work together
- Report: tests passing, any regressions, any issues found

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Path resolution or syntax errors on Windows vs Linux/macOS wrappers | Med | Provide both bash wrapper `tool` and powershell wrapper `tool.ps1` to cover both environments properly. |
| Interference with existing REST API | Low | Do not modify any code in `src/app.ts`, `src/index.ts` or the API router to maintain complete isolation. |
| External constraints (missing dependencies) | Low | Implement all CLI argument parsing natively without adding third-party libraries (e.g. commander, yargs). |
| Empty input validation bypasses | Low | Perform thorough trimming on inputs using `arg.trim().length === 0` to catch whitespace-only strings. |

## Phase Sizing Rules

**Phase boundaries by cohesion, not count.** A phase is a coherent unit of work that produces a reviewable, testable increment. Group tasks into a phase when they share a data model, code path, or design decision — splitting them would produce an incoherent intermediate state or require touching the same code twice. Place a VERIFY at the natural completion boundary of that unit, not at an arbitrary task count. Phases may have 4-5 tasks (a coherent subsystem) or just 1-2 (a genuinely isolated change).

**Monotonically non-decreasing tiers within a phase.** Within a phase, order tasks cheap → standard → premium. The PM resumes the same session across tasks in a phase — a premium task can build a large context that a cheap model cannot load. The PM may group consecutive same-tier tasks into a single dispatch streak; tier transitions trigger a new dispatch. If a dependency forces a higher-tier task before a lower-tier task within a phase, split the phase at that boundary rather than violating the ordering rule. Cross-phase tier order does not matter — each phase always starts a fresh session.
```
cheap → cheap → standard → standard → premium → VERIFY  [VALID]
```

## Notes
- Each task should result in a git commit
- Verify tasks are checkpoints — stop and report after each one
- Base branch: `main`
- Implementation branch: `e2e-s8.1-26525621742/sprint`
