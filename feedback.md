APPROVED

## Sprint Harvest Re-Review (post path-fix)

Final review of branch `pmlite-e2e/s1-1782316121405` (base `origin/main`) covering source issues gh-toy-mi2, gh-toy-7rp, gh-toy-13t. Re-review after the path-mismatch fix in commit c0aef6c (m5w.10).

### Quality gates (all green)
- `npm run build` — exits 0, `dist/cli/index.js` is produced.
- `npm run lint` — exits 0.
- `npm test` — 6 suites, 65 tests, all passing.

### Live end-to-end smoke (new this round)
Started the server with `PORT=3002 npx ts-node src/index.ts` and exercised the compiled CLI with `NOTECLI_BASE_URL=http://localhost:3002 node dist/cli/index.js ...`:
- `list` → `[]` (empty store).
- `create --title T1 --content C1` → returns the created note JSON with a fresh UUID and timestamps.
- `read --id <uuid>` → returns the same note.
- `update --id <uuid> --title T1-updated` → returns the note with updated title and refreshed `updatedAt`.
- `delete --id <uuid>` → prints `Note deleted successfully.` and exits 0.
- Final `list` → `[]`.

All five CRUD subcommands now hit `/api/notes` (and `/api/notes/:id`) and round-trip correctly against the real Express app. The previous-round blocker is resolved.

### gh-toy-mi2 — CLI CRUD commands (list/read/create/update/delete)
- Five subcommands implemented in `src/cli/index.ts` and `src/cli/commands/{list,read,create,update,delete}.ts` with the required flag shapes (`list [--tag] [--q]`; `read --id`; `create --title --content`; `update --id [--title] [--content]` with at-least-one enforcement; `delete --id`).
- Paths fixed to `/api/notes` / `/api/notes/:id` across all subcommands (verified with grep — no stray `/notes` literal remains in `src/cli/`).
- `httpClient` (`src/cli/client.ts:19`) now picks `options.baseUrl` → `NOTECLI_BASE_URL` env var → `http://localhost:3000` default, which makes the CLI usable against `start:test` (port 3001) without code changes.
- Stdout prints API JSON (or "Note deleted successfully." for delete); non-2xx and network failures raise `CliError` and exit non-zero with a clean message (no stack trace). Confirmed live and via unit tests.
- Unit tests in `tests/cli/commands.test.ts` were updated alongside the path fix and assert the new `/api/notes...` paths and bodies.

Acceptance criteria met end-to-end.

### gh-toy-7rp — CLI help system and input validation
- `notecli --help` and `notecli -h` exit 0 and list all five subcommands (re-verified live; also covered by `tests/cli/help.test.ts` via child-process invocation of the compiled binary).
- `notecli <sub> --help` exits 0 for every subcommand (covered).
- Unknown subcommand handler in `src/cli/index.ts` writes `Error: unknown subcommand '<name>'` + usage to stderr and exits 1 (re-verified live).
- Validation rejects empty / whitespace-only flag values with a clear, flag-named message and exits 1 with no stack trace (re-verified live with `--title ""` and `--title "  "`).

Acceptance criteria met.

### gh-toy-13t — Input validation for empty/blank strings
- `src/cli/validation.ts` `validateRequiredString` and `validateOptionalString` reject `""` and whitespace-only values, embedding the flag name (`--<flag> must be a non-empty string`).
- Wired into `create` (title + content), `update` (any provided title/content), `read`/`delete` (id).
- `tests/cli/validation.test.ts` covers both empty and whitespace-only cases for required and optional helpers, plus flag-name assertion. `tests/cli/commands.test.ts` additionally exercises create/update rejection through the command layer.
- Reference to pre-existing `src/utils/validation.ts` (gh-toy-v6z) is acknowledged by introducing dedicated CLI-side helpers — appropriate separation of concerns (per-flag CLI message vs. request-body validation).

Acceptance criteria met.

### Regressions
None. Existing server source (`src/api`, `src/models`, `src/utils`, `src/app.ts`) and the existing `tests/notes.test.ts` suite (13 cases against `/api/notes`) are untouched and still green.

### Non-blocking observations (not reopening)
- Cosmetic: the subcommand `catch` blocks print `Error: ${String(err)}`, and since `String(Error)` is `"Error: <message>"`, the user sees a duplicated prefix (e.g. `Error: Error: --title must be a non-empty string`). Behavior is correct (non-zero exit, clear message, no stack), but a future polish could switch to `err instanceof Error ? err.message : String(err)`. Same observation as the prior round; deliberately not blocking.
- The CLI is exercised end-to-end only manually; the test suite still mocks the HTTP client. A future hardening task could add a supertest-style integration test that boots `src/app.ts` in-process so a recurrence of the path-mismatch class of bug is caught automatically. Not opening — covered well enough by the path fix + live smoke for this sprint.

### Releasable state
Releasable. All three source-issue acceptance criteria are satisfied, the path-mismatch blocker from the previous round is fixed, all quality gates pass, and a live end-to-end smoke against the real server confirms every subcommand works.

reopenIds: []
newTasks: []
