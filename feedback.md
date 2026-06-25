APPROVED

The previous CHANGES NEEDED blocker is fully resolved. Both surgical fixes are in place and verified end-to-end.

## Blocker resolution

- `src/cli/api-client.ts` now uses `/api/notes` on all five paths (lines 48, 53, 66, 73, 77) — matches the Express mount in `src/app.ts`. Default `NOTEAPI_URL` of `http://localhost:3000` will now route correctly out of the box.
- `tests/cli.test.ts:145` sets `baseUrl = http://127.0.0.1:${addr.port}` with no `/api` suffix and no workaround comment. The happy-path test (create + list + read + delete) exercises every CRUD route against the real Express app on an ephemeral port — if the path mismatch had survived, all four assertions in `create, list, read, then delete a note` would 404.

## Verification

- `npm run build` exits 0 (tsc clean).
- `npm run lint` exits 0.
- `npm test` exits 0: 32 tests passing across 3 suites (notes.test.ts, validation.test.ts, cli.test.ts).
- `grep 'api/notes\|/notes' src/cli/api-client.ts` shows exactly 5 matches, all `/api/notes...`. No bare `/notes` paths remain.
- `grep 'baseUrl\|NOTEAPI_URL' tests/cli.test.ts` confirms `baseUrl` has no `/api` suffix on line 145 and is passed as `NOTEAPI_URL` to every `runCli` invocation.
- `git log -- feedback.md` shows the prior CHANGES NEEDED at 38d6b51, followed by fixes cccb342 (api-client paths) and 2dcc7d5 (test baseUrl cleanup). Sequence is correct.

## Sprint verdict

All 13 tasks under gh-toy-80w meet acceptance criteria. The CLI is now functional against the documented default configuration (`http://localhost:3000`) with no hidden test-only workaround. The previously noted minor (lack of `encodeURIComponent` on `id` interpolation in api-client.ts lines 53/73/77) is non-blocking — UUIDs are URL-safe and there is no requirement to harden against future ID-shape changes in this sprint.

reopenIds: []
newTasks: []
