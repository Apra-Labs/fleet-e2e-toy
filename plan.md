# fleet-e2e-toy — Implementation Plan

> Add basic CLI behaviors to fleet-e2e-toy including version flag, input validation, and a help system with stubs.

---

## Tasks

### Phase 1: CLI Interface

#### Task 1: Add --version / -v flag to CLI and create tool launcher scripts
- **Change:** Create `src/cli.ts` as the CLI entry point. Check process arguments for `--version` or `-v` flags. If found, print `fleet-e2e-toy v1.0.0` to stdout and exit with code 0. Create root launcher scripts `tool` (bash) and `tool.cmd` (batch/Windows command script) to execute `npx ts-node src/cli.ts` forwarding arguments.
- **Files:** `src/cli.ts`, `tool`, `tool.cmd`
- **Tier:** cheap
- **Done when:** Running `./tool --version` and `./tool -v` print `fleet-e2e-toy v1.0.0` to stdout and exit with code 0.
- **Blockers:** None

#### Task 2: Implement validation for empty or blank strings
- **Change:** In `src/cli.ts`, validate that none of the arguments passed to the tool are empty or contain only whitespace. If any argument is invalid, print a clear, user-friendly error message to stderr (e.g. `Error: Arguments cannot be empty or blank strings.`) and exit with a non-zero code (e.g. `1`).
- **Files:** `src/cli.ts`
- **Tier:** cheap
- **Done when:** Running `./tool ""` and `./tool "   "` print a clear error message to stderr and exit with a non-zero code.
- **Blockers:** None

#### Task 3: Implement help command and help flags
- **Change:** In `src/cli.ts`, handle the `help` subcommand and the `--help` and `-h` flags. When triggered, print CLI usage information listing available subcommands and flags to stdout, and exit with code 0. If an unknown command or flag is provided, print an error message to stderr (e.g., `Unknown command or flag: <arg>`) and exit with code 1.
- **Files:** `src/cli.ts`
- **Tier:** standard
- **Done when:** Running `./tool help`, `./tool --help`, and `./tool -h` print CLI usage information to stdout and exit with code 0.
- **Blockers:** None

#### Task 4: Add CLI unit tests
- **Change:** Create `tests/cli.test.ts` to programmatically run `npx ts-node src/cli.ts` (using `execSync`) and assert the output and exit status for `--version`, `-v`, `--help`, `-h`, `help`, empty/blank string inputs, and unknown commands.
- **Files:** `tests/cli.test.ts`
- **Tier:** standard
- **Done when:** `npm test` runs successfully, including the new `tests/cli.test.ts` suite, with all tests passing.
- **Blockers:** None

#### VERIFY: CLI Interface
- Run `npm run build` to verify compilation succeeds without TypeScript errors
- Run `npm test` to verify all tests (existing note/validation tests + new CLI tests) pass
- Run manual validation of version, help, validation, and exit codes
- Report: tests passing, any regressions, any issues found
- Push: `git push origin e2e-s8.1-26320347003/sprint`

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Launcher scripts (`tool` and `tool.cmd`) are not executable on target environment | med | Use cross-platform node runner (`npx ts-node`) in launcher scripts and test on both bash and cmd environments |
| Empty string arguments are stripped by shell before being processed | low | Use wrapper test executions in Jest to ensure exact arguments are passed and validated correctly |
| Adding CLI code breaks existing web API server | low | Keep CLI code completely separated in `src/cli.ts` and `tests/cli.test.ts` with no changes to the Express app or router |
| `process.exit()` during Jest tests exits the test process | high | Use `execSync` to run `src/cli.ts` in a separate process in Jest tests to isolate execution, avoiding `process.exit` in the main test process |

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
- Implementation branch: e2e-s8.1-26320347003/sprint
