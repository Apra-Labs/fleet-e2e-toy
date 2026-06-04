# fleet-e2e-toy — Implementation Plan

> Implement version flag, help subcommand/flags, and empty or blank string validation in the fleet-e2e-toy CLI tool.

---

## Explore Phase Report

### Verified Assumptions:
1. **Compilation and Builds:** Tested that `npm run build` compiles typescript source files without errors.
2. **TypeScript execution:** Tested that `ts-node` executes successfully in the sandbox environment.
3. **CLI execution in Jest:** Verified that `node -r ts-node/register` functions correctly, allowing Jest to run typescript scripts out-of-the-box.
4. **Beads Status:** Confirmed via `bd ready` that the sprint has three P1 backlog items ready: version flag (`gh-toy-4ef`), help command (`gh-toy-kbk`), and empty string validation (`gh-toy-v6z`).

---

## Tasks

### Phase 1: CLI Features & Input Validation

#### Task 1: Create CLI Entry Point Skeleton and Launcher Scripts
- **Change:** Create the initial CLI entry point file `src/cli.ts`. Create the root shell wrapper `./tool` (bash script) to execute the CLI via `npx ts-node src/cli.ts "$@"`. Create the root powershell wrapper `tool.ps1` to execute the CLI via `..\node_modules\.bin\ts-node.cmd src/cli.ts $args` and exit with `$LASTEXITCODE`.
- **Files:** [NEW] [src/cli.ts](file:///tmp/pmlite-e2e-s8.2-uidT4K/repo-wt/default/src/cli.ts), [NEW] [tool](file:///tmp/pmlite-e2e-s8.2-uidT4K/repo-wt/default/tool), [NEW] [tool.ps1](file:///tmp/pmlite-e2e-s8.2-uidT4K/repo-wt/default/tool.ps1)
- **Tier:** cheap
- **Model:** Gemini 3.5 Flash (Low)
- **Done when:** Wrapper scripts execute the CLI entry point successfully and print nothing (exiting with code 0).
- **Blockers:** None

#### Task 2: Implement version flag
- **Change:** Parse command-line arguments in `src/cli.ts`. Check if `process.argv` contains `--version` or `-v`. If present, print exactly `fleet-e2e-toy v1.0.0` to stdout and exit with code 0.
- **Files:** [MODIFY] [src/cli.ts](file:///tmp/pmlite-e2e-s8.2-uidT4K/repo-wt/default/src/cli.ts)
- **Tier:** cheap
- **Model:** Gemini 3.5 Flash (Low)
- **Done when:** Running `./tool --version` or `./tool -v` prints exactly `fleet-e2e-toy v1.0.0` to stdout and exits with code 0.
- **Blockers:** Task 1

#### Task 3: Implement help subcommand and flags
- **Change:** In `src/cli.ts`, implement a central usage print helper. Handle the `help` subcommand, as well as `--help` and `-h` flags. Both invocation styles must output identical usage information covering all available commands (`add`, `serve`, `help`) and options (`--version` / `-v`, `--help` / `-h`), then exit with code 0.
- **Files:** [MODIFY] [src/cli.ts](file:///tmp/pmlite-e2e-s8.2-uidT4K/repo-wt/default/src/cli.ts)
- **Tier:** cheap
- **Model:** Gemini 3.5 Flash (Low)
- **Done when:** Running `./tool help`, `./tool --help`, or `./tool -h` outputs the identical usage information and exits with code 0.
- **Blockers:** Task 1, Task 2

#### Task 4: Add input validation for empty or blank strings
- **Change:** In `src/cli.ts`, add validation to verify that no argument passed to the CLI is empty (`""`) or whitespace-only (e.g. `"   "`). Specifically, check all command line arguments (e.g., in `process.argv.slice(2)`), and if any are blank, print a user-friendly error to stderr and exit with a non-zero code. Additionally, when using the `add` subcommand, validate that the title argument is present and is not blank/empty.
- **Files:** [MODIFY] [src/cli.ts](file:///tmp/pmlite-e2e-s8.2-uidT4K/repo-wt/default/src/cli.ts)
- **Tier:** standard
- **Model:** Gemini 3.1 Pro (High)
- **Done when:** Running `./tool ""` or `./tool "   "` or `./tool add ""` prints a descriptive error to stderr and exits with a non-zero exit code.
- **Blockers:** Task 1

#### Task 5: Add CLI unit tests
- **Change:** Create `tests/cli.test.ts` to verify CLI behavior. Use Node's `child_process.spawnSync` to execute the CLI tool under `node -r ts-node/register src/cli.ts` with various flags, checking exit codes, stdout, and stderr.
- **Files:** [NEW] [tests/cli.test.ts](file:///tmp/pmlite-e2e-s8.2-uidT4K/repo-wt/default/tests/cli.test.ts)
- **Tier:** standard
- **Model:** Gemini 3.1 Pro (High)
- **Done when:** Running `npm test` successfully executes all test cases (both existing and new CLI tests) and all tests pass.
- **Blockers:** Task 2, Task 3, Task 4

#### VERIFY: CLI Features & Input Validation
- Run full test suite: `npm test`
- Check linter: `npm run lint`
- Verify typescript compiles: `npm run build`
- Confirm worktree is completely clean: `git status --porcelain` is empty
- Report: tests passing, any regressions, any issues found

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Path resolution or execution failures on Windows vs Linux shell wrapper script | Med | Provide both bash wrapper `tool` and powershell wrapper `tool.ps1` with correct relative path configurations. |
| Interference with existing NoteAPI REST API | Low | Do not modify files in `src/app.ts`, `src/index.ts`, `src/api/notes.ts` or routes. Maintain complete CLI entrypoint isolation. |
| Input validation bypass via whitespace variation | Low | Perform thorough `.trim()` check on arguments inside `src/cli.ts` to detect all whitespace-only strings. |

## Phase Sizing Rules

**Phase boundaries by cohesion, not count.** A phase is a coherent unit of work that produces a reviewable, testable increment. Group tasks into a phase when they share a data model, code path, or design decision — splitting them would produce an incoherent intermediate state or require touching the same code twice. Place a VERIFY at the natural completion boundary of that unit, not at an arbitrary task count. Phases may have 4-5 tasks (a coherent subsystem) or just 1-2 (a genuinely isolated change).

**Monotonically non-decreasing tiers within a phase.** Within a phase, order tasks cheap → standard → premium. The PM resumes the same session across tasks in a phase — a premium task can build a large context that a cheap model cannot load. The PM may group consecutive same-tier tasks into a single dispatch streak; tier transitions trigger a new dispatch. If a dependency forces a higher-tier task before a lower-tier task within a phase, split the phase at that boundary rather than violating the ordering rule. Cross-phase tier order does not matter — each phase always starts a fresh session.
```
cheap → cheap → standard → standard → premium → VERIFY  [VALID]
```

## Notes
- Each task should result in a git commit.
- VERIFY is a checkpoint — stop and report after it completes.
- Base branch: main
- Implementation branch: pmlite-e2e/s8.2-1780546411229
