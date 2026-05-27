# fleet-e2e-toy — Implementation Plan

> Add a CLI tool (`./tool`) supporting `--version`, `--help`, and input validation for blank arguments. Three features, one new source file, zero new dependencies.

---

## Tasks

### Phase 1: CLI Tool

All three sprint requirements share the same new files (`src/cli.ts`, `tool`, `tests/cli.test.ts`). They are cohesive — each builds on the arg-parsing structure established in Task 1. Ordered cheap → cheap → cheap; the riskiest assumption (the tool can be invoked via `./tool` and tested via the exported `main()` function) is validated in Task 1.

#### Task 1: Create CLI entry point and implement `--version` / `-v` flag
- **Change:** Create `src/cli.ts` with an exported `main(argv: string[]): number` function. Recognize `--version` and `-v`; print `fleet-e2e-toy v<version>` (tool display name hardcoded as `fleet-e2e-toy`, version read from `package.json` via `resolveJsonModule`), return 0. Add a `tool` shell script at the repo root that invokes `./node_modules/.bin/ts-node src/cli.ts "$@"` so the binary is callable as `./tool`. Create `tests/cli.test.ts` with tests for both `--version` and `-v`.
- **Files:** `src/cli.ts` (new), `tool` (new), `tests/cli.test.ts` (new)
- **Tier:** cheap
- **Done when:** `npm test` passes including new version-flag tests; `./tool --version` prints `fleet-e2e-toy v1.0.0` and exits 0; existing API tests still pass.
- **Blockers:** `ts-node` is already in devDependencies and `resolveJsonModule` is already enabled in `tsconfig.json` — no new dependencies required. `tool` must be marked executable (`chmod +x tool`).

#### Task 2: Implement help subcommand and `--help` / `-h` flag
- **Change:** Extend `main()` in `src/cli.ts` to recognise `help` as a subcommand (first positional arg) and `--help`/`-h` as flags. Print a usage block listing all available commands (`help`) and all flags (`--version`/`-v`, `--help`/`-h`), return 0. Add tests for `['help']`, `['--help']`, and `['-h']` — each must produce non-empty output and return 0.
- **Files:** `src/cli.ts`, `tests/cli.test.ts`
- **Tier:** cheap
- **Done when:** `npm test` passes including new help tests; `./tool help`, `./tool --help`, and `./tool -h` each print usage covering every command and flag.
- **Blockers:** None.

#### Task 3: Add input validation for empty or blank string arguments
- **Change:** In `main()`, before dispatching, iterate over positional arguments (those not beginning with `-`). If any argument is an empty string or contains only whitespace, print a clear error message to stderr (`Error: argument cannot be empty or blank`) and return 1. Add unit tests: empty string `""` and whitespace-only `"   "` must each produce an error and non-zero return value.
- **Files:** `src/cli.ts`, `tests/cli.test.ts`
- **Tier:** cheap
- **Done when:** `npm test` passes including new validation tests; both `./tool ""` and `./tool "   "` print the error and exit non-zero.
- **Blockers:** None. Validation fires only on positional args so flags (`--version`, `-h`) are unaffected.

#### VERIFY: CLI Tool
- Run full test suite (`npm test`) — all suites (API, validation, CLI) must pass
- Confirm `./tool --version`, `./tool help`, `./tool --help`, `./tool ""` each behave as specified
- Report: tests passing, any regressions in existing API tests, any issues found

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| `tool` script lacks execute permission after commit | Med | `chmod +x tool` in Task 1; note in done criteria |
| `fleet-e2e-toy` display name diverges from `package.json` `name` field (`noteapi`) | Low | Hardcode display name as a constant in `src/cli.ts`; read only version from package.json |
| Existing API tests broken by new CLI file | Low | CLI lives in a new file; no shared state; `beforeEach` clears the note store |
| TypeScript strict-mode rejects `package.json` import | Low | `resolveJsonModule: true` and `skipLibCheck: true` already set in `tsconfig.json` |

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
- Implementation branch: e2e-s1.2-26527886489/cli-features
