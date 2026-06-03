# CLI Features P1 -- Code Review (Phase 2)

**Reviewer:** pm-lite-reviewer
**Date:** 2026-06-03 17:42:00-04:00
**Verdict:** APPROVED

> Prior `feedback.md` history: `6b328ec` (plan review CHANGES NEEDED), `1acafb2` (plan review APPROVED), `e6a5a4b` (Phase 1 code review APPROVED with two non-blocking notes -- `exitCode === 0` not asserted on the no-flag case, and the T1.2 progress.json SHA fabricated past the 7-char prefix). Both Phase 1 notes were minor and explicitly non-blocking; Phase 2 was out of scope for that review. This review covers Phases 1 + 2 in aggregate per the scope rule.

---

## Scope and Tree State

Working tree is clean (`git status --porcelain` empty). Branch `pmlite-e2e/s1.1-1780516662518` is 17 commits ahead of `main`. All sprint tasks T1.1–T2.V are marked completed in `progress.json`.

Files changed vs `main`:

- Code: `src/cli.ts` (new, Phase 1), `src/index.ts` (Phase 1), `src/utils/validation.ts` (Phase 2 T2.1), `src/api/notes.ts` (Phase 2 T2.2)
- Tests: `tests/cli.test.ts` (new, Phase 1), `tests/validation.test.ts` (Phase 2 T2.3), `tests/notes.test.ts` (Phase 2 T2.3)
- Sprint tracking: `plan.md`, `progress.json`, `requirements.md`, `feedback.md`

File hygiene PASS -- no temp scratch, no harness config, no editor settings, no stale variants. The lowercase `plan.md` vs displayed `PLAN.md` reflects the Windows case-insensitive FS already noted in the Phase 1 review.

---

## Build, Lint, Test

- `npx tsc --noEmit` -- PASS (no output, exit 0).
- `npm run lint` -- PASS (eslint clean, exit 0).
- `npm test` -- PASS. 3 suites, **41 tests**, all green (7 new since Phase 1: 4 in `validation.test.ts`, 3 in `notes.test.ts`). Total runtime ~8.1 s; spawnSync smoke tests finish in ~1.5 s each, well under the 20 s timeout.
- No CI run exists for the branch (`gh run list --branch …` empty) and no PR is open. The local suite is the authoritative gate; it is green.

---

## Task T2.1 -- Reject blank content in `src/utils/validation.ts`

PASS. The change matches the plan diff verbatim for both `validateCreateInput` and `validateUpdateInput`:

```
if (typeof obj.content !== "string" || obj.content.trim().length === 0) {
  errors.push({ field: "content", message: "Content must not be blank" });
}
```

The update variant correctly retains the `obj.content !== undefined` outer guard so that a no-op update (no `content` key) still validates. Done criteria all satisfied:

- `validateCreateInput({ title: "t", content: "   " })` -> invalid, field `"content"`, message `"Content must not be blank"`.
- `validateCreateInput({ title: "t", content: "" })` -> invalid, field `"content"`.
- `validateCreateInput({ title: "t", content: "real text" })` -> valid (verified by existing tests).
- `validateUpdateInput({ content: "   " })` -> invalid.
- `validateUpdateInput({ content: "ok" })` -> valid.
- `validateUpdateInput({})` -> valid (no-op preserved).

NOTE (non-blocking): `validateCreateInput` still assigns `content: obj.content as string` (raw, no `.trim()`) into `data` on the valid path, while `title` is trimmed. The plan did not request content trimming on the happy path and the acceptance criteria do not require it, so this is in-spec -- flagged only to record that stored note content can still have leading/trailing whitespace if a non-blank but padded value is sent (e.g. `"  hi  "`). Consistent with the existing baseline. Not a blocker.

## Task T2.2 -- Trim blank query params in `src/api/notes.ts`

PASS. The two query reads are replaced exactly as planned:

```
const tag = ((req.query.tag as string | undefined) ?? "").trim() || undefined;
const q   = ((req.query.q   as string | undefined) ?? "").trim() || undefined;
```

The downstream `if (tag)` / `if (q)` filter blocks are unchanged, preserving existing behaviour for both real values and the new whitespace-collapse-to-undefined path. The integration tests verify all four done-criteria cases:

- `GET /api/notes?tag=%20` -> returns all notes (no filter).
- `GET /api/notes?q=%20%20` -> returns all notes (no filter).
- `GET /api/notes?tag=work` -> still filters by tag (pre-existing test still passes).
- `GET /api/notes?q=meeting` -> still filters by search (pre-existing test still passes).

The handler continues to validate inputs before processing and uses `res.status(...).json(...)` for all responses, matching the API conventions in `.claude/rules/api-conventions.md`.

## Task T2.3 -- Blank-input tests in `tests/validation.test.ts` and `tests/notes.test.ts`

PASS.

`tests/validation.test.ts` adds the four prescribed tests:
- `rejects whitespace-only content` -- exact message assertion (`"Content must not be blank"`) included, which is the strongest contract check available.
- `rejects empty-string content` -- partitions empty-vs-blank.
- `rejects whitespace-only content on update` -- symmetric with create.
- `accepts update with non-blank content` -- happy-path symmetry.

`tests/notes.test.ts` adds the three prescribed tests:
- POST `{ title: "t", content: "   " }` -> 400 with `errors[0].field === "content"`.
- GET `/api/notes?q=%20%20` returns 2 notes (the two pre-created).
- GET `/api/notes?tag=%20` returns 2 notes (the two pre-created, each with distinct tags so the regression case is real, not vacuous).

The new tests sit in a new `GET /api/notes -- blank query params` describe block, not interleaved with the existing one -- readable and clearly attributable to this sprint. No redundancy with existing tests; each new test exercises a unique surface.

## Task T2.V -- Verify Phase 2

PASS. `npm test` is green at 41/41. `npm run lint` and `tsc --noEmit` both clean. All Phase 2 requirements from `requirements.md` are now testable and tested:

- gh-toy-v6z R1: POST with blank content -> 400 with `field: "content"` -- covered by `notes.test.ts:117` and `validation.test.ts:46,55`.
- gh-toy-v6z R2: blank `q` -> all notes -- covered by `notes.test.ts:57`.
- gh-toy-v6z R3: blank `tag` -> all notes -- covered by `notes.test.ts:69`.

---

## Phase 1 Regression Check

`src/cli.ts`, `src/index.ts`, and `tests/cli.test.ts` are unchanged since Phase 1 sign-off (commits `2c883a4`, `a64b02b`, `8e194dc`). All 13 Phase 1 tests still pass (4 spawnSync smoke + 7 unit + 2 stdout content). The two non-blocking notes from the Phase 1 review (no-flag `exitCode` assertion absent; T1.2 progress.json SHA fabricated tail) remain present but were explicitly deemed non-blocking; they do not warrant raising in Phase 2.

---

## Test Quality

41 total tests across the suite; coverage map for the sprint:

- Every acceptance criterion in `requirements.md` traces to at least one test (CLI: 4 smoke + unit content; validation: 4 unit; query trimming: 2 integration).
- Unit and integration layers are partitioned cleanly -- no overlapping redundant assertions.
- Error message text (`"Content must not be blank"`) is asserted exactly once at the unit layer, then by field name only at the integration layer -- appropriately weighted (no brittle duplicate exact-string assertions).
- Untested exposed surfaces: none material to the sprint scope. The pre-existing `tags` validation (non-string entries) and the `404` paths are untouched and remain covered by pre-sprint tests.

---

## Convention and Security Check

- `console.log` used only inside `src/cli.ts` (a legitimate stdout consumer) -- `.claude/rules/api-conventions.md` prohibits `console.log` only in route handlers; no API handler was modified to introduce one.
- No `any` types introduced in Phase 2; the `as string | undefined` casts on `req.query.*` are pre-existing Express typings, not new `any`.
- No new npm dependencies (matches sprint requirement "no new npm dependencies").
- No secrets or credentials in code.
- No shell scripts added in this sprint, so the global CLAUDE.md CRLF / `.gitattributes` rule is not triggered. (`.gitattributes` exists in the repo per the Phase 1 review.)
- Trimmed-but-non-blank content is stored as-is (with leading/trailing spaces) -- see T2.1 NOTE above. Aligned with plan and existing baseline.

---

## Progress.json Hygiene

Phase 2 entries record commits as 7-char shorts (`6cc143b`, `02e0480`, `982684d`) or full SHAs (`6cc143b1eecc91d8ede115bb335c01dd09d78cc4`, `02e0480ccde1207772319ba942e897d3b458c2a1`) -- all resolve cleanly via `git cat-file -t`. The Phase 1 T1.2 fabricated-tail issue noted in the prior review was not retroactively corrected, but every Phase 2 SHA is well-formed. Non-blocking.

---

## Summary

Phase 2 is complete and approved. All three Phase 2 tasks (T2.1 / T2.2 / T2.3) meet their plan done criteria exactly. Build, lint, and the entire test suite (41/41) are green on Windows. No regressions detected in Phase 1 code or pre-sprint tests. One non-blocking note recorded (T2.1 happy-path does not trim stored `content`, in line with plan). The two non-blocking notes from the Phase 1 review remain unchanged and remain non-blocking.

Verdict: **APPROVED**.
