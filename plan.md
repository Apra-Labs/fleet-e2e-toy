# fleet-e2e-toy — Implementation Plan

> Implement 3 P1 issues in the NoteAPI TypeScript project: blank string input validation (gh-toy-v6z), --version flag (gh-toy-4ef), and help command/flag (gh-toy-kbk). All changes live in the CLI entry point and shared validation utilities.

---

## Tasks

### Phase 1: CLI Features & Input Validation

#### Task 1: Add CLAUDE.md to .gitignore
- **Change:** Append `CLAUDE.md` to `fleet-e2e-toy/.gitignore` so the agent context file is never accidentally committed
- **Files:** `.gitignore`
- **Tier:** cheap
- **Done when:** `git check-ignore CLAUDE.md` confirms CLAUDE.md is ignored
- **Blockers:** None

#### Task 2: Add blank string validation helper and unit test (gh-toy-v6z)
- **Change:** Add exported `isBlankOrEmpty(s: string): boolean` helper to `src/utils/validation.ts`. Add a `describe("isBlankOrEmpty")` block to `tests/validation.test.ts` covering: empty string, whitespace-only string, and valid non-blank string.
- **Files:** `src/utils/validation.ts`, `tests/validation.test.ts`
- **Tier:** cheap
- **Done when:** `npm test` passes including new blank-string validation tests; exit code 0
- **Blockers:** None

#### Task 3: Add --version flag to CLI entry point (gh-toy-4ef)
- **Change:** In `src/index.ts`, check `process.argv.slice(2)` for `--version` or `-v` before starting the Express server. When present, print `fleet-e2e-toy v1.0.0` to stdout and call `process.exit(0)`. Normal server start is unaffected.
- **Files:** `src/index.ts`
- **Tier:** standard
- **Done when:** `ts-node src/index.ts --version` prints `fleet-e2e-toy v1.0.0` and exits 0; `ts-node src/index.ts -v` does the same; `npm start` with no flags still starts the server normally
- **Blockers:** None

#### Task 4: Add help command and --help flag (gh-toy-kbk)
- **Change:** In `src/index.ts`, check `process.argv.slice(2)` for `help`, `--help`, or `-h` before starting the server. Print usage text listing all subcommands and flags (version, help, and default server start). Call `process.exit(0)`.
- **Files:** `src/index.ts`
- **Tier:** standard
- **Done when:** `ts-node src/index.ts --help`, `ts-node src/index.ts help`, and `ts-node src/index.ts -h` each print usage and exit 0; normal server start is unaffected
- **Blockers:** None

#### VERIFY: Phase 1
- Run full test suite: `npm test`
- Run linter: `npm run lint`
- Manually verify CLI flags with `ts-node src/index.ts --version`, `ts-node src/index.ts --help`, `ts-node src/index.ts help`
- Confirm all Phase 1 acceptance criteria are met
- Report: tests passing, any regressions, any issues found

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| `process.exit()` in src/index.ts interferes with Jest test environment | med | jest.config.ts already excludes src/index.ts from coverage and tests; CLI flags are not tested via Jest but verified manually with ts-node |
| Arg parsing conflicts with ts-node injected args or NODE_OPTIONS | med | Use `process.argv.slice(2)` (args after `node` and script path); do not inspect argv[0] or argv[1] |
| Blank string validation duplicates existing inline `title.trim().length === 0` checks | low | New helper is a standalone exported utility; does not remove or change existing inline validation |
| CLAUDE.md already in .gitignore | low | Read .gitignore before editing; only add if not present |

## Notes
- Each task results in a single git commit
- VERIFY is a checkpoint — stop and report after it completes
- Base branch: main
- Implementation branch: e2e-s1.3-26546133857/sprint
