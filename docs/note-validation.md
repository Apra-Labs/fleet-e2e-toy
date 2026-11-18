# Note Input Validation

Input validation for notes lives in `src/utils/validation.ts` (`validateCreateInput`, `validateUpdateInput`). Route handlers in `src/api/notes.ts` call these before touching the store and return `400` with `{ error: "message" }` on failure.

## Tags

- `tags`, when present, must be an array of strings. Non-array input gets the original type error.
- The duplicate check runs only after the array-of-strings check passes. A `tags` array that repeats an exact string is rejected with an error on field `tags`: `Tags must not contain duplicates`.
- Comparison is exact and case-sensitive: tags differing only in case (e.g. `Work` and `work`) are distinct and accepted.
- Applies to both create (POST) and update (PUT). A rejected POST stores nothing; a rejected PUT leaves the stored note's tags unchanged.

## Testing

Unit tests in `tests/validation.test.ts` cover the helpers; supertest API tests in `tests/notes.test.ts` cover the HTTP behaviour including no-side-effect on rejection.
