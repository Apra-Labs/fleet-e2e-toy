# Tag Validation

Note inputs are validated in `src/utils/validation.ts` by `validateCreateInput` and `validateUpdateInput`. Both delegate tag checks to a shared private helper, `validateTags`, so create (POST) and update (PUT) behave identically.

## Rules

- `tags` must be an array of strings. If not, the error is reported on field `tags` with the "array of strings" message.
- Each tag must be at most `MAX_TAG_LENGTH` (30) characters. A longer tag yields `{ field: "tags", message: "Each tag must be at most 30 characters" }`.
- Duplicate tags are not rejected; they are stored as given.

## Invariants

- The length check runs only if the type check passed. A non-string tag produces only the type error, never a length error, so clients are not shown two errors for one mistake.
- Routes in `src/api/notes.ts` answer HTTP 400 with `{ errors: [...] }` when validation fails, so adding a rule to the validators needs no route change. A rejected PUT leaves the stored note unchanged.

## Known limitation

Length is measured with `String.length`, which counts UTF-16 code units, not visible characters. A tag of 16 emoji (32 code units) is rejected even though it looks shorter than 30 characters. Whether to count code points instead is an open product decision.
