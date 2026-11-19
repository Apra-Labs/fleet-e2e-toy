# Note Input Validation

Validation lives in `src/utils/validation.ts`. `validateCreateInput` is called only by the `POST /api/notes` handler.

## Content rules on create

- `content` must be a string. Non-strings are rejected with `Content must be a non-empty string`.
- An empty string (`''`) is rejected with the same message on field `content`; the empty check is an else-if after the type check, so a non-string produces only the type error.
- Whitespace-only content (e.g. `' '`) is deliberately **accepted** and stored unchanged. Content is never trimmed.
- Titles differ: they must be non-empty after trimming.

## Update

`validateUpdateInput` is intentionally unchanged and still accepts an empty `content` string. Create and update are not symmetric.

## Known gaps

- Titles have no maximum length (a TODO exists in the notes handler).
- `validateCreateInput` does no tag-count check; tags are only validated as an array of strings. No tag cap is enforced on create.
