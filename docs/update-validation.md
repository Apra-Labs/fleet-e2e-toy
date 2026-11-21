# Note update validation

`PUT /api/notes/:id` validates its body with `validateUpdateInput` in `src/utils/validation.ts`.

## Rules

- The body must be a JSON object; otherwise a single error is returned.
- The body must include at least one of `title`, `content` or `tags`. If all three are undefined, validation fails with one error on field `body`. This also rejects bodies containing only unknown keys.
- Any field that is present goes through the same per-field checks as on create (for example, empty strings and empty tag arrays are rejected on update).

## Behaviour notes

- The route checks that the note exists before validating, so an empty body on a missing id returns 404, not 400.
- An empty `{}` PUT is deliberately a 400, not a no-op 200. Clients that relied on the no-op must stop sending it.
- Validation failures return `{ errors: [{ field, message }] }`.

## Known gaps

- Update does not apply the title length cap or tag count cap that create applies.
- An empty `tags` array is rejected on update, so there is no way yet to clear all tags.
- Route-level tests for an empty-body PUT are missing. The rule is covered only by unit tests of the validator.
