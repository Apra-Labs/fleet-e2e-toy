APPROVED

All 13 tasks meet their acceptance criteria. Build, lint, and full test suite pass.

- gh-toy-80w.1: Architecture decision recorded in notes — yargs (already present), built-in fetch (Node 20), src/cli/index.ts with bin entry fleet-e2e-toy. Criterion met.
- gh-toy-80w.2: src/cli/index.ts exists with shebang, yargs-based dispatch; package.json has bin entry; `npm run build` emits dist/cli/index.js with no errors; no-args invocation prints usage and exits 1. Criterion met.
- gh-toy-80w.3: src/cli/api-client.ts exports all five typed helpers (listNotes, getNote, createNote, updateNote, deleteNote); uses built-in fetch; base URL from NOTEAPI_URL env; non-2xx throws Error with "API error <status>: <message>" format; reuses Note/CreateNoteInput/UpdateNoteInput from src/models/note.ts. Criterion met.
- gh-toy-80w.4: src/cli/validation.ts exports CliValidationError and validateNonEmpty; error handler in index.ts catches CliValidationError, prints "error: <message>" to stderr, exits 2; no stack traces. Validation cases are covered in tests/cli.test.ts (d-section). Criterion met.
- gh-toy-80w.5: `fleet-e2e-toy list` calls GET /api/notes; --tag and --q passed as query params; empty strings rejected via validateNonEmpty; prints id+title per line or "No notes found."; exits 0 on success. Criterion met.
- gh-toy-80w.6: `fleet-e2e-toy read --id <id>` calls GET /api/notes/:id; prints id/title/tags/createdAt/content; missing/empty --id rejected; 404 surfaces as "API error 404: ..." (not a stack trace). Criterion met.
- gh-toy-80w.7: `fleet-e2e-toy create --title <t> --content <c>` calls POST /api/notes; --title and --content required and validated non-empty; prints "created <id>: <title>" on success. Criterion met.
- gh-toy-80w.8: `fleet-e2e-toy update --id <id>` calls PUT /api/notes/:id; --id required; at least one of --title/--content required (validated with clear error); each provided field validated non-empty; prints "updated <id>" on success. Criterion met.
- gh-toy-80w.9: `fleet-e2e-toy delete --id <id>` calls DELETE /api/notes/:id; prints "deleted <id>" on 204; 404 surfaces as error on stderr with non-zero exit. Criterion met.
- gh-toy-80w.10: Global --help/-h print usage + subcommands + NOTEAPI_URL hint, exit 0. Per-subcommand --help lists all flags with required/optional markers, exits 0. No args exits 1 with usage on stderr. Unknown subcommand prints "error: unknown command <x>" + usage, exits 1. No stack traces. Criterion met.
- gh-toy-80w.11: --version and -V both print exactly "fleet-e2e-toy v1.0.0" to stdout and exit 0. Version string sourced from package.json at runtime. Criterion met.
- gh-toy-80w.12: tests/cli.test.ts covers all five required scenarios: (a) --version/-V; (b) --help/-h; (c) missing --id on read/update/delete; (d) empty/whitespace --title on create; (e) happy-path list+create+read+delete against the real Express app on an ephemeral port. All 32 tests pass under npm test. Criterion met.
- gh-toy-80w.13: npm run lint exits 0, npm run build exits 0 producing dist/cli/index.js, npm test exits 0 with 32 tests passing across 3 suites. No any types in new src/cli/ code. Criterion met.

reopenIds: []
newTasks: []
