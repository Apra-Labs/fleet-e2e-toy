# Progress

_Updated by the agent after every significant action. This is how you review its work._

> **NOTE:** The sessions below are a pre-populated example showing what an overnight run leaves behind.
> feature_list.json is intentionally set to all `passes: false` so the live demo starts fresh.
> In a real run, the agent would have flipped features 1 & 2 to `true` as described below.

## Session 1 — 2026-02-15 22:30 UTC

### Feature: Tag filtering endpoint
- Reviewed existing GET /api/notes handler — tag filtering already implemented in src/api/notes.ts
- Added dedicated tests for tag filtering: single tag, no match, multiple tags on same note
- All 4 new tests pass
- Committed: feat: add comprehensive tag filtering tests
- Updated feature_list.json: "Tag filtering endpoint" -> passes: true

SESSION_DONE

## Session 2 — 2026-02-15 22:38 UTC

### Feature: Full-text search
- Search by ?q= already works for title and content
- Added edge case tests: empty query returns all, no matches returns empty array, case-insensitive search
- Found and fixed bug: empty string query was filtering out all notes (now returns all)
- All 3 new tests pass
- Committed: feat: add full-text search tests and fix empty query bug
- Updated feature_list.json: "Full-text search" -> passes: true

SESSION_DONE

---
Status after 2 sessions: 2/4 features done, 2 remaining (Pagination, Note archiving)

## Session 3 — 2026-05-15

### Feature: Tag filtering endpoint
- Tag filtering already implemented in src/api/notes.ts (lines 17-20)
- Existing test covered single-tag case; added two more tests:
  - No match: returns empty array when tag doesn't exist on any note
  - Multiple tags: note with multiple tags is returned when filtering by any one of them
- All 23 tests pass
- Updated feature_list.json: "Tag filtering endpoint" -> passes: true

SESSION_DONE

## Session 4 — 2026-05-15

### Feature: Full-text search
- Search by ?q= already implemented in src/api/notes.ts (lines 22-28) — case-insensitive, searches title and content
- Empty string query handled correctly: `if (q)` is falsy for "", so no filter applied (returns all)
- Added 4 edge case tests:
  - Match in content (not title): verifies content field is searched
  - No match returns empty array
  - Empty query string returns all notes
  - Case-insensitive: uppercase title found by lowercase query
- All 27 tests pass
- Updated feature_list.json: "Full-text search" -> passes: true

SESSION_DONE

## Session 5 — 2026-05-15

### Feature: Pagination support
- Changed GET /api/notes response format from plain array to `{ data, total, page, limit }`
- Default page=1, limit=20; both params are optional
- Updated all 10 existing GET /api/notes tests to use `res.body.data` instead of `res.body`
- Added 3 new pagination tests: page+limit params, default values, page beyond total
- All 30 tests pass
- Updated feature_list.json: "Pagination support" -> passes: true

SESSION_DONE

## Session 6 — 2026-05-15

### Feature: Note archiving
- Added `archived: boolean` (required, default false) to Note interface in src/models/note.ts
- Added `setArchived(id, archived)` method to noteStore — dedicated method rather than widening UpdateNoteInput
- Updated POST /api/notes to set `archived: false` on creation
- Updated GET /api/notes to filter out archived notes before tag/q/pagination (so `total` stays accurate); `?include_archived=true` bypasses the filter
- Added POST /api/notes/:id/archive and POST /api/notes/:id/unarchive endpoints (200+body on success, 404 if not found)
- GET /api/notes/:id still returns archived notes (plan only says to exclude from collection)
- Added 8 tests covering: hide archived from default GET, include_archived=true, unarchive restores visibility, GET /:id works on archived, 404 on both endpoints, pagination total excludes archived, archive response shape
- All 38 tests pass
- Updated feature_list.json: "Note archiving" -> passes: true

SESSION_DONE
