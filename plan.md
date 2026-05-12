# fleet-e2e-toy — Implementation Plan

> Implement key API enhancements for NoteAPI: pagination, a dedicated tag listing endpoint, and case-insensitive full-text search across title and content.

---

## Tasks

### Phase 1: Search and Tags

#### Task 1: Tag Filtering Endpoint (gh-toy-bzq)
- **Change:** Implement `GET /api/notes/tags` to return all unique tags currently assigned to at least one note.
- **Files:** `src/api/notes.ts`, `src/app.ts`
- **Tier:** cheap
- **Done when:** `GET /api/notes/tags` returns a JSON array of unique tags that are used by existing notes.
- **Blockers:** None

#### Task 2: Enhanced Full-text Search (gh-toy-gw1)
- **Change:** Update the `q` parameter logic to be case-insensitive and search across both `title` and `content`.
- **Files:** `src/api/notes.ts`, `src/utils/noteFilters.ts`
- **Tier:** standard
- **Done when:** `GET /api/notes?q=keyword` returns notes where "keyword" appears in title or content, regardless of case.
- **Blockers:** None

#### VERIFY: Search and Tags
- Run `npm test`
- Manual check: `GET /api/notes/tags` returns expected list
- Manual check: `GET /api/notes?q=...` finds results in both fields case-insensitively
- Report: Tests passing, search and tag listing verified.

---

### Phase 2: Pagination

#### Task 3: Pagination Support (gh-toy-06i)
- **Change:** Implement `limit` and `offset` query parameters for `GET /api/notes`. Update the response format to include pagination metadata.
- **Files:** `src/api/notes.ts`, `src/models/note.ts`
- **Tier:** standard
- **Done when:** `GET /api/notes?limit=10&offset=0` returns first 10 notes with metadata: `{ data: [...], total: N, page: N, limit: N }`.
- **Blockers:** None

#### VERIFY: Pagination
- Run `npm test`
- Manual check: Create 25 notes, verify page 1 (limit 20) has 20 notes, page 2 has 5.
- Report: Pagination verified with metadata and correct slicing.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backward compatibility | med | Ensure `GET /api/notes` without params still works as expected (default pagination). |
| Input validation | med | Validate that `limit` and `offset` are positive integers. |
| In-memory performance | low | Slicing in-memory arrays is fast for the expected toy dataset size. |

## Phase Sizing Rules
- Phase 1: 2 tasks (Search & Tags) - Cohesive API query improvements. Tiers: cheap -> standard.
- Phase 2: 1 task (Pagination) - Significant change to response structure and listing logic. Tier: standard.

## Notes
- Each task should result in a git commit
- Base branch: main
- Implementation branch: feat/sprint-init
