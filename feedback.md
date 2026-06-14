# pmlite-e2e-s1 -- Code Review (Phase 1)

**Reviewer:** pm-reviewer
**Date:** 2026-06-14 16:00:00+00:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.
> Prior commits on feedback.md were plan reviews (commits 34f021f -> CHANGES NEEDED,
> aba78fe -> APPROVED). Both plan-review blockers were addressed in PLAN.md before
> implementation began; this review is the first code review on the implementation.

---

## Quality gate execution

PASS. Working tree clean before running gates (`git status --porcelain` empty).
- `npm run build`: exit 0; `dist/cli.js` present.
- `npm run lint`: exit 0; no errors.
- `npm test`: exit 0; 34/34 tests pass across `tests/validation.test.ts` (12),
  `tests/cli.test.ts` (9), and `tests/notes.test.ts` (13). The `pretest` hook
  rebuilt `dist/` automatically. No skipped tests.
- No CI is configured for this repo (`.github/workflows/` is empty), so the
  local suite is the authoritative gate; nothing red on the remote either.

## File hygiene

PASS. `git diff --name-only main...HEAD` shows nine files, all justified against
sprint scope: `PLAN.md`, `progress.json`, `requirements.md`, `feedback.md`
(sprint tracking); `src/cli.ts`, `src/utils/validation.ts`, `package.json`,
`tests/cli.test.ts`, `tests/validation.test.ts` (source/tests required by
acceptance criteria). No temp files, no tool/harness config, no scratch
artifacts.

## Feature 1 -- `--version` / `-v` (gh-toy-4ef)

PASS. `src/cli.ts:18-21` matches D5 exactly: hardcoded `"fleet-e2e-toy v1.0.0"`
printed via `console.log` (stdout, trailing newline), exit code 0. `-v` shares
the same branch via `argv.includes("-v")`. Per-feature tests:
`tests/cli.test.ts:11-21` assert the exact stdout string `"fleet-e2e-toy
v1.0.0\n"` and `r.status === 0` for both forms. Precedence (flag wins over any
other flag) is covered at `tests/cli.test.ts:56-61` with `["--version",
"--help"]` -> version string, no `Usage:` substring, exit 0. Matches
requirements.md section 1 in full.

## Feature 2 -- Input validation (gh-toy-v6z)

PASS. `validateNonBlank` is appended to `src/utils/validation.ts:80-84` with
the exact D2 signature `(value: string, argName: string): void`, the exact
invalid-input predicate `typeof value !== "string" || value.trim().length ===
0`, and the exact error message shape `Error: <argName> must not be empty or
blank`. The CLI calls it at `src/cli.ts:32` over the positionals filter
(`argv.filter((a) => !a.startsWith("-"))`), catches at top level, writes
`err.message` to stderr via `process.stderr.write(msg + "\n")`, and returns
`1`. The `String(err)` arm is preserved per R4 guidance. Unit tests at
`tests/validation.test.ts:68-110` cover all four required cases (non-blank
passes, `""` throws, `"   "` throws, non-string-via-cast throws), each
asserting both `must not be empty or blank` and the `argName` interpolation.
End-to-end tests at `tests/cli.test.ts:64-75` use the portable
`spawnSync(process.execPath, [CLI, ""], { encoding: "utf8" })` form per the
T1.4 portability note. Matches requirements.md section 2 in full.

## Feature 3 -- Help command (gh-toy-kbk)

PASS. `HELP_TEXT` at `src/cli.ts:5-14` matches D4 verbatim and documents every
required surface: `help` subcommand, `--version`/`-v`, `--help`/`-h`. All three
trigger forms (`help` positional, `--help`, `-h`) print it to stdout and exit 0
via `src/cli.ts:22-25`. Tests at `tests/cli.test.ts:29-53` cover all three
forms and assert `stdout` contains `Usage:`, `--version`, and `--help` for
each. The no-arg-fallback-to-help branch (D3.4) is implicitly exercised by the
T1.1 smoke test (`non-version invocation exits 0`). Matches requirements.md
section 3 in full.

## CLI precedence order (D3)

PASS. `src/cli.ts:16-40` implements the exact four-step precedence:
1. `--version`/`-v` (lines 18-21) -> stdout, exit 0.
2. `help`/`--help`/`-h` (lines 22-25) -> stdout, exit 0.
3. Positional validation (lines 26-37): filters non-flag args, validates each,
   stderr+exit 1 on first failure.
4. No-positionals fallback to help (lines 27-30) and successful no-op for valid
   positionals (line 39).
No reordering, no early returns out of place. The order matches PLAN.md D3 step
for step.

## Test coverage and quality

PASS. Coverage maps cleanly to acceptance criteria with no redundant cases:
the CLI suite has nine tests across four describe blocks (smoke version, help,
precedence, validation), and the validation suite adds four `validateNonBlank`
cases on top of the eight pre-existing ones. No overlapping/redundant tests;
no exposed surface (positive/negative paths for each feature, plus the
precedence interaction) goes untested. The integration tests spawn the actual
compiled `dist/cli.js` rather than mocking, which is the right level for
binary-acceptance criteria. NOTE: the negative `catch (err)` arm using
`String(err)` is preserved per R4 but is not directly exercised (it would
require a non-Error throw, which `validateNonBlank` never produces).
Acceptable for this sprint -- the arm exists to satisfy ESLint, and the
requirements do not cover non-Error rejections. No action.

## Regressions in earlier work

PASS. `tests/notes.test.ts` (13 cases) and the pre-existing
`tests/validation.test.ts` blocks (8 cases for `validateCreateInput` and
`validateUpdateInput`) still pass unchanged. `src/utils/validation.ts` was
appended to, not mutated; existing exports are untouched. `package.json`
received the single-key `pretest` addition with no other field touched.

## Done criteria per task (cross-check)

PASS. Every task's PLAN.md Done-when is satisfied:
- T1.1: `dist/cli.js` exists, three smoke tests pass, lint clean.
- T1.2: `validateNonBlank` exists with D2 signature; four new unit cases pass.
- T1.3: All four enumerated smoke checks pass (version, help, --help, empty
  string); D3 precedence preserved; `console.log` for stdout,
  `process.stderr.write` for stderr.
- T1.4: All listed cli.test.ts cases present and passing; portable `spawnSync`
  array form used for the empty-string argv.
- T1.5: `pretest` script present at `package.json:10`; `npm test` rebuilds
  `dist/` automatically.
- T1.6: build + lint + test all exit 0; no skipped tests.

---

## Summary

All three features (`--version`/`-v`, blank-input validation, help) are
implemented per requirements.md acceptance criteria. CLI precedence matches
PLAN.md D3 exactly. Tests cover every acceptance criterion with meaningful,
non-redundant cases. No regressions in pre-existing notes or validation tests.
`npm run build`, `npm run lint`, and `npm test` all pass (34/34). File hygiene
is clean. Working tree is clean.

Verdict: APPROVED.
