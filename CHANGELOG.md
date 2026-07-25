# Changelog

## CLI: version, help, validation, and CRUD subcommands

This sprint added a command-line client for NoteAPI (`npm run cli`), giving
the API a terminal-based interface alongside the existing HTTP surface. The
CLI supports `--version`/`-v`, global and per-subcommand `--help`/`-h`, and
five subcommands (`list`, `read`, `create`, `update`, `delete`) that map onto
the existing NoteAPI endpoints. Required flags are validated before any
network call, and all API/network failures are normalized into a single-line
`Error: <message>` on stderr with a non-zero exit code — never a raw stack
trace. All three sprint goals are met and the branch is in a releasable
state.

#### Sprint cost analysis
Calibration: historical (1 sprint)   Cycles: estimated 1.5, actual 1

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |     18,600 |     52,879 | +184% |   $0.321 |   $0.887 |
| reviewer   |      8,184 |     21,615 | +164% |   $0.141 |   $0.367 |
| overhead   |      7,150 |    117,895 | +1549% |   $0.121 |   $1.280 |
| TOTAL      |     33,934 |    192,389 | +467% |   $0.583 |   $2.535 |
True-cost estimate (output x 4x): $2.332

Outliers (>200% variance): overhead
Calibration failures (>500%): overhead

### Details

- **`--version`/`-v`**: prints a fixed `fleet-e2e-toy v1.0.0` string and exits
  0, short-circuiting before help or subcommand dispatch so it works even
  combined with other flags. Covered by tests asserting exact stdout, empty
  stderr, and no stack trace, including when combined with a subcommand.
- **Help + validation**: global usage and per-subcommand usage text; `--help`
  on any subcommand exits 0 with no side effects (verified that it never
  touches the note store). Required string flags are rejected when missing,
  empty, or whitespace-only, with a clear one-line message and non-zero exit
  before any HTTP call is made.
- **CRUD subcommands**: `list` (with `--tag`/`--q` filters), `read`,
  `create`, `update`, `delete`, implemented against a thin typed API client.
  `create`/`update` support repeatable `--tag` flags via a raw-argv re-scan,
  working around the hand-rolled parser's last-value-wins behavior for
  repeated flags. Non-2xx responses and transport failures are both
  normalized to the same error type and rendered as `Error: <message>` with
  exit code 1.

### Quality gates

`npm run build`, `npm run lint`, and `npm test` (57/57) all pass on the
sprint branch. No regressions found in the existing API code; no
`console.log` in handlers; no `any` types, consistent with the project's
coding conventions.

### Notes

- A cosmetic-only column-alignment inconsistency was observed in the global
  help text's `update` and `--help` lines. Purely visual, does not affect
  behavior or any test, and was left as-is.
- Several P2 backlog items remain open for future sprints: config file
  support, graceful SIGINT handling, a `--json` output mode, and a
  tag-filtering endpoint.
