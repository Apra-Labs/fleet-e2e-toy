CHANGES NEEDED

Sprint output is structurally complete: 13 tasks closed, `npm run build`, `npm run lint`, and `npm test` (32 tests across 3 suites) all pass; no `any` types in `src/cli/`; `--version`, `--help`/`-h`, validation, and all five CRUD subcommands are present. However, the CLI is broken against the documented default configuration, and that bug only escaped detection because the tests work around it.

## Blocker: CLI default base URL targets the wrong path

`requirements.md` (gh-toy-mi2) is explicit that the CLI calls `GET /api/notes`, `POST /api/notes`, `PUT /api/notes/:id`, etc. The Express app confirms this — `src/app.ts:7` mounts the router at `/api/notes`.

`src/cli/api-client.ts` (lines 43-78) sends requests to `${baseURL}/notes...` instead of `${baseURL}/api/notes...`. The default `NOTEAPI_URL` is `http://localhost:3000` (line 3), and the global help epilog advertises that default (`src/cli/index.ts:167`: `'Env: NOTEAPI_URL (default http://localhost:3000)'`).

Empirically verified by running the built CLI against a live server on port 3099:

```
$ NOTEAPI_URL=http://localhost:3099 node dist/cli/index.js list
error: API error 404: <!DOCTYPE html>...<pre>Cannot GET /notes</pre>...
$ NOTEAPI_URL=http://localhost:3099/api node dist/cli/index.js list
No notes found.
```

So out of the box, every CRUD command 404s. The acceptance criteria for gh-toy-mi2 ("Each command calls the API ... Non-zero exit on API error") are technically satisfied — but the CLI is non-functional against the documented API, which is not releasable.

The CLI test suite hides this by setting `baseUrl = http://127.0.0.1:${port}/api` in `tests/cli.test.ts:146` with an explicit comment: `// The API client appends /notes, so set NOTEAPI_URL to include /api prefix`. That comment is the smoking gun — the test author knew about the path mismatch and worked around it instead of fixing the client.

## Required fix

Pick one of:
- (preferred) Change the five paths in `src/cli/api-client.ts` from `/notes...` to `/api/notes...`. Then drop the `/api` suffix from `baseUrl` in `tests/cli.test.ts:146` and from the comment on line 145.
- Or change the default `NOTEAPI_URL` to `http://localhost:3000/api`, update the help epilog to match, and document that users must include `/api` in any override. This is messier because it bakes the API mount prefix into the user-visible config; the first option is cleaner.

After the fix, re-run the happy-path test without the `/api` workaround to confirm.

## Minor (not blocking)

- `src/cli/api-client.ts:53,73,77` interpolate `id` into the URL path without `encodeURIComponent`. UUIDs are safe in practice, but a defensive encode would prevent surprises if IDs ever change shape.
- The help epilog hint should match whatever the corrected default is.

## Verified working

- gh-toy-4ef (`--version`/`-V` printing `fleet-e2e-toy v1.0.0`, exits 0): correct.
- gh-toy-7rp help (`--help`/`-h` global and per-subcommand, exit 0; no stack traces; clean `error: ...` messages on unknown command, missing `--id`, empty/whitespace values, exit codes 1/2): correct.
- gh-toy-mi2 surface (all five subcommands wired with the right required/optional flags, proper validation, human-readable output): correct in shape; broken in default wiring per the blocker above.
- Build/lint/tests green; no `any` in `src/cli/`; `bin` entry registered; shebang present.

reopenIds: [gh-toy-80w.3, gh-toy-80w.12]
newTasks: []
