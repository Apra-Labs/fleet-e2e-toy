# Version Endpoint

`GET /api/version` returns `{ "version": "<package.json version>" }` with status 200.

## Design
- Lives in `src/api/version.ts` as its own Express router, mounted at `/api/version` in `src/app.ts`.
- Reads `package.json` at request time. The path is two levels above the handler's directory, which resolves identically from `src/api` (ts-node/Jest) and `dist/api` (compiled build).
- Tests (`tests/version.test.ts`) derive the expected value from `package.json` rather than hardcoding it, so version bumps do not break them.

## Known limitations
- The file is read and parsed synchronously on every request; caching the value at load time would avoid request-path disk I/O.
- If `package.json` is unreadable, Express's default HTML error page is returned rather than the `{ error: "message" }` JSON the project conventions require.

## Not yet delivered
`GET /api/uptime` is not implemented. It is gated on an out-of-band Ops sign-off, so it must not be built until that approval exists.
