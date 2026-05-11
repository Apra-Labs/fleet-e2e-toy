# fleet-e2e-toy — Implementation Plan

> Add CLI arg parsing layer to NoteAPI: --version flag (Issue 1), empty/blank string input validation (Issue 2), and help/--help command (Issue 3). All three features share the same argv processing code path and are implemented in one cohesive phase.

---

## Tasks

### Phase 1: CLI Arg Parsing

All three requirements extend the CLI entry point (`src/index.ts`) with argument handling. They share `src/cli.ts` (new module) and `src/utils/validation.ts`, making them a single cohesive unit. Tier order: cheap → standard → standard.

#### Task 1: Add CLI entry point with --version flag
- **Change:** Create `src/cli.ts` to parse `process.argv` before the server starts. Handle `--version`: read `version` from `package.json` at runtime, print `fleet-e2e-toy v<version>`, and call `process.exit(0)`. Update `src/index.ts` to call `handleCliArgs()` before `app.listen`. Add `tests/cli.test.ts` that mocks `process.argv` and `process.exit` to verify --version output and exit code.
- **Files:** `src/cli.ts` (new), `src/index.ts`, `tests/cli.test.ts` (new)
- **Tier:** cheap
- **Done when:** (1) `--version` prints a string matching `vx.y.z` where x.y.z matches `package.json`; (2) exit code is 0; (3) no other output produced; (4) existing server startup is unaffected when no CLI flags are passed.
- **Blockers:** None. `package.json` version (1.0.0) is stable.

#### Task 2: Add help/--help command
- **Change:** In `src/cli.ts`, handle `help` subcommand and `--help` flag. Print usage text listing the tool description, all supported commands (`help`), and all flags (`--version`, `--help`). Call `process.exit(0)`. Keep help text in a single definition so it stays DRY when new commands are added. Update `tests/cli.test.ts` with tests for both `help` and `--help`.
- **Files:** `src/cli.ts`, `tests/cli.test.ts`
- **Tier:** standard
- **Done when:** (1) Both `help` and `--help` produce usage output; (2) output lists all supported commands and flags with short descriptions; (3) exit code is 0; (4) no unrelated side effects.
- **Blockers:** Task 1 must be complete (cli.ts scaffold exists).

#### Task 3: Add input validation for empty/blank string args
- **Change:** Add `validateStringArg(value: string): { valid: boolean; error?: string }` to `src/utils/validation.ts`. Returns invalid for empty strings and whitespace-only strings (after `.trim()`). In `src/cli.ts`, call this validator on any positional string argument before processing; print a human-readable error message to stderr and call `process.exit(1)` on failure. Update `tests/cli.test.ts` to cover empty string, whitespace-only string, and valid non-blank input cases.
- **Files:** `src/utils/validation.ts`, `src/cli.ts`, `tests/cli.test.ts`
- **Tier:** standard
- **Done when:** (1) Passing an empty string argument prints an error message indicating invalid input; (2) passing a whitespace-only string produces the same error; (3) process exits with non-zero code in both cases; (4) valid non-blank input proceeds normally.
- **Blockers:** Task 1 must be complete (cli.ts scaffold exists).

#### VERIFY: Phase 1 — CLI Arg Parsing
- Run `npm run build` — must compile without errors
- Run `npm test` — all existing tests plus new CLI tests must pass
- Confirm: `--version` prints version and exits 0; `help` and `--help` print usage and exit 0; empty/blank args print error and exit non-zero; server starts normally with no args
- Report: test results, any regressions, any issues found
- Push to `origin/e2e-s1-25703603927/implement`

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| `process.exit()` in CLI module terminates Jest process during tests | High | Mock `process.exit` via `jest.spyOn(process, 'exit')` before importing CLI logic; wrap exit call so tests can intercept it |
| Reading `package.json` at runtime fails after `tsc` build (file not in `dist/`) | Med | Use `require('../../package.json')` with a relative path that resolves correctly from `dist/`; verify with `npm run build` as part of VERIFY |
| Backward compat: CLI arg interception breaks existing server-start behavior | Med | Only intercept known flags (`--version`, `--help`, `help`); unknown/no args fall through to normal `app.listen` path |
| Whitespace-only string validation: trimming behavior differs between platforms | Low | Use `.trim().length === 0` — consistent across Node.js environments |

## Notes
- Each task should result in a git commit
- Verify tasks are checkpoints — stop and report after each one
- Base branch: main
- Implementation branch: e2e-s1-25703603927/implement
