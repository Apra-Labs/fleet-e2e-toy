# Feature: NoteAPI v2 — Search, Pagination, and Archiving

## Problem Statement
The API supports basic CRUD but lacks the query features users need for real use: filtering by tag, searching content, paginating large result sets, and archiving old notes without deleting them.

## Approach
Add four features incrementally. Each feature is independent — no ordering dependencies. All use the existing in-memory store (no database changes). Each feature must have tests before it's considered done.

## Phases

### Phase 1: Tag Filtering
- [ ] GET /api/notes?tag=work returns only notes with that tag
- [ ] Tests: single tag, no match, multiple tags on same note
- Integration test: `curl localhost:3000/api/notes?tag=work`

### Phase 2: Full-Text Search
- [ ] GET /api/notes?q=meeting searches title and content (case-insensitive)
- [ ] Tests: match in title, match in content, no match, empty query returns all
- Integration test: `curl localhost:3000/api/notes?q=meeting`

### Phase 3: Pagination
- [ ] GET /api/notes?page=1&limit=10 returns paginated results
- [ ] Response format: `{ data: [...], total: N, page: N, limit: N }`
- [ ] Default: page 1, limit 20
- Integration test: create 25 notes, verify page 1 has 20, page 2 has 5

### Phase 4: Note Archiving
- [ ] Add `archived: boolean` field to Note model (default: false)
- [ ] POST /api/notes/:id/archive and /api/notes/:id/unarchive endpoints
- [ ] GET /api/notes excludes archived by default
- [ ] GET /api/notes?include_archived=true includes them
- Integration test: archive a note, verify it's hidden, unarchive, verify it's back
