# NoteAPI — Implementation Plan

> Harden three query features on `GET /api/notes`: tag filtering, full-text search, and pagination. Tag filtering and search are partially implemented (need edge-case tests and a multi-tag fix). Pagination is not yet implemented. All three must compose correctly: tag filter → search → paginate.

---

## Design Decisions

- **Multiple `?tag=` params**: "Last wins" — if Express parses `?tag=a&tag=b` as an array, take the last element. This matches the simplest mental model and avoids complex AND/OR semantics (which are out of scope).
- **Pagination envelope**: Always returned for the list endpoint, even when `page`/`limit` params are absent (defaults `page=1`, `limit=10` apply). This gives consumers a consistent response shape.
- **Composition order**: tag filter → search filter → paginate. `total` reflects post-filter count.

---

## Tasks

### Phase 1: Pagination Implementation

Pagination is the riskiest feature (not yet implemented, changes response shape for all list operations). Build the shared interface and validation first, then implement and migrate existing tests.

#### Task 1: Add PaginatedResponse interface to note model
- **Change:** Add a generic `PaginatedResponse<T>` interface with fields `data: T[]`, `total: number`, `page: number`, `limit: number` to the models file.
- **Files:** `src/models/note.ts`
- **Tier:** cheap
- **Done when:** TypeScript compiles with the new interface exported. Interface has exactly four fields: `data`, `total`, `page`, `limit`.
- **Blockers:** None

#### Task 2: Add validatePaginationParams helper with unit tests
- **Change:** Add a `validatePaginationParams(page: unknown, limit: unknown)` function to validation.ts. Returns `{ valid: true; params: { page: number; limit: number } }` on success or `{ valid: false; error: string }` on failure. Rules: `page` defaults to 1 and `limit` defaults to 10 when undefined. Non-numeric strings → invalid. `page < 1` → invalid. `limit < 1` → invalid (covers `limit=0`). Fractional values are floored. Add unit tests to `tests/validation.test.ts` covering: defaults, valid values, non-numeric page, non-numeric limit, limit=0, page=0, negative values.
- **Files:** `src/utils/validation.ts`, `tests/validation.test.ts`
- **Tier:** cheap
- **Done when:** `npm test -- tests/validation.test.ts` passes with all new cases green.
- **Blockers:** None

#### Task 3: Implement pagination in GET /api/notes handler and update existing tests
- **Change:** In the `GET /` handler in `src/api/notes.ts`: (1) After the existing tag/search filters, call `validatePaginationParams(req.query.page, req.query.limit)`. (2) If invalid, return `res.status(400).json({ error: result.error })`. (3) Compute `total = notes.length` (post-filter). (4) Slice: `notes.slice((page - 1) * limit, page * limit)`. (5) Return `res.json({ data: slicedNotes, total, page, limit })`. Update all existing `GET /api/notes` tests in `tests/notes.test.ts` to expect the paginated envelope: `res.body.data` instead of `res.body` for the list, `res.body.total` for counts. Specifically update: "returns empty array" → `expect(res.body.data).toEqual([])`, "returns all notes" → `expect(res.body.data).toHaveLength(2)`, "filters by tag" → `expect(res.body.data).toHaveLength(1)` and `res.body.data[0].title`, "searches by query" → `expect(res.body.data).toHaveLength(1)` and `res.body.data[0].title`.
- **Files:** `src/api/notes.ts`, `tests/notes.test.ts`
- **Tier:** standard
- **Done when:** `npm test` passes. `GET /api/notes` returns `{ data: [], total: 0, page: 1, limit: 10 }` when empty. All 4 updated tests pass.
- **Blockers:** Tasks 1 and 2 must be complete.

#### VERIFY: Pagination Implementation
- Run full test suite (`npm test`)
- Confirm all existing tests still pass with new response shape
- Confirm `GET /api/notes` returns paginated envelope
- Report: tests passing, any regressions, any issues found

---

### Phase 2: Edge-Case Tests and Tag Filter Fix

All edge cases from the requirements spec. Tag filter needs a one-line code fix for multi-param handling. Search needs only tests. Pagination and composition need dedicated test coverage.

#### Task 4: Fix multi-tag handling and add tag filter edge-case tests
- **Change:** In `src/api/notes.ts`, replace the raw `req.query.tag as string | undefined` with logic that handles Express returning an array for repeated params: if `req.query.tag` is an array, take the last element (string). Add tests to `tests/notes.test.ts` in a new `describe("GET /api/notes — tag filter edge cases")` block: (1) `?tag=` (empty string) returns all notes — verify `res.body.total` equals total note count. (2) `?tag=nonexistent` returns `{ data: [], total: 0 }`. (3) Multiple `?tag=a&tag=b` uses last value — create notes tagged `a` and `b`, request with both, verify only `b`-tagged notes returned.
- **Files:** `src/api/notes.ts`, `tests/notes.test.ts`
- **Tier:** cheap
- **Done when:** All 3 new tests pass. Existing tag filter test still passes.
- **Blockers:** Phase 1 complete (response shape is envelope).

#### Task 5: Add search edge-case tests
- **Change:** Add tests to `tests/notes.test.ts` in a new `describe("GET /api/notes — search edge cases")` block: (1) `?q=` (empty) returns all notes. (2) `?q=zzznomatch` returns `{ data: [], total: 0 }`. (3) `?q=c++` does not throw, returns results or empty array. (4) `?q=foo bar` (space in query) does not throw, treated as literal substring match.
- **Files:** `tests/notes.test.ts`
- **Tier:** cheap
- **Done when:** All 4 new tests pass. Existing search test still passes.
- **Blockers:** Phase 1 complete (response shape is envelope).

#### Task 6: Add pagination edge-case tests
- **Change:** Add tests to `tests/notes.test.ts` in a new `describe("GET /api/notes — pagination edge cases")` block: (1) `?page=abc` → 400 with `{ error: "..." }`. (2) `?limit=xyz` → 400 with `{ error: "..." }`. (3) `?limit=0` → 400. (4) `?page=999` (beyond last page) → `{ data: [], total: <actual>, page: 999, limit: 10 }`. (5) `?limit=100` with 3 notes → returns all 3, `total: 3`. (6) `?page=1&limit=2` with 5 notes → returns first 2, `total: 5`. (7) Default pagination (no params) → `page: 1, limit: 10`.
- **Files:** `tests/notes.test.ts`
- **Tier:** standard
- **Done when:** All 7 new tests pass.
- **Blockers:** Phase 1 complete.

#### Task 7: Add composition test (tag + search + pagination together)
- **Change:** Add a `describe("GET /api/notes — composition")` block in `tests/notes.test.ts`. Create 6+ notes with varied tags and content. Test `GET /api/notes?tag=work&q=meeting&page=1&limit=2`: verify (1) only notes tagged `work` AND containing "meeting" appear, (2) `total` reflects the filtered count (not store size or pre-search count), (3) `data` length is at most `limit`, (4) `page` and `limit` match request params. Add a second test: same filters but `page=2` to verify second-page behavior.
- **Files:** `tests/notes.test.ts`
- **Tier:** standard
- **Done when:** Both composition tests pass. `npm test` fully green. `npm run lint` passes.
- **Blockers:** Phase 1 complete, Tasks 4-5 complete (tag and search behavior must be correct).

#### VERIFY: Edge-Case Tests and Tag Filter Fix
- Run full test suite (`npm test`)
- Run lint (`npm run lint`)
- Confirm all edge cases from requirements.md are covered
- Report: tests passing, coverage gaps, any issues found

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pagination envelope breaks existing tests | High | Task 3 updates all existing list-endpoint tests in the same commit — no intermediate broken state |
| `req.query.tag` is array when repeated | Med | Task 4 adds explicit array handling ("last wins") before filtering |
| `total` reflects store size instead of filtered count | High | Pagination is applied AFTER filtering in the handler; Task 7 composition test explicitly asserts `total` < store size |
| Special chars in `?q=` cause regex errors | Low | Current implementation uses `String.includes()`, not regex — no injection risk. Task 5 tests `c++` and `foo bar` to confirm |
| No new dependencies constraint violated | Low | All features use built-in JS/TS — no npm additions needed |
| TypeScript `any` introduced accidentally | Med | Code review in VERIFY steps; `npm run lint` configured to catch `any` |

## Notes
- Each task should result in a git commit
- Verify tasks are checkpoints — stop and report after each one
- Base branch: `main`
- Implementation branch: `feat/notes-query-features`
