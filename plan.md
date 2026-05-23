# NoteAPI CLI — Implementation Plan

> Implement CLI capabilities including help command, version flag, and argument validation for empty/blank inputs.

---

## Tasks

### Phase 1: CLI Enhancements

#### Task 1: Add --version flag
- **Change:** Add logic at the start of `src/index.ts` to check if `process.argv` contains `--version` or `-v`. If so, print the version string `fleet-e2e-toy v1.0.0` and exit with code 0.
- **Files:** [MODIFY] [index.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/src/index.ts)
- **Tier:** standard
- **Done when:** Running the CLI with `--version` or `-v` outputs `fleet-e2e-toy v1.0.0` and exits 0.
- **Blockers:** None

#### Task 2: Implement a help command
- **Change:** Add logic in `src/index.ts` to check if `process.argv` contains `help`, `--help`, or `-h`. If so, print the usage instructions and exit with code 0.
- **Files:** [MODIFY] [index.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/src/index.ts)
- **Tier:** standard
- **Done when:** Running the CLI with `help`, `--help`, or `-h` outputs the usage manual and exits 0.
- **Blockers:** None

#### Task 3: Add input validation for empty or blank strings
- **Change:** Iterate through `process.argv.slice(2)`. If any argument is an empty or blank (whitespace-only) string, print a user-friendly error message to `console.error` and exit with a non-zero exit code (e.g., 1).
- **Files:** [MODIFY] [index.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/src/index.ts)
- **Tier:** standard
- **Done when:** Passing an empty or blank string to the CLI prints the validation error to stderr and exits with status 1.
- **Blockers:** None

#### Task 4: Add CLI test suite
- **Change:** Create a new test suite file `tests/cli.test.ts` to test CLI behavior (version flag, help flag, input validation) by spawning `ts-node src/index.ts` processes with various arguments and verifying their stdout, stderr, and exit codes.
- **Files:** [NEW] [cli.test.ts](file:///C:/Users/akhil/git/apra-fleet-e2e-doer/tests/cli.test.ts)
- **Tier:** standard
- **Done when:** Jest executes `tests/cli.test.ts` and all CLI tests pass.
- **Blockers:** None

#### VERIFY: CLI Enhancements
- Run full test suite: `npm test`
- Run lint checks: `npm run lint`
- Build the project: `npm run build`
- Confirm all Phase 1 changes work together
- Report: tests passing, any regressions, any issues found

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| In-flight process ports | low | Set the `PORT` environment variable to `0` or a random port during tests to avoid conflict with running servers. |
| OS paths and child process execution | med | Use absolute path to the local `ts-node` bin to ensure portability across different host environments. |
| Argument parsing order | low | Ensure validation check is run first before help/version checks so that invalid arguments are caught early. |

## Phase Sizing Rules

**Phase boundaries by cohesion, not count.** A phase is a coherent unit of work that produces a reviewable, testable increment. Group tasks into a phase when they share a data model, code path, or design decision — splitting them would produce an incoherent intermediate state or require touching the same code twice. Place a VERIFY at the natural completion boundary of that unit, not at an arbitrary task count. Phases may have 4-5 tasks (a coherent subsystem) or just 1-2 (a genuinely isolated change).

**Monotonically non-decreasing tiers within a phase.** Within a phase, order tasks cheap → standard → premium. The PM resumes the same session across tasks in a phase — a premium task can build a large context that a cheap model cannot load. The PM may group consecutive same-tier tasks into a single dispatch streak; tier transitions trigger a new dispatch. If a dependency forces a higher-tier task before a lower-tier task within a phase, split the phase at that boundary rather than violating the ordering rule. Cross-phase tier order does not matter — each phase always starts a fresh session.
```
cheap → cheap → standard → standard → premium → VERIFY  [VALID]
cheap → standard → cheap → VERIFY  [INVALID]  (downgrade within phase — split into two phases)
```

## Notes
- Each task should result in a git commit
- Verify tasks are checkpoints — stop and report after each one
- Base branch: main
- Implementation branch: e2e-s8.1-26318905155
