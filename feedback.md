CHANGES NEEDED

## Sprint Harvest Review

Final review of branch `pmlite-e2e/s1-1782316121405` (base `origin/main`) covering source issues gh-toy-mi2, gh-toy-7rp, gh-toy-13t.

### Quality gates (all green)
- `npm run build` — exits 0, `dist/cli/index.js` produced with shebang.
- `npm run lint` — exits 0.
- `npm test` — 6 suites, 65 tests, all passing.

### gh-toy-mi2 — CLI CRUD commands (list/read/create/update/delete)

Delivered (`src/cli/index.ts`, `src/cli/commands/{list,read,create,update,delete}.ts`, `src/cli/client.ts`):
- All five subcommands implemented with the flag shape required (`list` accepts `--tag`/`--q`; `read` requires `--id`; `create` requires `--title` and `--content`; `update` requires `--id` and at least one of `--title`/`--content`; `delete` requires `--id`).
- Each command prints the API response (or success message for delete) to stdout and exits non-zero on `CliError` without leaking a stack trace.
- HTTP client wrapper (`src/cli/client.ts`) defaults `baseUrl` to `http://localhost:3000`, parses JSON, treats 204 as null, raises typed `CliError` on non-2xx and on network failure.

**Gap — end-to-end paths do not match the running API.** Acceptance criterion in `requirements.md` ("All five subcommands work end-to-end") is not satisfied:
- `src/app.ts` mounts the notes router at `/api/notes` (and existing tests `tests/notes.test.ts` exercise `/api/notes`).
- The CLI builds requests against `/notes` and `/notes/:id` (e.g. `src/cli/commands/list.ts:15`, `src/cli/commands/read.ts:13`, `src/cli/commands/create.ts:17`, `src/cli/commands/update.ts:27`, `src/cli/commands/delete.ts:13`).
- Verified by running `npm run start:test` and `node dist/cli/index.js list`: hitting `/notes` returns a 404 HTML page from Express; hitting `/api/notes` returns the JSON array. The default `baseUrl` is also `http://localhost:3000`, while `npm run start:test` uses port 3001 — there is no `--base-url`/env override exposed, so the CLI cannot be aimed at the test port without code changes either.
- Note that `requirements.md` itself describes the routes as `/notes` (matching the router-internal paths in `src/api/notes.ts`), but the mount point in `src/app.ts` is `/api/notes`. The CLI followed `requirements.md` literally rather than the actually-served paths. Either the CLI must be updated to call `/api/notes` (and ideally accept a configurable base URL/port), or the server mount must change. The CLI side is the right place to fix this for the sprint scope.

Unit-test coverage for the subcommands is solid (`tests/cli/commands.test.ts` mocks the client and asserts method/path/body), but because the client is mocked, the wrong-path defect is invisible to the suite — there is no integration test that exercises the CLI against the real Express app.

### gh-toy-7rp — CLI help system and input validation

Delivered:
- `notecli --help` and `notecli -h` print global usage listing all five subcommands and exit 0 (`tests/cli/help.test.ts` runs the compiled binary as a child process and asserts exit code 0 plus presence of each subcommand name).
- `notecli <sub> --help` works for all subcommands and exits 0 (covered in `tests/cli/help.test.ts`).
- Unknown subcommand handler in `src/cli/index.ts:41-46` writes `Error: unknown subcommand '<name>'` plus usage to stderr and exits 1 (covered).
- Input validation rejects empty and whitespace-only argument values via `src/cli/validation.ts` (`validateRequiredString`, `validateOptionalString`), with the failing flag name embedded in the message. The top-level `parseAsync` catch in `src/cli/index.ts:48-56` ensures only `Error: <message>` is written to stderr — no stack traces.

This issue's requirements are met independently of the path defect.

### gh-toy-13t — Input validation for empty/blank strings

Delivered:
- `src/cli/validation.ts` rejects `""` and whitespace-only values, naming the flag (`--<flag> must be a non-empty string`).
- Wired into `create` (both `--title` and `--content`), `update` (any provided `--title`/`--content`), `read`/`delete` (`--id`).
- Unit tests in `tests/cli/validation.test.ts` cover empty and whitespace-only cases for both required and optional helpers, and `tests/cli/commands.test.ts` covers the create/update flag-rejection paths end-to-end with mocked client (non-zero exit + flag name in stderr).
- Reference to the pre-existing `src/utils/validation.ts` (gh-toy-v6z) is acknowledged by introducing CLI-side helpers rather than reusing server-side ones — reasonable given the different concerns (per-flag CLI message vs. request-body validation).

Requirements fully met.

### Regressions
None. Existing server tests (`tests/notes.test.ts`, 13 cases) and the existing source under `src/api`, `src/models`, `src/utils` are untouched.

### Releasable state
Not releasable as-is for gh-toy-mi2's end-to-end criterion: the CLI cannot successfully talk to the running NoteAPI server because it targets `/notes` instead of `/api/notes` (and has no way to override the default base URL/port to match `npm run start:test`'s port 3001). Help (gh-toy-7rp) and validation (gh-toy-13t) are individually releasable.

Recommended fix scope (single focused task): update each subcommand to use `/api/notes` (and `/api/notes/:id`), and optionally add a `--base-url` flag or `NOTECLI_BASE_URL` env var to make the host/port configurable; add at least one integration test that boots `src/app.ts` (e.g. with supertest or a temporary listening server) and exercises a real subcommand against it so this class of bug is caught.

reopenIds: [gh-toy-mi2]
newTasks: []
