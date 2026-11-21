# Note Input Validation

Validation lives in `src/utils/validation.ts`. `validateCreateInput` (used by POST) and `validateUpdateInput` (used by PUT) are called from `src/api/notes.ts`. On failure the handlers return HTTP 400 with `{ errors: [{ field, message }] }`.

## Rules

| Field | Create (POST) | Update (PUT) |
|-------|---------------|--------------|
| `title` | Required, non-empty after trim, at most 100 characters after trim. The stored title is the trimmed one. | Optional; if present, non-empty after trim. **No length cap.** |
| `content` | Required string | Optional string |
| `tags` | Optional array of strings, at most 10 items; `[]` is accepted (defaults to `[]`) | Optional array of strings; `[]` is **rejected**. **No count cap.** |

## Invariants and trade-offs

- The title cap is measured after trimming, so surrounding whitespace never counts against the limit.
- The empty-tags check on update is an `else if` after the array-of-strings check, so a non-array value still reports the "array of strings" error rather than the empty-array one.
- The 10-tag cap on create is an `else if` after the array-of-strings check, so type errors are reported first. Exactly 10 tags is accepted; 11 is rejected with an error on field `tags`.
- Consequence: once a note has tags, PUT cannot remove all of them. This is deliberate per the requirement, but no other API path clears every tag.
- Create and update are intentionally asymmetric on title length, so PUT can set a title longer than create would accept. Aligning them is a known open inconsistency.
- Create and update are also asymmetric on tag count: PUT can set more than 10 tags. Whether to cap update as well is an open decision.
- The rules are covered by unit tests of the validators; route-level (supertest) coverage of these specific rules is a known gap.

## Health endpoint contract

`GET /health` returns HTTP 200 with `{ "status": "healthy" }`. The deploy smoke test spec (`deploy.md`) expects `{ "status": "ok" }`, so the two disagree and a deploy smoke test fails until one is reconciled. The integration playbook only waits for a 200 and is unaffected.
