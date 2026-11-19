# Note update validation

`PUT /api/notes/:id` is validated by `validateUpdateInput` in `src/utils/validation.ts`.

## Rules

- The body must be an object.
- At least one of `title`, `content` or `tags` must be present. Otherwise validation fails with a single error on the field `body`. A body with only unknown keys (e.g. `{ "foo": 1 }`) is treated the same as `{}`.
- Each field that is present is still validated by its own rule. `{ "title": null }` or `{ "title": "" }` fails on `title`, not `body`. Valid-but-empty values such as `content: ""` or `tags: []` count as "provided".

## Handler behaviour

- The handler looks up the note first, then validates. An unknown id returns 404 even for an empty body.
- An invalid body returns 400 `{ errors }`, and the stored note is left unchanged.
- Behaviour change: an empty body used to return 200 with no change. It now returns 400. Call this out for API clients.

## Operational note

The deploy runbook fixes the test server on port 3001. If another checkout already holds that port, a deploy smoke test cannot be trusted, because it would hit the other checkout's code. Deploys from several checkouts at once need a free-port sandbox option in the runbook.
