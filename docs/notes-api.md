# Notes API: count endpoint and route ordering

## GET /api/notes/count

Returns the total number of notes in the in-memory store.

- Status: `200`
- Body: `{ "count": <number> }`
- The value always equals the length of the list returned by `GET /api/notes` without filters.

## Route-order invariant

In `src/api/notes.ts`, any fixed-path GET route (such as `/count`) must be registered
before `router.get("/:id")`. Express matches routes in registration order, so a fixed path
declared after `/:id` is captured as an id and the handler answers `404 Note not found`.
Unit and integration tests guard this: `/count` must not be shadowed, and an unknown id
must still return 404.

## Deployment smoke-test note

`npm run start:test` hardcodes port 3001. If another process already holds that port, the
server exits with `EADDRINUSE`, and a `/health` check on that port is answered by the
foreign process, not the freshly built one. Do not treat such a response as a passing deploy.
