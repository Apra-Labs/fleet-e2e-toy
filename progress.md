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

## Session 3 � 2026-05-14 00:50 UTC

### Feature: CLI Enhancements
- Implemented --version/-v flag (gh-toy-4ef)
- Implemented help command and --help/-h flag (gh-toy-kbk)
- Added input validation for empty/blank strings (gh-toy-v6z)
- Created \	ool\ and \	ool.cmd\ scripts for easy CLI access
- Added comprehensive unit tests in \	ests/cli.test.ts\
- All tests pass (CLI and existing API tests)
- Committed: feat: add CLI version, help, and input validation (gh-toy-4ef, gh-toy-kbk, gh-toy-v6z)

SESSION_DONE
