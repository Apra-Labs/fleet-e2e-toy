# Note Input Validation

Input validation for notes lives in `src/utils/validation.ts` and is shared by the create (POST) and update (PUT) handlers in `src/api/notes.ts`.

## Title rules

- A title is required on create. On update it is optional, but if supplied it must be non-empty.
- Titles are measured **after trimming** whitespace.
- A trimmed title must be at most 100 characters (`MAX_TITLE_LENGTH`). Exactly 100 is valid; 101 is rejected.
- A violation yields HTTP 400 with the validation error `{ field: "title", message: "Title must be at most 100 characters" }`.

## Design notes

- The maximum-length check is an `else if` after the required/non-empty check, so a request produces at most one title error.
- Create and update apply identical length semantics; the limit is defined once as a constant.
- A rejected update leaves the stored note unchanged.
