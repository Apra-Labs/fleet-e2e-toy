# CLI Features P1 -- Code Review (Phase 1)

**Reviewer:** pm-lite-reviewer
**Date:** 2026-06-03 16:26:27-04:00
**Verdict:** APPROVED

> Prior feedback.md history contained two plan-review commits (6b328ec CHANGES NEEDED, 1acafb2 APPROVED). Both addressed the planning phase; this is the first code review of implementation work. All five plan-review concerns (rootDir/JSON import, path typo, Windows CRLF, help-text format, spawnSync command resolution) appear correctly handled in the implementation below.

---

## Scope and Tree State

Working tree is clean (`git status --porcelain` empty). Branch `pmlite-e2e/s1.1-1780516662518` is 12 commits ahead of `main`. Phase 1 tasks T1.1, T1.2, T1.3, and T1.V are all marked completed in `progress.json`. Phase 2 tasks (T2.1–T2.V) are pending — out of scope for this review.

Files changed vs main (code only): `src/cli.ts` (new), `src/index.ts` (modified), `tests/cli.test.ts` (new). Sprint tracking artifacts changed: `plan.md`, `progress.json`, `requirements.md`, `feedback.md`. No unjustified files were introduced (no temp scratch, no harness config, no editor settings). File hygiene PASS.

Note on Windows display: `git ls-files | grep -i plan` returns only the lowercase `plan.md`. Windows shells render the same file as `PLAN.md` because the FS is case-insensitive; this is not a duplicate-file regression.

---

## Build, Lint, Test

- `npx tsc --noEmit` — PASS (no output, exit 0).
- `npm run lint` — PASS (eslint clean, exit 0).
- `npm test` — PASS. 3 suites, 34 tests, all green. Total runtime ~8.1s. Smoke tests via `spawnSync` complete in ~1.5s each, well under the 20000ms timeout.
- No remote CI run exists for this branch (the project's CI workflow triggers on `pull_request` and no PR is open). The local suite is the authoritative gate; it is green.

---

## Task T1.1 — `src/cli.ts` with `runCli`

PASS. `src/cli.ts` exports `runCli(argv: string[]): { handled: boolean; exitCode: number }` matching the plan signature exactly. The runtime `require("../package.json")` correctly bypasses the `rootDir: "./src"` constraint identified as the HIGH-severity risk in the plan; `tsc --noEmit` confirms no TS6059. The `eslint-disable-next-line @typescript-eslint/no-require-imports` annotation is the correct narrow suppression rather than a project-wide config change. Argv scanning is exactly as specified: `--help` / `-h` / positional `help` win first; `--version` / `-v` second; otherwise `handled: false`. Manual invocation produces the literal expected output:

```
noteapi v1.0.0
```

and the full help block matches the requirements format (em-dash, two-space indentation under headers, exactly the option and environment lines required).

## Task T1.2 — Wire `src/index.ts`

PASS. The modification is minimal and correct: import `runCli`, invoke before `app.listen`, exit if handled. `app.listen` is unreachable for `--help` / `--version` / `help` because `process.exit` short-circuits. The pre-existing `PORT = process.env.PORT ?? 3000` line is preserved.

## Task T1.3 — `tests/cli.test.ts`

PASS with one minor NOTE.

Coverage is strong:
- 7 unit tests cover all six argv shapes from the plan's done criteria plus the combined `--help --version` flag-priority case.
- 2 stdout-content tests use a `console.log` spy with proper `beforeEach`/`afterEach` mock lifecycle.
- 4 spawnSync smoke tests cover `--version`, `-v`, `--help`, `-h`, each asserting exit code 0 and content via `.toString().trim()` for equality and `.includes()` for tokens — exactly the Windows-CRLF mitigation the plan prescribed.
- `jest.setTimeout(20000)` is set at module scope, satisfying the plan's "no test relies on default 5s timeout" criterion.
- `TS_NODE` is platform-aware (`.cmd` on win32) and `shell: true` is used — both pragmatic Windows compatibility choices that pass on the local Windows box and remain compatible with Linux CI.

NOTE (non-blocking): The "no flag" unit test asserts only `handled === false` and omits an explicit `exitCode === 0` check. The plan's done criteria for T1.1 only required `handled === false` for this case, so this is technically compliant, but a one-line `expect(result.exitCode).toBe(0)` would make the contract symmetric with the other cases. Not a blocker.

NOTE (non-blocking): The flag-priority test asserts `handled: true` only and does not verify that the help message (rather than version) is what gets printed. The plan explicitly states "no assertion on which message" so this matches plan, but the priority guarantee is therefore untested at the behavioral level. Acceptable.

## Task T1.V — Verify Phase 1

PASS. `npm test` is green (34/34), `npm run lint` is clean, `tsc --noEmit` is clean. Manual `ts-node src/index.ts --version` prints `noteapi v1.0.0` and exits 0; `--help` prints the full usage block and exits 0; server still starts with no flags (existing notes/health tests in `tests/notes.test.ts` still pass, confirming no regression in the Express boot path).

---

## Test Quality

The 13 new tests in `tests/cli.test.ts` partition cleanly into unit (fast, in-process) and smoke (slow, real `ts-node` spawn) layers with no redundant overlap between them. Each acceptance criterion in `requirements.md` traces to a test:
- `noteapi v1.0.0` exact string — covered by stdout content test and 2 spawnSync tests.
- `--help` / `-h` print and exit 0 — covered by 2 spawnSync tests.
- Server not started on flag — implicit (spawnSync would hang past 20s otherwise; all four smoke tests finish in ~1.5s each, proving `process.exit` is reached).
- Help text includes tool name, `--help/-h`, `--version/-v`, `PORT` — covered by unit and smoke content checks.

Untested surface: there is no explicit test that `process.exit(0)` is called from `src/index.ts` upon `handled: true` (only inferred via spawnSync exit code). Deemed adequate because the spawnSync tests exercise the end-to-end path.

---

## Convention and Security Check

- `console.log` is used inside `src/cli.ts` only — the CLI is a legitimate stdout consumer, distinct from the API handler convention in `.claude/rules/api-conventions.md` which prohibits `console.log` in route handlers. No API handler was modified in this phase.
- No `any` types introduced (`pkg` is cast to a concrete `{ name: string; version: string }`).
- No new npm dependencies (matches requirement "no new npm dependencies").
- `require("../package.json")` reads a bundled, trusted file — no path injection or untrusted input.
- No secrets in code.
- Shell scripts: none added in Phase 1, so the CRLF / `.gitattributes` rule from the user's global instructions is not triggered. (`.gitattributes` already exists in the repo.)

---

## Progress.json Hygiene NOTE (non-blocking)

T1.2 records `"commit": "a64b02b2d0f2e9a1b8c7d6e5f4a3b2c1d0e9f8a7"` but the actual full SHA from `git rev-parse a64b02b` is `a64b02b84241e21e13db15b7c2f9fd9ba811d951`. The recorded value is a 7-char prefix match concatenated with fabricated tail characters — `git rev-parse` accepts it because of prefix matching, but `git cat-file -t` rejects the full string. T1.1 and T1.3 record valid full or short SHAs. Not a code defect, and not blocking — but the doer should either store consistent 7-char shorts (as T1.3 does) or true full SHAs (as T1.1 does), not synthesised hex. Worth correcting when Phase 2 progress is recorded.

---

## Regression Check

`tests/notes.test.ts` (13 tests) and `tests/validation.test.ts` (8 tests) — unchanged in this phase — all still pass. `src/utils/validation.ts` and `src/api/notes.ts` are untouched (Phase 2 work); current blank-string behaviour is the pre-sprint baseline. No regressions detected.

---

## Summary

Phase 1 is complete and approved. All three Phase 1 tasks meet their plan done criteria. The implementation correctly resolves the highest-risk plan finding (rootDir / `require` for `package.json`). Build, lint, and the entire test suite (34/34) are green on Windows. Two minor non-blocking observations are recorded (no-flag `exitCode` not asserted; T1.2 progress.json SHA tail fabricated) — neither warrants CHANGES NEEDED. Phase 2 (T2.1–T2.V) remains pending and is out of scope for this review.

Verdict: **APPROVED**.
