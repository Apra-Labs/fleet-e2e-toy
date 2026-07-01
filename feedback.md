APPROVED

Final harvest review of the NoteAPI CLI sprint. All three source issues are fully delivered in src/cli.ts with unit coverage in tests/cli.test.ts.

- gh-toy-mi2 (CRUD): list/read/create/update/delete subcommands all implemented against the documented endpoints — correct HTTP verbs, paths, tag/query filters, request-body construction, and stdout output. Delete prints a confirmation. Non-2xx responses and network failures are surfaced as CliError with human-readable stderr messages and a non-zero exit (no stack traces).
- gh-toy-7rp (help + validation): global --help/-h prints usage and exits 0; per-subcommand --help/-h prints subcommand usage and exits 0; required flags are validated before any API call, and empty/whitespace-only values are rejected with a clear message and exit code 1. Optional-but-provided flags (update title/content) are also blank-checked. Unknown global flags and unknown subcommands exit 1.
- gh-toy-4ef (--version): --version/-v prints "noteapi-cli v<version>" from package.json (v1.0.0) and exits 0.

Quality gates: `npm run build` clean, `npm run lint` clean, `npm test` 85/85 passing across 3 suites. No regressions — the sprint only adds src/cli.ts and tests/cli.test.ts; the existing server and its tests are untouched. Base URL resolution honors --url flag, NOTEAPI_URL env, and the localhost default; trailing slashes are stripped.

Minor non-blocking observations (out of scope, no action required): note IDs are interpolated into the request path without encodeURIComponent — acceptable for a local CLI with simple IDs and not a security concern. JSON output mode, config persistence, and SIGINT handling were explicitly deferred to separate issues.

Releasable for what was scoped.

reopenIds: []
newTasks: []
