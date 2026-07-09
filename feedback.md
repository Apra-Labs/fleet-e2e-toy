APPROVED

Final sprint-close review over the whole sprint output (gh-toy-k0w.1-10) against
requirements.md and the three P1 source issues. The diff adds only src/cli.ts
(329 lines), tests/cli.test.ts (176 lines), requirements.md, and feedback.md.
No changes to src/api/, src/models/, src/utils/validation.ts, or any existing
route — out-of-scope boundary respected, no regressions.

Quality gates (run in this worktree):
- npm run build — clean (tsc, no errors).
- npm run lint — clean (eslint src/ tests/).
- npm test — 3 suites, 31/31 passing (cli 11, notes 13, validation 8).
- git status --porcelain — clean before review.

gh-toy-mi2 (CLI CRUD) — met. All 5 subcommands implemented with correct HTTP
verb/path via the shared apiRequest helper (cli.ts:279-324). Success prints
pretty JSON to stdout; delete returns { deleted: id } on the API's 204. API and
network errors are caught centrally (run(), cli.ts:266-274) and emitted as
{ "error": "<message>" } to stderr with exit 1. End-to-end create->read->list->
list --tag->update->delete->read-after-delete is exercised in cli.test.ts and the
post-delete read correctly exits 1.

gh-toy-7rp (help + validation) — met. Top-level --help/-h prints full usage (exit
0); per-subcommand --help/-h prints that subcommand's usage (exit 0), checked
before handler dispatch (cli.ts:242-257). requireNonEmpty rejects missing, empty,
and whitespace-only required flags with the required "<field> is required and must
not be empty" text, exit 1, no stack trace (tests assert not.toContain("at ")).

gh-toy-4ef (--version/-v) — met. Version is checked first in run() (cli.ts:232-238)
before help/subcommand/validation, prints exactly "fleet-e2e-toy v1.0.0\n" with
exit 0, and works when combined with a subcommand.

Non-blocking observations (awareness only, not acceptance-criteria failures):
- Validation errors are wrapped in the { "error": "..." } JSON envelope, so the
  message property already carries "Error: " and the stderr blob reads
  { "error": "Error: id is required..." }. Substring required by the criteria is
  present; consistent with the repo's "never return raw error objects" convention.
- The Express API returns { errors: [...] } (plural) on server-side validation
  failure, while apiRequest reads the singular "error" key (cli.ts:89-94), so an
  API validation failure would surface the generic "NoteAPI request failed with
  status 400" rather than field detail. Not reachable for the implemented
  criteria (required-field checks are client-side; length/dup validation are
  unimplemented TODOs in notes.ts), so no impact on this sprint's scope.

Releasable. All three P1 acceptance criteria complete, no gaps, no regressions,
no hygiene issues.

reopenIds: []
newTasks: []
