APPROVED

gh-toy-sal.6: CLI unit tests are fully implemented in tests/cli.test.ts with global fetch mocked — no running server required. All acceptance criteria are met:

- Base-URL resolution: tests cover --url flag taking priority over NOTEAPI_URL env var, env var used when no flag, default http://localhost:3000 when neither set, and trailing slash stripping.
- CRUD subcommands: each of list/read/create/update/delete has tests verifying the correct HTTP method, path, query parameters, and request body sent via fetch mock. Output printing is also verified.
- Help: global --help/-h exits 0 and prints usage; per-subcommand --help/-h prints subcommand-specific usage without making any fetch call.
- --version / -v: exits 0 and prints version matching noteapi-cli vX.Y.Z format.
- Input validation: missing required flags (--id for read/update/delete; --title/--content for create) produce CliError without calling fetch; whitespace-only values are also rejected. Exit code 1 in all cases.
- API-error handling: network failures (ECONNREFUSED) and non-2xx responses produce stderr "Error:" messages and exit code 1 from main().
- 85 tests pass, build is clean, lint passes.

reopenIds: []
newTasks: []
