APPROVED

Final sprint review of pmlite-e2e/s1-1782392272963 (base main).

Quality gates:
- npm run build: clean (tsc, no errors)
- npm run lint: clean (eslint, no warnings)
- npm test: 3 suites, 39/39 tests passing (validation.test.ts, notes.test.ts, cli.test.ts)

Source-issue coverage:

gh-toy-mi2 (CRUD): All five subcommands implemented in src/cli/commands/{list,read,create,update,delete}.ts. Each calls the correct HTTP method/path (/api/notes, /api/notes/:id) against the live app router (mounted at /api/notes in src/app.ts). Tests stub src/cli/http via jest.mock and verify method+path+body for every subcommand. Tags are parsed as comma-separated. Update requires at least one field. Non-2xx responses throw a "HTTP <code>: <msg>" error which is caught by the top-level handler in src/cli/index.ts and surfaced to stderr with exit 1 (verified by 404 tests for read and delete).

gh-toy-7rp (help + validation): --help / -h work at root and per subcommand; root help lists all five subcommands and global options. Empty/whitespace --title, --id reject with a clear "--<name> must be a non-empty string" message to stderr, exit 1, no stack traces. Update with no fields rejects with "at least one of --title, --content, or --tags must be provided".

gh-toy-4ef (--version): "fleet-e2e-toy v1.0.0" printed for both --version and -V, exit 0. Configured via .version() in src/cli/index.ts and verified by spawned-process tests.

Other observations:
- package.json bin field correctly points "note" -> dist/cli/index.js. engines.node >=18 pinned so the built-in fetch is available (http.ts uses global fetch).
- --base-url global option and NOTE_API_URL env var fallback both respected by every subcommand.
- Requirements.md mentions /notes paths but the actual app router lives at /api/notes; CLI correctly targets the real path. No functional gap.
- Commander exitOverride is used so help/version don't terminate inside tests; index.ts catches CommanderError and maps helpDisplayed/version to exit 0, validation errors to exit 1 with a stderr message — no raw stack traces in any tested error path.

Releasable. No regressions. No follow-up work required.

reopenIds: []
newTasks: []
