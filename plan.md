# NoteAPI v2 — Implementation Plan

> Three sprint issues: tag filtering edge-case tests (gh-toy-bzq), full-text search edge-case tests (gh-toy-gw1), and pagination implementation with tests (gh-toy-06i). Tag filtering and full-text search are already implemented; their work is test coverage only. Pagination requires both new server logic and a response-format change that updates all existing GET /api/notes tests.

---

## Exploration Summary

| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| Tag filtering | Implemented | `src/api/notes.ts:17-20` | `if (tag)` guards; falsy tag skips filter |
| Full-text search | Implemented | `src/api/notes.ts:22-28` | Case-insensitive substring; `if (q)` means empty string returns all |
| Pagination | **Not implemented** | TODO at `notes.ts:8` | Response currently a plain array |

**Verified assumptions:**

- Tag filtering exists: `notes.ts:17-20` — `notes.filter((n) => n.tags.includes(tag))` ✓
- Empty `q` bug already fixed: `if (q)` evaluates falsy for `""`, returning all notes ✓
- Existing tests expect plain array from GET /api/notes (`res.body.toEqual([])`, `res.body.toHaveLength(...)`) — **will break when pagination envelope is added** ✓
- `noteStore.clear()` in `beforeEach` provides full test isolation ✓
- No new npm dependencies needed — pagination is pure arithmetic ✓

**Risk identified:** Adding always-on pagination envelope changes the API contract for GET /api/notes. All four existing `GET /api/notes` test assertions must be updated before or alongside the implementation.

---

## Tasks

### Phase 1: Tag Filtering Edge-Case Tests (gh-toy-bzq)

#### Task 1: Add edge-case tests for tag filtering
- **Change:** Add three test cases inside the existing `describe("GET /api/notes")` block: (1) unrecognised tag returns empty array; (2) absent `tag` param returns all notes; (3) note with multiple tags is matched by any of them.
- **Files:** `tests/notes.test.ts`
- **Tier:** cheap
- **Done when:** `npm test` passes, including the three new tag-filter tests. No existing tests regress.
- **Blockers:** None — implementation already present; tests require no code changes.

#### VERIFY: Phase 1 — Tag Filtering
- Run `npm test`
- Confirm all three new tag-filter tests pass
- Confirm no regressions in existing suite

---

### Phase 2: Full-Text Search Edge-Case Tests (gh-toy-gw1)

#### Task 2: Add edge-case tests for full-text search
- **Change:** Add four test cases inside the existing `describe("GET /api/notes")` block: (1) empty `q` returns all notes (not empty array); (2) `q` with no matches returns empty array; (3) case-insensitive match (`"MEETING"` finds `"Meeting notes"`); (4) match on `content` field, not just `title`.
- **Files:** `tests/notes.test.ts`
- **Tier:** cheap
- **Done when:** `npm test` passes, including the four new search tests. No existing tests regress.
- **Blockers:** None — implementation already present and correct.

#### VERIFY: Phase 2 — Full-Text Search
- Run `npm test`
- Confirm all four new search tests pass
- Confirm no regressions in existing suite

---

### Phase 3: Pagination (gh-toy-06i)

The pagination envelope (`{ data, total, page, limit }`) replaces the current plain array. This is a breaking change to the existing GET /api/notes response shape. Tasks are ordered: update tests first (cheap), then implement (standard), so no commit contains tests that contradict the server code for more than one step.

#### Task 3: Update existing GET /api/notes tests for pagination envelope
- **Change:** Rewrite the four existing `GET /api/notes` tests in `tests/notes.test.ts` to expect the new response shape. Specific changes:
  - `res.body` → `res.body.data` for the array assertions (`toEqual([])`, `toHaveLength(N)`, index access `[0].title`)
  - Add assertions that `res.body.total`, `res.body.page`, and `res.body.limit` are present and correct for each case
  - Also update the tag-filter and search tests added in Tasks 1 and 2 to use `res.body.data`
- **Files:** `tests/notes.test.ts`
- **Tier:** cheap
- **Done when:** File compiles (`npx tsc --noEmit`). Tests will fail at runtime until Task 4 is complete — that is expected.
- **Blockers:** None.

#### Task 4: Implement pagination in GET /api/notes
- **Change:** In `src/api/notes.ts`, after the existing tag and `q` filters, add:
  1. Parse `page` and `limit` from `req.query`; default `page=1`, `limit=20`; clamp `page` to minimum 1, `limit` to range 1–100
  2. Compute `total = notes.length` (after filtering, before slicing)
  3. Slice: `const start = (page - 1) * limit; const data = notes.slice(start, start + limit)`
  4. Return `res.json({ data, total, page, limit })` instead of `res.json(notes)`
- **Files:** `src/api/notes.ts`
- **Tier:** standard
- **Done when:** `npm test` passes with zero failures. All tests — original suite plus Tasks 1–3 additions — green.
- **Blockers:** Task 3 must be committed first so tests and implementation are synchronised.

#### Task 5: Add pagination-specific tests
- **Change:** Add a new `describe("GET /api/notes — pagination")` block in `tests/notes.test.ts` with: (1) default page/limit applied when params absent; (2) explicit `?page=1&limit=2` returns first two of three notes; (3) `?page=2&limit=2` returns the third note; (4) page beyond last returns `data: []` with correct `total`; (5) filtering and pagination compose — `?tag=work&page=1&limit=1` on two matching notes returns one result with `total=2`.
- **Files:** `tests/notes.test.ts`
- **Tier:** standard
- **Done when:** `npm test` passes including all five new pagination tests.
- **Blockers:** Task 4 must be complete.

#### VERIFY: Phase 3 — Pagination
- Run `npm test`
- Confirm all five new pagination tests pass
- Confirm full suite green (no regressions from Tasks 1–5)
- Confirm `npm run build` compiles without errors

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pagination envelope breaks existing GET /api/notes tests | High | Task 3 updates all affected tests before Task 4 ships the implementation; both committed together in the same session |
| `limit` param allows arbitrarily large values (DoS / memory pressure) | Med | Clamp `limit` to maximum 100 in Task 4 implementation |
| Filters (tag, q) and pagination interact — slice applied to wrong population | Med | Task 5 includes a compose test (`?tag=work&page=1&limit=1` with two matching notes); `total` must reflect post-filter count |
| Empty `q` regression — previously a known bug | Low | Already fixed (`if (q)` is falsy for `""`); Task 2 adds a regression test |
| TypeScript strict mode catches missing type annotations on new params | Low | `req.query.page` is `string \| undefined`; parse with `parseInt` and guard with `isNaN` |

---

## Notes
- Each task results in a git commit on branch `e2e-s1.1-25715106074/notes-api-features`
- VERIFY tasks are checkpoints — stop and report after each one
- Base branch: `main`
- Implementation branch: `e2e-s1.1-25715106074/notes-api-features`
