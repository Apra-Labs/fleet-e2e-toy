# Requirements — Tag Filtering Endpoint

## Base Branch
`workshop` — branch to fork from and merge back to

## Implementation Branch
`sprint/tag-filtering`

## Source
`feature_list.json` (repo root):
```json
{
  "name": "Tag filtering endpoint",
  "description": "GET /api/notes?tag=work returns only notes with that tag. Already partially implemented — needs tests.",
  "passes": false
}
```

## Goal
Complete and verify the tag-filtering capability on the notes list endpoint so that
`GET /api/notes?tag=<tag>` returns only notes carrying that tag. The endpoint is reported
as already partially implemented; the primary gap is test coverage proving it works
correctly (the feature currently reports `passes: false`).

## Scope
- Confirm/complete the `tag` query-param filtering behavior on `GET /api/notes` in `src/api/`.
- Add automated tests (supertest against the Express app) covering tag filtering:
  - returns only notes that have the requested tag
  - returns an empty array when no notes match the tag
  - omitting `?tag=` returns all notes (no regression to existing list behavior)
  - input validation behavior for the `tag` param (see Constraints)
- Update `feature_list.json` `passes` to `true` only once the tests prove the feature works.

## Out of Scope
- Multi-tag filtering (`?tag=a&tag=b` or comma-separated) — not requested now; note as a possible follow-up.
- Full-text search, tag management endpoints, persistence/database changes.

## Constraints
- In-memory store only — do NOT add a database (per project CLAUDE.md).
- No `any` types — use proper interfaces from `src/models/`.
- API handlers live in `src/api/` (one file per resource); validate inputs via helpers in `src/utils/validation.ts`.
- Never return raw error objects — wrap in `{ error: "message" }`; use `res.status(code).json(...)`, never `res.send()`.
- No `console.log` in route handlers.
- Tests use supertest against the Express app, not a running server.

## Acceptance Criteria
- [ ] `GET /api/notes?tag=work` returns only notes containing the `work` tag.
- [ ] `GET /api/notes` (no tag param) returns all notes — no regression.
- [ ] Unmatched tag returns `200` with an empty array.
- [ ] New tests cover the above and pass under `npm test`.
- [ ] `npm run lint` and `npm run build` are clean.
- [ ] `feature_list.json` entry for "Tag filtering endpoint" set to `passes: true`.
