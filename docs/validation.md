# Input Validation

Validation helpers live in `src/utils/validation.ts` and are called by the API handlers before any processing.

## Note title length

Titles have no maximum length on create or update. `validateCreateInput` only requires a title to be a string that is non-empty after trimming; a missing, non-string, empty or whitespace-only title yields exactly one error on field `title`. Titles are stored trimmed.

## Invariants and known gaps

- Content is only checked to be a string, so empty content is accepted on create.
- A stale TODO comment in `src/api/notes.ts` still mentions a 200-character title maximum; it is stale and no title limit is enforced.

## Update validation contract

`validateUpdateInput` is documented with a JSDoc block describing its behaviour:

- A falsy or non-object body is rejected with a single error on field `body`.
- Arrays are objects as far as the guard is concerned, so they bypass the body-level error: `validateCreateInput([])` reports the missing title and content, and `validateUpdateInput([])` is accepted as a no-op update.
- `title`, `content` and `tags` are all optional and each is checked only when present.
- `title` must be non-empty after trimming; there is no maximum length on update.
- `content` may be any string, including an empty one.
- `tags` must be an array of strings.
- Field errors are collected and returned together; `{}` is accepted as a no-op update.
- On success, `data` contains only the supplied fields, with `title` trimmed.

If a title limit is ever introduced, update this JSDoc, this document and the README together.
