# Tag Validation

## Create (`POST /api/notes`)

`validateCreateInput` in `src/utils/validation.ts` validates `tags`:

- Omitted tags default to `[]`.
- `tags` must be an array of strings. A non-string element yields a single error on field `tags` with the "must be an array of strings" message.
- A tag that is empty after `trim()` (`''`, `'   '`) is rejected with `{ field: 'tags', message: 'Tags must not contain empty strings' }`, and the API returns 400 with an `errors` entry. Rejected requests never reach the store.
- Valid tags are returned unchanged (not trimmed).

### Invariant: one error per failure

The empty-string check is an `else if` after the non-string check. Input such as `[1, 2]` produces exactly one error, the non-string one. Keep this ordering when editing the validator.

## Update (`PUT /api/notes/:id`)

`validateUpdateInput` deliberately does not apply the empty-string tag rule yet, so update still accepts tags like `['']`. Create and update therefore treat tags differently. This is a known inconsistency tracked as backlog.
