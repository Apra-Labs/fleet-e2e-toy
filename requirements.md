# Sprint Requirements: NoteAPI P1 Fixes

## Source Issues

- **gh-toy-btt** (bug, P1): Fix `updatedAt` not being set on PUT `/api/notes/:id`
- **gh-toy-t5x** (feature, P1): Add input length validation for `title` (max 200 chars) and `content` (max 10 000 chars)
- **gh-toy-534** (feature, P1): Add pagination to `GET /api/notes` (query params: `page`, `limit`)

## Issue Details

### gh-toy-btt — updatedAt bug

**Location:** `src/models/note.ts` → `noteStore.update()`

**Root cause:** The `update()` method spreads `existing` and then `updates` but explicitly preserves
`updatedAt: existing.updatedAt`, so the timestamp is never advanced.

**Impact:** Clients relying on `updatedAt` for cache invalidation or change detection see stale
timestamps. The TODO comment in `src/api/notes.ts` confirms this is a known omission.

**Risk:** Low — single-line change in one function; must also add/update a test to prove it
advances the timestamp.

### gh-toy-t5x — input length validation

**Location:** `src/utils/validation.ts` → `validateCreateInput()` and `validateUpdateInput()`

**Root cause:** Neither function enforces length limits on `title` or `content`, allowing
unbounded strings into the in-memory store.

**Impact:** Large payloads waste memory and can slow the server; no feedback to API clients
about size constraints.

**Spec:**
- `title`: max 200 characters; reject with `{ field: "title", message: "Title must be 200 characters or fewer" }`
- `content`: max 10 000 characters; reject with `{ field: "content", message: "Content must be 10000 characters or fewer" }`
- Apply in both `validateCreateInput` and `validateUpdateInput`.

**Risk:** Low — additive validation; existing valid requests are unaffected.

### gh-toy-534 — pagination

**Location:** `src/api/notes.ts` → `GET /` handler

**Root cause:** The list handler returns all notes in one response with no limit.

**Spec:**
- New query params: `page` (1-based integer, default 1) and `limit` (integer, default 20, max 100).
- Response shape changes from `Note[]` to:
  ```json
  { "data": [...], "total": N, "page": P, "limit": L, "totalPages": TP }
  ```
- Pagination is applied **after** tag and search filtering.
- Invalid `page` or `limit` (non-integer, out-of-range) → 400.
- Existing `tag` and `q` filter params are unchanged.

**Risk:** Medium — response shape change is a breaking change for existing clients and tests.
All tests referencing `GET /api/notes` must be updated to unwrap `.body.data`.

## Design notes

No shared interfaces need to change between issues. The three issues are independent and can
be implemented sequentially in a single track without cross-issue coupling. No design.md is
needed — each issue has one obvious implementation path.

Task 1 (updatedAt bug) should land first as it is the smallest and lowest-risk change.
Task 2 (length validation) is purely additive. Task 3 (pagination) is the riskiest (breaking
response shape) and should be last so earlier commits remain stable reference points.
