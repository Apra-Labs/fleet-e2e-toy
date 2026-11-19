# Note Input Validation

Validation lives in `src/utils/validation.ts`; handlers in `src/api/notes.ts` return any failure as `400` with `{ errors: [{ field, message }] }`.

## Tag cap

- `MAX_TAGS` (10) is exported from the validation module.
- `validateCreateInput` rejects a `tags` array with more than 10 entries (error on field `tags`, "Tags must contain at most 10 entries").
- The length check runs only after the array-of-strings check passes, so a malformed `tags` value keeps its original error.
- The cap applies to **create only**. `validateUpdateInput` is intentionally unchanged, so `PUT /api/notes/:id` can still set more than 10 tags. This asymmetry is a known, deliberate gap; whether updates should share the cap is an open product decision tracked in the backlog.
- Title and content rules are unaffected (content may be empty; titles have no maximum length).

## Testing

Both the unit level (`tests/validation.test.ts`) and the endpoint level (`tests/notes.test.ts`) cover the boundary (10 accepted, 11 rejected), that a rejected create stores nothing, and that PUT with 11 tags still succeeds.
