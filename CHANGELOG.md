# Changelog

## [Sprint gh-toy-1lq] — 2026-06-24

**Sprint goal:** Deliver three P1 fixes to NoteAPI: correct `updatedAt` mutation on PUT, enforce input length limits, and add paginated list responses.

All three source issues were completed in a single track and are in a releasable state. 49 tests pass across 2 suites. Build and lint are clean.

### What Was Implemented

- **updatedAt bug fix (gh-toy-btt):** `noteStore.update()` now sets `updatedAt` to `new Date().toISOString()` on every PUT. Previously the field was frozen at its creation-time value, breaking any client that relied on it for cache invalidation or change detection.

- **Input length validation (gh-toy-t5x):** `validateCreateInput` and `validateUpdateInput` now reject `title` exceeding 200 characters (measured after trim) and `content` exceeding 10 000 characters (measured raw). Both limits return a field-level error object. Existing valid payloads are unaffected.

- **Pagination on GET /api/notes (gh-toy-534):** The list endpoint now returns a paginated envelope `{ data, total, page, limit, totalPages }` instead of a bare array. `page` defaults to 1; `limit` defaults to 20 with a hard cap of 100. Invalid parameter values return 400. Pagination is applied after `tag` and `q` filtering.

### Breaking Changes

- `GET /api/notes` response shape changed from `Note[]` to `{ data: Note[], total, page, limit, totalPages }`. All callers must unwrap `.data`.

### Non-Blocking Observations (no action taken)

- Stale TODO comments in `src/api/notes.ts` for length validation and updatedAt remain; a separate cleanup is warranted.
- A "duplicate tags" TODO was never in sprint scope and carries forward.

### Items Carried Forward

No P3/P4 issues were open. The following open issues remain for future sprints:

- gh-toy-13t (P1) — Add input validation for empty or blank strings
- gh-toy-4ef (P1) — Add --version flag to CLI
- gh-toy-7rp (P1) — CLI help system and input validation
- gh-toy-mi2 (P1) — CLI CRUD commands (list/read/create/update/delete)
- gh-toy-24g (P2) — Add config file support
- gh-toy-69s (P2) — Handle SIGINT gracefully
- gh-toy-aqd (P2) — Add JSON output mode via --json flag
- gh-toy-e30 (P2) — Configure CI to run on pmlite-e2e/* sprint branches
- gh-toy-s5k (P2) — Tag filtering endpoint
