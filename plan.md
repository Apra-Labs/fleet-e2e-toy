# fleet-e2e-toy CLI Features — Implementation Plan

> Add three CLI capabilities to the NoteAPI project: a --version flag, a help command, and input validation for empty/blank string arguments. All three features share the CLI entry point (src/cli.ts) and are delivered in one cohesive phase.

---

## Phase 0 — Exploration Findings

### What exists on main (verified)
- `src/app.ts`, `src/api/notes.ts`, `src/models/note.ts`, `src/utils/validation.ts` — REST API only, no CLI entry point
- `src/index.ts` — Express server start, not a CLI dispatcher
- `tests/notes.test.ts`, `tests/validation.test.ts` — Jest + supertest tests, no CLI tests
- `package.json` — version `"1.0.0"`, `ts-node` in devDependencies, no `bin` field
- No `./tool` wrapper script exists anywhere

### Assumptions verified
| Assumption | How verified | Result |
|------------|-------------|--------|
| No existing CLI entry point | `git ls-tree origin/main -r` — no src/cli.ts | Confirmed absent |
| ts-node available for CLI execution | package.json devDependencies includes ts-node | Confirmed present |
| Project version is "1.0.0" | package.json `"version": "1.0.0"` | Confirmed |
| Tests use Jest with no special CLI runner | jest.config.ts, existing test files | Confirmed Jest |
| No "bin" field in package.json | Read package.json | Confirmed absent |

### Unverified assumptions (risk register)
- Whether `./tool` wrapper script (Unix shebang) executes correctly on Windows CI — moved to risk register
- Whether reading version from package.json at runtime via `require` works with ts-node — moved to risk register

---

## Tasks

### Phase 1: CLI Entry Point and All Three Features

All three issues (--version, input validation, help) share `src/cli.ts`. Splitting them would require touching the same file multiple times and produce non-functional intermediate commits. They belong in one phase.

#### Task T1.1: Create CLI entry point and wrapper scripts
- **Change:** Create `fleet-e2e-toy/src/cli.ts` with argument parsing skeleton (process.argv). Create `fleet-e2e-toy/tool` (Unix shell wrapper invoking `ts-node src/cli.ts`) and `fleet-e2e-toy/tool.cmd` (Windows equivalent). Make wrapper scripts executable. Enforce LF line endings via `.gitattributes`.
- **Files:** `fleet-e2e-toy/src/cli.ts` (new), `fleet-e2e-toy/tool` (new), `fleet-e2e-toy/tool.cmd` (new)
- **Tier:** cheap
- **Done when:** `./tool` executes without error on Unix; `tool.cmd` executes on Windows; no flags yet — exit 0 with no output is acceptable
- **Blockers:** None — ts-node is present; no new dependencies required

#### Task T1.2: Implement --version / -v flag
- **Change:** In `fleet-e2e-toy/src/cli.ts`, detect `--version` or `-v` in argv, print `fleet-e2e-toy v1.0.0` (read from package.json at runtime to avoid drift), then `process.exit(0)`. Version check runs before any command dispatch so it works alongside other flags.
- **Files:** `fleet-e2e-toy/src/cli.ts`
- **Tier:** cheap
- **Done when:** `./tool --version` prints `fleet-e2e-toy v1.0.0` and exits 0; `./tool -v` does the same
- **Blockers:** `require('../package.json')` needs `resolveJsonModule: true` in tsconfig — check before implementing; if missing, add it or hardcode the version string

#### Task T1.3: Implement help subcommand and --help / -h flag
- **Change:** In `fleet-e2e-toy/src/cli.ts`, handle the `help` subcommand, `--help`, and `-h`. Print usage text listing all subcommands (`help`, `add`) and all flags (`--version / -v`, `--help / -h`). Exit code 0.
- **Files:** `fleet-e2e-toy/src/cli.ts`
- **Tier:** standard
- **Done when:** `./tool help`, `./tool --help`, and `./tool -h` all print usage text covering every flag and subcommand; exit code is 0 in all three cases
- **Blockers:** None

#### Task T1.4: Add input validation for empty/blank string arguments
- **Change:** Add `validateCliArg(value: string): { valid: boolean; error?: string }` to `fleet-e2e-toy/src/utils/validation.ts`. Add a minimal `add <title>` subcommand to `fleet-e2e-toy/src/cli.ts` that accepts a title argument and calls this helper — if empty or whitespace-only, print a user-friendly error to stderr and `process.exit(1)`. This gives the validator a real CLI caller so acceptance criteria can be tested end-to-end.
- **Files:** `fleet-e2e-toy/src/utils/validation.ts`, `fleet-e2e-toy/src/cli.ts`
- **Tier:** standard
- **Done when:** `./tool add ""` prints a user-friendly error and exits non-zero; `./tool add "   "` (whitespace-only) does the same; `./tool add "My Note"` proceeds without error
- **Blockers:** None — validation.ts already exists and can be extended without changing existing exports

#### Task T1.5: Add CLI unit tests
- **Change:** Create `fleet-e2e-toy/tests/cli.test.ts`. Use `child_process.spawnSync` to invoke the tool for end-to-end behavior tests. Cover: `--version` output and exit code 0, `-v` alias, `--help` / `-h` / `help` each exits 0 and includes expected strings, empty-string arg exits non-zero, whitespace-only arg exits non-zero, valid title arg exits 0.
- **Files:** `fleet-e2e-toy/tests/cli.test.ts` (new)
- **Tier:** standard
- **Done when:** `npm test` passes all new tests with zero failures; existing `notes.test.ts` and `validation.test.ts` still pass
- **Blockers:** Windows CI path for `./tool` differs — use platform-conditional invocation in test (invoke `tool.cmd` on win32, `./tool` on others)

#### VERIFY: Phase 1 — CLI Features
- Run `npm test` from `fleet-e2e-toy/` — all tests must pass (new CLI tests + existing notes and validation tests)
- Manually invoke `./tool --version`, `./tool --help`, `./tool add ""`, `./tool add "Valid Title"` and confirm output matches acceptance criteria
- Confirm exit codes: 0 for version/help, non-zero for invalid input
- Report: tests passing, any regressions, any issues found

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| `./tool` Unix wrapper doesn't run on Windows CI | med | Add `tool.cmd` Windows wrapper; tests use platform-conditional invocation (spawnSync with `tool.cmd` on win32) |
| `require('../package.json')` fails if `resolveJsonModule` not in tsconfig | med | Check tsconfig before implementing T1.2; add flag if missing or hardcode version string |
| Shell script CRLF line endings (created on Windows) | high | Run `sed -i 's/\r$//' tool` before committing; enforce via `.gitattributes text eol=lf` for wrapper scripts |
| Backward compat: existing REST API behavior | low | CLI is a new entry point (src/cli.ts); no existing API routes or exports are touched |
| Partial failure: --version works but help output is incomplete | low | T1.5 tests assert specific strings appear in help output — incomplete output causes test failure |

## Notes
- Each task results in one git commit
- VERIFY is a checkpoint — stop and report after completing Phase 1
- Base branch: `main`
- Implementation branch: `e2e-s1.1-26544203024-cli-features`
- Work directory: `fleet-e2e-toy/` subdirectory
