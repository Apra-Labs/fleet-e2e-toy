# fleet-e2e-toy — Implementation Plan

> Implement command-line interface (CLI) features for NoteAPI: add `tool` entry point, support `--version` / `-v` flags, implement `help` command and flags, and reject empty or blank strings.

---

## Tasks

### Phase 1: CLI Features and Input Validation

All tasks in this phase work on the same CLI command-line script and parsing logic. They are cohesive and build sequentially on top of the initial wrapper setup. Ordered monotonically from cheapest/most mechanical to standard complexity.

#### Task 1: Scaffold CLI entry point, update feature_list.json, and configure .gitattributes
- **Change:** Update the active `feature_list.json` to track the sprint's CLI features. Create `src/cli.ts` with a basic `main(argv: string[]): number` function that returns 0. Create a `tool` executable script at the repository root that calls `ts-node src/cli.ts` with arguments. Add basic unit test suite in `tests/cli.test.ts` to verify the execution of `main()`. Add `tool text eol=lf` to `.gitattributes` to force LF line endings on the root `tool` script and prevent interpreter errors.
- **Files:** `feature_list.json`, `.gitattributes`, `src/cli.ts` (new), `tool` (new), `tests/cli.test.ts` (new)
- **Model:** claude-haiku-4-5-20251001
- **Done when:** `npm test` runs and passes all tests (including the new stub CLI tests); `./tool` runs and exits with code 0; `feature_list.json` is updated with the CLI features list; `.gitattributes` contains `tool text eol=lf`.
- **Blockers:** Ensure `tool` is executable (`chmod +x tool`).

#### Task 2: Implement version flag support (gh-toy-4ef)
- **Change:** In `src/cli.ts`, parse input arguments. If `--version` or `-v` is passed, print `fleet-e2e-toy v1.0.0` to stdout and exit/return 0. Ensure version flag works alongside other flags (e.g. if it is present anywhere in argv or is the primary action). Add unit tests in `tests/cli.test.ts` verifying `-v` and `--version`.
- **Files:** `src/cli.ts`, `tests/cli.test.ts`
- **Model:** claude-haiku-4-5-20251001
- **Done when:** `npm test` passes; `./tool --version` and `./tool -v` print `fleet-e2e-toy v1.0.0` and exit with code 0.
- **Blockers:** None.

#### Task 3: Add input validation for empty or blank strings (gh-toy-v6z)
- **Change:** Add an input validation helper to `src/utils/validation.ts` to detect empty `""` or blank/whitespace-only arguments (e.g. `"   "`). In `src/cli.ts`, if any command-line argument matches this pattern, print a clear, user-friendly error message to stderr and return a non-zero exit code (e.g., 1). Add comprehensive unit tests in `tests/validation.test.ts` and `tests/cli.test.ts`.
- **Files:** `src/utils/validation.ts`, `src/cli.ts`, `tests/cli.test.ts`, `tests/validation.test.ts`
- **Model:** claude-sonnet-4-6
- **Done when:** `npm test` passes; `./tool ""` and `./tool "   "` print a clear error to stderr and exit with non-zero code.
- **Blockers:** Validation should run before processing subcommands or other options (except when version/help flags are present, so they are not blocked by blank positional arguments).

#### Task 4: Implement help command and flags (gh-toy-kbk)
- **Change:** Extend parsing in `src/cli.ts` to support `help` subcommand, and `--help` / `-h` flags. When invoked, print usage information including how to run the tool, descriptions of available subcommands and flags, and exit with code 0. Add unit tests verifying `help`, `--help`, and `-h`.
- **Files:** `src/cli.ts`, `tests/cli.test.ts`
- **Model:** claude-sonnet-4-6
- **Done when:** `npm test` passes; `./tool help`, `./tool --help`, and `./tool -h` print the usage details and exit with code 0.
- **Blockers:** None.

#### VERIFY: Phase 1
- Run `npm test` to verify all unit and integration tests pass.
- Run `npm run lint` to verify code format.
- Manually run `./tool --version`, `./tool -v`, `./tool help`, `./tool --help`, `./tool ""` to verify all exit codes and outputs.
- Report completion details.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Script execution permission | Medium | Explicitly run `chmod +x tool` during Task 1. |
| Strict TypeScript compile issues | Low | Verify ts-node resolves modules correctly. tsconfig.json is already configured with target/module resolutions. |
| Interference with existing server | Low | Keep CLI code in a separate file (`src/cli.ts`) so it does not interfere with the Express server running from `src/index.ts`. |
| CRLF line endings on root `tool` script | Medium | Add `tool text eol=lf` to `.gitattributes` in Task 1 to force LF line endings and prevent Unix shebang "bad interpreter" errors on Windows environments. |

## Phase Sizing Rules

**Phase boundaries by cohesion, not count.** A phase is a coherent unit of work that produces a reviewable, testable increment. Group tasks into a phase when they share a data model, code path, or design decision — splitting them would produce an incoherent intermediate state or require touching the same code twice. Place a VERIFY at the natural completion boundary of that unit, not at an arbitrary task count. Phases may have 4-5 tasks (a coherent subsystem) or just 1-2 (a genuinely isolated change).

**Monotonically non-decreasing tiers within a phase.** Within a phase, order tasks cheap → standard → premium. The PM resumes the same session across tasks in a phase — a premium task can build a large context that a cheap model cannot load. The PM may group consecutive same-tier tasks into a single dispatch streak; tier transitions trigger a new dispatch. If a dependency forces a higher-tier task before a lower-tier task within a phase, split the phase at that boundary rather than violating the ordering rule. Cross-phase tier order does not matter — each phase always starts a fresh session.

## Notes
- Each task should result in a single git commit.
- Base branch: main
- Implementation branch: pmlite-e2e/s8.2-1780634307720
