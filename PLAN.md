# fleet-e2e-toy — Implementation Plan

> Implement three sprint tickets (gh-toy-4ef, gh-toy-v6z, gh-toy-kbk): add `--version`/`-v` flag, fix whitespace-only input validation, and add `help`/`--help`/`-h` command to the CLI entry point.

---

## Phase 0: Explore — Findings

**What the codebase is today:**
- TypeScript/Express REST API (`noteapi`), entry point at `src/index.ts` (5 lines — starts server, no arg parsing)
- `src/utils/validation.ts` already rejects whitespace-only `title` (`trim().length === 0`) but does **not** check `content` for whitespace-only — that is the bug in gh-toy-v6z
- Tests import from `src/app`, never from `src/index` — CLI changes to `index.ts` cannot break the existing 29 tests
- `package.json` version is `1.0.0`; required output string is `fleet-e2e-toy v1.0.0`
- No `./tool` executable exists; acceptance criteria requires one

**Assumptions verified:**

| Assumption | Verified? | How |
|---|---|---|
| No CLI arg parsing in index.ts | ✓ | Read file — 5 lines, only `app.listen` |
| Tests don't import index.ts | ✓ | Both test files import `src/app` and `src/utils/validation` |
| Title whitespace-only already rejected | ✓ | `validation.ts` line: `obj.title.trim().length === 0` |
| Content whitespace-only NOT rejected | ✓ | Content only checks `typeof obj.content !== "string"` |
| package.json version matches target string | ✓ | `"version": "1.0.0"` |
| No `./tool` binary/script exists | ✓ | Glob — no file named `tool` in project root |

**Riskiest assumption:** Modifying `src/index.ts` is safe for tests — **verified safe** because tests import `src/app`, not `src/index`.

**Risk (unresolved):** `./tool` executable must be created for acceptance criteria to be testable as written. This is additive (new file), not a change to existing code.

---

## Tasks

### Phase 1: CLI Flags, Help Command, and Input Validation

All three tickets share the same sprint and are small enough to form one cohesive, reviewable increment. Each results in one commit.

#### Task 1: Add --version/-v flag and create `./tool` executable (gh-toy-4ef)
- **Change:** In `src/index.ts`, add `process.argv.slice(2)` check at the top: if `--version` or `-v` is present, `console.log('fleet-e2e-toy v1.0.0')` and `process.exit(0)` before starting the server. Create a `tool` shell script in the project root (`#!/usr/bin/env bash; exec ts-node "$(dirname "$0")/src/index.ts" "$@"`) and `chmod +x` it.
- **Files:** `src/index.ts`, `tool` (new)
- **Tier:** cheap
- **Done when:** `./tool --version` and `./tool -v` both print `fleet-e2e-toy v1.0.0` and exit 0; `npm test` still passes with no failures
- **Blockers:** None

#### Task 2: Add help/--help/-h command (gh-toy-kbk)
- **Change:** Extend the argv check in `src/index.ts` to detect `help`, `--help`, or `-h`; print a formatted usage block listing all subcommands (`help`) and all flags (`--version`/`-v`, `--help`/`-h`), then `process.exit(0)`.
- **Files:** `src/index.ts`
- **Tier:** standard
- **Done when:** `./tool help`, `./tool --help`, and `./tool -h` all print usage text that lists every subcommand and flag, and exit with code 0; `npm test` still passes
- **Blockers:** Depends on Task 1's `tool` script and argv scaffolding being in place

#### Task 3: Fix whitespace-only content validation + add unit tests (gh-toy-v6z)
- **Change:** In `src/utils/validation.ts` → `validateCreateInput`, change the `content` check from `typeof obj.content !== "string"` to also reject blank strings: add `|| obj.content.trim().length === 0` and update the error message to `"Content is required and must be a non-empty string"`. In `tests/validation.test.ts`, add two tests: one asserting `validateCreateInput({ title: "T", content: "   " })` returns `{ valid: false }` with `field: "content"`, and one asserting an empty string `""` is also rejected.
- **Files:** `src/utils/validation.ts`, `tests/validation.test.ts`
- **Tier:** standard
- **Done when:** Both new unit tests pass; existing 8 validation tests still pass; `npm test` exits 0
- **Blockers:** None — fully independent of Tasks 1 and 2

#### VERIFY: Phase 1
- Run `npm test` — all tests (existing 29 + 2 new) must pass
- Manually run: `./tool --version`, `./tool -v`, `./tool help`, `./tool --help`, `./tool -h`
- Confirm each prints expected output and exits 0
- Confirm `./tool` (no flags) still starts the server normally
- Report: tests passing count, CLI output observed, any regressions

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| `process.argv` in test environment interferes with CLI detection | low | Tests never import `src/index.ts`; argv check only runs in entry point |
| Making content non-whitespace-only is a breaking API change | low | Additive validation; only new POST requests are affected; existing stored notes unchanged |
| Version string `fleet-e2e-toy v1.0.0` drifts from `package.json` | low | Hardcode matches current `"version": "1.0.0"` and `"name": "noteapi"`; note in PR to keep in sync |
| `./tool` script not executable after commit | med | Add `tool` to `.gitattributes` as `eol=lf` and run `chmod +x` before first commit; verify with `git ls-files --stage tool` shows mode `100755` |
| Help text omits a flag added later | low | Help is co-located in `src/index.ts`; reviewer checklist item to keep it current |

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
- Implementation branch: e2e-s1.2-25990827273/cli-features
