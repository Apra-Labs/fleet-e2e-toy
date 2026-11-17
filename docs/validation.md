# Input Validation

Validation lives in `src/utils/validation.ts` and is shared by the notes handlers in `src/api/notes.ts`.

## Title rules

- A title is required and must be non-empty on create.
- A title may be at most 100 characters (`MAX_TITLE_LENGTH`). Violations return 400 with
  `{ field: "title", message: "Title must be at most 100 characters" }`.
- Length is measured **after trimming**, so a 100-character title padded with spaces is valid.
- On update, the length check only applies when `title` is a string; an omitted title is a valid no-op update.

## Invariants

- The length check is an `else if` after the required/non-empty check, so a title never produces two errors at once.
- `validateCreateInput` and `validateUpdateInput` must stay in sync on title rules; tests cover the 100/101-character boundary for both, plus the HTTP behaviour on POST and PUT.

## Tag rules

- `tags` is optional; when present it must be an array of strings.
- A note can have at most 10 tags. Exceeding it returns 400 with
  `{ field: "tags", message: "A note can have at most 10 tags" }`. Exactly 10 is valid.
- The count check is an `else if` after the array-of-strings check, so a request produces at most one tags error.
- Both `validateCreateInput` (POST) and `validateUpdateInput` (PUT) enforce the limit and must stay in sync; tests cover the 10/11-tag boundary for both functions plus the HTTP behaviour on POST and PUT.
