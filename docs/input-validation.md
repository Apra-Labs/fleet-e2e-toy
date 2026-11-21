# Note Input Validation

Validation lives in `src/utils/validation.ts`. `validateCreateInput` (used by POST) and `validateUpdateInput` (used by PUT) are called from `src/api/notes.ts`. On failure the handlers return HTTP 400 with `{ errors: [{ field, message }] }`.

## Rules

| Field | Create (POST) | Update (PUT) |
|-------|---------------|--------------|
| `title` | Required, non-empty after trim, at most 100 characters after trim. The stored title is the trimmed one. | Optional; if present, non-empty after trim. **No length cap.** |
| `content` | Required string | Optional string |
| `tags` | Optional array of strings; `[]` is accepted (defaults to `[]`) | Optional array of strings; `[]` is **rejected** |

## Invariants and trade-offs

- The title cap is measured after trimming, so surrounding whitespace never counts against the limit.
- The empty-tags check on update is an `else if` after the array-of-strings check, so a non-array value still reports the "array of strings" error rather than the empty-array one.
- Consequence: once a note has tags, PUT cannot remove all of them. This is deliberate per the requirement, but no other API path clears every tag.
- Create and update are intentionally asymmetric on title length, so PUT can set a title longer than create would accept. Aligning them is a known open inconsistency.
- The rules are covered by unit tests of the validators; route-level (supertest) coverage of these specific rules is a known gap.
