# Requirements — NoteAPI: Tag Filtering, Full-Text Search, Pagination

## Base Branch
`main` — branch to fork from and merge back to

## Goal
Complete and harden three partially-implemented query features on `GET /api/notes`: tag filtering, full-text search, and paginated results — so all three pass tests and compose correctly when used together.

## Features

### 1. Tag Filtering — `GET /api/notes?tag=<tag>`
- **Status:** Partially implemented — needs tests
- **Behaviour:** Returns only notes whose `tags` array contains the given tag value (case-sensitive exact match)
- **Edge cases to cover:**
  - `?tag=` (empty string) — treat as no filter (return all)
  - Tag that matches zero notes — return empty array, not 404
  - Multiple `?tag=` params — implementation choice: last wins OR array AND; decide and document in plan
- **Acceptance criteria:**
  - `GET /api/notes?tag=work` returns only notes tagged `work`
  - `GET /api/notes?tag=nonexistent` returns `[]`
  - Tests cover the above cases plus the edge cases above

### 2. Full-Text Search — `GET /api/notes?q=<query>`
- **Status:** Partially implemented — needs edge case tests
- **Behaviour:** Case-insensitive substring match against `title` and `content` fields
- **Edge cases to cover:**
  - `?q=` (empty string) — return all notes (no filter)
  - `?q=<term>` with no matches — return `[]`, not 404
  - Special characters in query (e.g. `?q=c++`, `?q=foo bar`) — must not throw; treated as literals
- **Acceptance criteria:**
  - `GET /api/notes?q=meeting` returns notes with "meeting" in title or content
  - `GET /api/notes?q=` returns all notes
  - `GET /api/notes?q=zzznomatch` returns `[]`
  - Tests cover all edge cases above

### 3. Pagination — `GET /api/notes?page=<n>&limit=<n>`
- **Status:** Not yet implemented
- **Behaviour:** Slice the result set (after any filtering/search) and wrap in metadata envelope
- **Response shape:**
  ```json
  {
    "data": [...notes...],
    "total": 42,
    "page": 2,
    "limit": 10
  }
  ```
- **Defaults:** `page=1`, `limit=10` when params absent
- **Composition:** Pagination applies AFTER tag and search filters — `total` reflects filtered count, not store size
- **Edge cases to cover:**
  - `page` or `limit` is non-numeric — return 400 with `{ "error": "..." }`
  - `page` beyond last page — return empty `data: []` with correct `total`
  - `limit=0` — return 400
  - `limit` larger than total — return all results in one page
- **Acceptance criteria:**
  - Paginated response always includes `data`, `total`, `page`, `limit`
  - `GET /api/notes?page=1&limit=2` returns first 2 notes
  - `GET /api/notes?tag=work&page=1&limit=5` paginates the filtered result
  - All edge cases tested

## Composition (All Three Together)
When all three params are present: apply tag filter → apply search filter → paginate. Order matters — `total` in the response reflects post-filter count.

Example: `GET /api/notes?tag=work&q=meeting&page=1&limit=5` → filter by tag, then search, then paginate.

## Constraints
- Node.js + Express + TypeScript — no new dependencies
- In-memory store — no database
- All handlers in `src/api/` — one file per resource
- Input validation via `src/utils/validation.ts`
- Never return raw errors — wrap in `{ "error": "message" }`
- Tests use supertest against Express app
- No `console.log` in route handlers
- No `any` types — use interfaces from `src/models/`

## Out of Scope
- Multi-tag AND/OR query composition beyond the single `?tag=` param decision
- Persistent storage
- Auth / rate limiting

## Acceptance Criteria
- [ ] `npm test` passes with all existing + new tests green
- [ ] Tag filtering, full-text search, and pagination each have dedicated test coverage
- [ ] Composition scenario (tag + search + pagination together) has at least one test
- [ ] All 400 error edge cases return `{ "error": "..." }` with status 400
- [ ] No TypeScript `any` types introduced
- [ ] `npm run lint` passes with no errors
