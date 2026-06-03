# s1.1 -- Code Review

**Reviewer:** Opus 4.7 (code-reviewer)
**Date:** 2026-06-03
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.

---

## Context recovery

Prior feedback (commit `4a64df3`) was a plan-review APPROVAL for sprint s1.1. No prior code-review findings to incorporate -- this is the first code review pass for the implementation phases.

Branch `pmlite-e2e/s1.1-1780467215566` from base `main` contains 8 commits since branching, with the implementation work in:

- `21ae615` fix(validation): reject blank content and blank tag entries (gh-toy-v6z)
- `6a7be2e` feat(api): add GET /version endpoint (gh-toy-4ef)
- `1b7a9ba` feat(api): add GET /api/help endpoint (gh-toy-kbk)
- `f1e30fa` chore: update progress.json with T3.2 commit hash

`progress.json` marks T1.1, T2.1, T3.1, T3.2 as completed. T4.1 (final verify) remains pending; this review effectively performs that verification.

---

## 1. Working tree, build, lint, tests

PASS. `git status --porcelain` returns empty -- the branch is fully committed with no stray files. All commands run from a clean tree:

- **Build:** `./node_modules/.bin/tsc --noEmit` -- exit 0, no errors. `./node_modules/.bin/tsc` produces `dist/api/{help,version,notes}.{js,d.ts}` (dist was then removed to keep the tree clean for this review).
- **Lint:** `./node_modules/.bin/eslint src/ tests/ --ext .ts` -- exit 0, zero warnings.
- **Tests:** `./node_modules/.bin/jest --verbose` -- `Test Suites: 4 passed, 4 total / Tests: 30 passed, 30 total`. Matches PLAN.md's expected count exactly (21 baseline + 5 + 1 + 3).

CI workflow `.github/workflows/ci.yml` only triggers on `push` to `main`/`feature/**` or PR to `main`. The branch name `pmlite-e2e/s1.1-...` does not match either trigger and no PR is open, so there is no CI run to consult. The local suite is the authoritative signal here, and it is green.

## 2. File hygiene

PASS. `git diff --name-only main...HEAD` lists:

```
PLAN.md         (renamed from lowercase plan.md -- net new content)
feedback.md     (sprint tracking)
plan.md         (deleted -- replaced by uppercase PLAN.md)
progress.json   (sprint tracking)
requirements.md (sprint tracking)
src/api/help.ts
src/api/version.ts
src/app.ts
src/utils/validation.ts
tests/help.test.ts
tests/validation.test.ts
tests/version.test.ts
```

Every entry justifies against the sprint: 4 sprint-tracking docs, plus 4 source/test files and the 2 source/test edits called for in PLAN.md Phases 2-3, plus `src/app.ts` mount edits. No temp/scratch, no harness config, no unrelated artifacts. The `plan.md` -> `PLAN.md` rename is a Windows case-folding artifact handled by git; only `PLAN.md` exists in the worktree now.

## 3. gh-toy-v6z -- validation hardening (Phase 2 / Task 2.1)

PASS. `src/utils/validation.ts` matches the PLAN.md spec exactly:

- **createInput content** (lines 23-27): `else if (obj.content.trim().length === 0)` placed AFTER the type check, so the existing `typeof obj.content !== "string"` failure path is preserved with its original wording. New error string matches spec: `"Content must be a non-empty string"`.
- **createInput tags** (lines 29-35): `else if ((obj.tags as string[]).some((t) => t.trim().length === 0))` placed AFTER the `Array.isArray && every(typeof === "string")` check. Critically, this preserves the ordering invariant required by the existing `"rejects non-string tags"` test (line 38-44 of `tests/validation.test.ts`) which asserts `errors[0].field === "tags"` with the original "must be an array of strings" message. Confirmed by running the existing test -- still green.
- **updateInput content** (lines 64-70): correctly guarded by `obj.content !== undefined`. Same two-check structure preserves type-error wording.
- **updateInput tags** (lines 72-78): mirrors createInput, also guarded by `obj.tags !== undefined`.

New tests (`tests/validation.test.ts` lines 46-68 and 91-99): all 5 added cases present with the exact `it()` names and inputs specified in PLAN.md. No existing test was deleted or modified.

Regression check: `tests/notes.test.ts` line 85-89 sends `{content: "No title"}` and expects HTTP 400 with `res.body.errors` defined -- still passes because missing title still fires its error first, and the response shape is unchanged.

## 4. gh-toy-4ef -- GET /version (Phase 3 / Task 3.1)

PASS. `src/api/version.ts` implements the runtime `package.json` read exactly as PLAN.md mandates:

```ts
const pkgPath = path.join(__dirname, "..", "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { version: string };
```

This honors the `tsconfig.json` `rootDir: "./src"` constraint -- no JSON import that would escape rootDir. Verified the path resolution works for both ts-jest (where `__dirname` resolves to source dir) and compiled `dist/` (verified by running `tsc` then loading `dist/api/version.js` via Node -- module loads cleanly). The cached parse at module load matches the spec.

Mount in `src/app.ts` line 10: `app.use("/version", versionRouter)` -- correctly NOT under `/api`, placed next to other top-level mounts. Response shape `{ version: pkg.version }` with status 200 matches contract.

Test `tests/version.test.ts`: asserts status 200, `typeof res.body.version === "string"`, and `res.body.version === "1.0.0"`. Passes. Uses `supertest` against the exported app (no server started) -- conforms to project convention.

NOTE (non-blocking): the version literal `"1.0.0"` is hard-asserted in the test rather than read from `package.json`. If the project bumps to `1.0.1`, this single test will fail loudly -- arguably the right tradeoff (intentional contract check) but worth flagging for the next sprint if version bumps become routine.

## 5. gh-toy-kbk -- GET /api/help (Phase 3 / Task 3.2)

PASS. `src/api/help.ts` contains exactly the 8 entries enumerated in PLAN.md, in the specified order, with matching `method`/`path`/`description` strings byte-for-byte:

1. GET /version, GET /health, GET /api/help
2. GET /api/notes, GET /api/notes/:id, POST /api/notes, PUT /api/notes/:id, DELETE /api/notes/:id

Mount in `src/app.ts` line 11: `app.use("/api/help", helpRouter)` -- correctly under `/api`.

Tests `tests/help.test.ts` (44 lines, 3 `it()` blocks):

- length-8 assertion: present (`expect(res.body.endpoints).toHaveLength(8)`).
- every-route assertion: uses a single `for...of` loop with `expect.arrayContaining` -- matches PLAN.md's "single `it` with a loop, NOT eight separate `it` blocks" requirement.
- per-entry non-empty-strings assertion: validates `method`, `path`, `description` are all non-empty strings.

All three pass. The hand-maintained list is correct and exhaustive for the current route set (verified by cross-referencing `src/app.ts` plus `src/api/notes.ts` route definitions).

NOTE (non-blocking, also called out as R4 in the plan): the list will drift the next time a route is added. Plan correctly defers automation to a future sprint.

## 6. Test quality

PASS.

- **Coverage of new behavior:** every new branch in `validateCreateInput`/`validateUpdateInput` has a dedicated test. `/version` has one focused test. `/api/help` has three tests covering shape, completeness, and per-entry well-formedness.
- **No redundant/overlapping tests:** the `rejects whitespace-only title` test under createInput is a no-op against pre-existing logic (the validator already rejected this), but it was explicitly called out in the PLAN as a confirming/contract assertion and matches the requirements.md acceptance phrasing -- not a regression, intentional.
- **Untested surfaces:** `/version` and `/api/help` are not negative-tested (e.g., POST /version returning 404) -- minor, since Express default behavior covers this and the PLAN did not require it.
- **Style consistency:** all new tests use `supertest` against `app`, matching `tests/notes.test.ts` conventions. The `if (!result.valid)` narrowing pattern in validation tests matches the existing style.

## 7. Conventions and consistency

PASS.

- Error response shape unchanged for existing endpoints (`{errors: [...]}` for validation failures), per project convention in `CLAUDE.md`.
- New handlers use `res.status(N).json(...)` -- never `res.send()`, per convention.
- No `any` types introduced; new code uses proper interfaces or `unknown` with narrowing.
- No `console.log` in handlers.
- No new dependencies, no `package.json` changes, no `tsconfig.json` changes -- matches "Out of scope" in PLAN.md.
- New files placed under `src/api/` per the "one file per resource" convention.

## 8. Security and correctness

PASS. No injection vectors, no authentication surface touched, no secrets in code. `package.json` is read via a constant path under `__dirname` -- not user-influenced, so no path-traversal risk. The hand-maintained help list contains only static metadata.

## 9. Regression check on previously approved work

PASS. The 13 pre-existing `tests/notes.test.ts` cases all still pass. The pre-existing `tests/validation.test.ts` cases all still pass with their original assertions intact. The error ordering invariant for `tags: [1,2]` (PLAN.md R2) is preserved.

---

## Summary

All three P1 issues are implemented per the locked specs in PLAN.md:

- **gh-toy-v6z** -- blank-string validation added in both create and update validators with the exact error messages, exact ordering, and exact 5 new test cases. Regression-safe against existing tests.
- **gh-toy-4ef** -- `/version` endpoint with runtime `package.json` read (respects rootDir), correct mount, correct response shape, one focused test.
- **gh-toy-kbk** -- `/api/help` endpoint with all 8 hand-listed entries, mounted under `/api`, with three well-targeted tests including the explicitly-required single-loop check.

Quality gates: clean working tree, TypeScript compiles, ESLint clean, all 30 tests pass (= 21 baseline + 5 + 1 + 3 as specified). File hygiene is clean. No regressions in existing notes API behavior.

Non-blocking observations:
- `/version` test hard-codes `"1.0.0"` -- intentional contract check, but coupled to package version bumps.
- Help list will drift on future route additions -- already noted as out-of-scope in the plan's risk register (R4).
- The redundant whitespace-title test under createInput is intentional (matches requirements.md acceptance phrasing), not a bug.

Verdict: APPROVED. Phase 4 (T4.1 verification) can close on the strength of this review's local test run.
