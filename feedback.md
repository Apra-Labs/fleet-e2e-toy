# NoteAPI — Phase 2 (Final) Review

**Reviewer:** Workshop-Rev
**Date:** 2026-06-08
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.

---

## Phase 1 (carried forward)

APPROVED — no new findings. All 8 criteria passed: pagination envelope shape, post-filter `total`, `validatePaginationParams` coverage (10 unit tests), existing test migration to `res.body.data`, no `any` types, no `console.log`, input validation before processing, correct error shapes.

One non-blocking note carried forward: stale TODO on line 8 of `src/api/notes.ts` ("Add pagination to GET /api/notes") — pagination is implemented; remove when convenient.

---

## Phase 2 Review

### T2.1 — Multi-Tag "Last Wins" Fix — PASS

`src/api/notes.ts` lines 17-22 handle both Express query forms:
- `Array.isArray(req.query.tag)` — takes last element (`req.query.tag[length - 1]`)
- Single string — uses directly
- Undefined / empty string — `tag` stays falsy, filter is skipped (returns all notes)

Test "multiple ?tag=a&tag=b uses last value" creates notes with tag `a` and `b`, queries `?tag=a&tag=b`, and asserts only the `b`-tagged note is returned with `total=1`. Correctly verifies the "last wins" behavior.

### T2.1 — Tag Filter Edge Cases (3 tests) — PASS

| Test | Assertion | Status |
|------|-----------|--------|
| `?tag=` (empty string) returns all notes | `total=2`, `data.length=2` | PASS |
| `?tag=nonexistent` returns empty | `data=[]`, `total=0` | PASS |
| `?tag=a&tag=b` uses last value | `data.length=1`, title is "Note B", `total=1` | PASS |

All three edge cases from requirements.md section 1 are covered.

### T2.2 — Search Edge Cases (4 tests) — PASS

| Test | Assertion | Status |
|------|-----------|--------|
| `?q=` (empty) returns all | `data.length=2`, `total=2` | PASS |
| `?q=zzznomatch` returns empty | `data=[]`, `total=0` | PASS |
| `?q=c++` special chars | Does not throw, returns 1 match ("C++ Programming") | PASS |
| `?q=foo bar` with space | Literal substring match, returns 1 result | PASS |

All four edge cases from requirements.md section 2 are covered. The `c++` test uses URL-encoded `%2B%2B` and asserts the correct note is returned, not just that it doesn't crash.

### T2.3 — Pagination Edge Cases (7 tests) — PASS

| Test | Assertion | Status |
|------|-----------|--------|
| `?page=abc` non-numeric page | 400 + `error` defined | PASS |
| `?limit=xyz` non-numeric limit | 400 + `error` defined | PASS |
| `?limit=0` | 400 + `error` defined | PASS |
| `?page=999` beyond last page | 200, `data=[]`, `total=2`, `page=999`, `limit=10` | PASS |
| `?limit=100` larger than total | 200, `data.length=3`, `total=3` | PASS |
| `?page=1&limit=2` with 5 notes | 200, `data.length=2`, `total=5`, `page=1`, `limit=2` | PASS |
| Default pagination | `page=1`, `limit=10` | PASS |

All seven cases match requirements.md section 3 edge cases. The out-of-range test correctly asserts both empty data and the real total (not 0). The slicing test verifies `data.length=2` (sliced) with `total=5` (unsliced). The default test resolves the Phase 1 note about deferred metadata assertions.

### T2.4 — Composition Tests (2 tests) — PASS

Setup: 6 notes total — 3 match both `tag=work` AND `q=meeting`, 3 match at most one filter.

**Page 1 (`?tag=work&q=meeting&page=1&limit=2`):**
- `total=3` — proves total reflects the filtered count (3), not store size (6)
- `data.length <= 2` and `> 0` — correct page slice
- Each returned note asserted to contain tag "work" and substring "meeting" in title+content

**Page 2 (`?tag=work&q=meeting&page=2&limit=2`):**
- `total=3` — same filtered count
- `data.length=1` — correct remainder (3 items, limit=2, page 2 = 1 remaining)
- `page=2`, `limit=2` — envelope metadata correct

The `total < store size` assertion is the key composition requirement and is verified.

### Code Quality — PASS

- **No `any` types:** All new code uses proper types. Query parameter casts use `as string`, which is standard Express practice. `validatePaginationParams` accepts `unknown`.
- **No `console.log`:** Confirmed absent from `src/api/notes.ts`.
- **Error shapes:** All 400 errors return `{ error: "..." }` via `res.status(400).json()`.
- **Test isolation:** Main `describe("GET /api/notes")` has `beforeEach(() => noteStore.clear())` inherited by all nested describes. Separate `describe("GET /api/notes -- composition")` has its own `beforeEach(() => noteStore.clear())`. No cross-test leakage.
- **Lint:** `npm run lint` passes with zero errors.
- **All tests:** 47/47 pass (18 validation + 29 integration).

---

## Summary

**All review criteria pass across both phases.** The sprint delivers:

- Pagination envelope with `{ data, total, page, limit }` and proper validation
- Multi-tag "last wins" fix handling both `string` and `string[]` from Express
- 16 new edge-case tests (3 tag + 4 search + 7 pagination + 2 composition)
- Post-filter `total` verified via composition tests (total=3 with 6 notes in store)
- Clean code quality: no `any`, no `console.log`, correct error shapes, proper test isolation

**One non-blocking note (carried from Phase 1):**
- Stale TODO comment on line 8 of `src/api/notes.ts` — pagination is implemented; remove when convenient.

**Verdict: APPROVED.** Ready to merge to `main`.
