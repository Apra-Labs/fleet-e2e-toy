# Changelog

## CLI: CRUD commands, help/version, and input validation

Added a `noteapi-cli` command-line client for the NoteAPI service. It supports
five subcommands (`list`, `read`, `create`, `update`, `delete`) against the
REST API, global and per-subcommand `--help`/`-h` usage output, a
`--version`/`-v` flag, and validation that rejects empty or whitespace-only
required/optional string flags with a clean JSON error and non-zero exit
code (no raw stack traces). Covered by mocked unit tests plus end-to-end
suites that boot the real Express app to verify the CLI and API agree on
request/response shapes.

#### Sprint cost analysis
Calibration: historical (1 sprint)   Cycles: estimated 1.5, actual 1

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |     15,600 |          0 | -100% |   $0.225 |   $0.000 |
| reviewer   |      6,864 |          0 | -100% |   $0.103 |   $0.000 |
| overhead   |      7,150 |     15,903 | +122% |   $0.121 |   $0.193 |
| TOTAL      |     29,614 |     15,903 |  -46% |   $0.449 |   $0.193 |
True-cost estimate (output x 4x): $1.795

Outliers (>200% variance): none
Calibration failures (>500%): none

### Review notes

All three P1 sprint goals are fully implemented, tested, and passing. Build,
lint, and the full 90-test suite (7 suites) all pass.

- **CRUD commands**: the CLI implements `list` (with `--tag`/`--q` filters),
  `read`, `create`, `update`, and `delete` against the NoteAPI, exiting
  non-zero with a JSON-wrapped `{ "error": ... }` on API or validation
  failure. Covered end-to-end by a full lifecycle test (create, filtered
  list matches and misses, update, delete) plus missing-id and
  missing-required-arg error paths on read/update/delete.
- **Help and validation**: global and per-subcommand `--help`/`-h` print
  usage to stdout and exit 0. Blank/whitespace-only required flags are
  rejected with a non-zero exit and no stack trace, via shared validation
  helpers applied consistently to required strings, optional strings, and
  repeatable string-array flags. An unknown subcommand prints a usage hint
  to stderr with a non-zero exit. Covered by an end-to-end help/validation
  suite and a parametrized per-subcommand `--help`/`-h` suite.
- **Version flag**: `--version`/`-v` prints the exact fixed version string
  from the acceptance criteria and short-circuits before any subcommand
  dispatch or network call, exiting 0. Covered by a dedicated test.

Conventions followed throughout: errors always wrapped as `{ error }`,
responses via `res.status().json()`/structured stdout-stderr writes (never
`console.log` in handlers), no `any` types, and API contracts sourced from
`src/models/` interfaces. No gaps or regressions identified; the codebase is
in a releasable state for the completed work.
