# Note content length limit

Note `content` is capped at `MAX_CONTENT_LENGTH` (10000 characters, measured with JS `.length`), exported from `src/utils/validation.ts`.

## Behaviour

- `validateCreateInput` and `validateUpdateInput` both reject content longer than the cap. Exactly 10000 is accepted (the check is `>`).
- The length check runs only after the existing string-type check passes, so non-string content still yields only the original type error.
- In update, the check lives inside the `content !== undefined` guard, so omitting content on PUT is unaffected.
- Both functions share one error message string.

## Design notes

- The limit is enforced only in the validation helpers. `src/api/notes.ts` needs no change: it already returns `400 { errors: [...] }` for any validation failure on POST and PUT, and it is the only caller of the validators.
- A rejected PUT leaves the stored note unchanged.
- Because `.length` counts UTF-16 code units, characters outside the BMP count as two.
