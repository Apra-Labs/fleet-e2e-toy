# Input Validation

Validation helpers live in `src/utils/validation.ts` and are called by the API handlers before any processing.

## Note title length

- `MAX_TITLE_LENGTH` (100) is exported from `src/utils/validation.ts`.
- `validateCreateInput` rejects a title whose **trimmed** length exceeds 100 characters, reporting field `title` with the message `Title must be at most 100 characters`. A title of exactly 100 characters, or 100 characters plus surrounding whitespace, is accepted.
- The length check is an `else if` after the required/non-empty check, so a missing or empty title yields exactly one error.
- `POST /api/notes` maps validation errors to `400 { errors }`, so over-long titles get 400.

## Invariants and known gaps

- The limit applies to **create only**. `validateUpdateInput` deliberately still accepts longer titles, so a note can be updated past 100 characters. A unit test pins this scope; changing it is a product decision.
- The content and tags rules are unchanged by the title limit. Content is only checked to be a string, so empty content is accepted on create.
- Coverage of the title limit is at the unit level; there is no supertest test of the 400 response from the HTTP endpoint.
- A stale TODO comment in `src/api/notes.ts` still mentions a 200-character title maximum; the authoritative value is `MAX_TITLE_LENGTH`.
