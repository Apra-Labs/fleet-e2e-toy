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
| overhead   |      7,150 |     35,309 | +394% |   $0.121 |   $0.388 |
| TOTAL      |     29,614 |     35,309 |  +19% |   $0.449 |   $0.388 |
True-cost estimate (output x 4x): $1.795

Outliers (>200% variance): overhead
Calibration failures (>500%): none

### Review notes

All three sprint goals are implemented, tested, and pass all quality gates.
Build (`tsc`), lint (`eslint`), and the full Jest suite (90 tests / 7 suites)
all pass clean.

- **CRUD commands**: `list` supports optional `--tag`/`--q` filters;
  `read`/`update`/`delete` require `--id`; `create` requires
  `--title`/`--content`; all return exit code 1 on API error. Covered by
  mocked-fetch tests and an end-to-end suite exercising
  create -> read -> list(filtered) -> update -> delete plus missing-id and
  missing-arg error paths.
- **Help and validation**: global and per-subcommand `--help`/`-h` print
  usage and exit 0. Blank/whitespace-only required flags are rejected with a
  JSON `{"error": ...}` on stderr and exit 1, with no stack traces emitted.
  Covered by validation tests and an end-to-end suite that explicitly asserts
  exit code, JSON-parseable stderr, and absence of stack-trace frames.
- **Version flag**: `--version`/`-v` prints a fixed version string and exits
  0, short-circuiting before command dispatch so it works alongside other
  flags and subcommands. Covered by a dedicated test asserting the exact
  output for both flag forms.

Non-blocking observations for future follow-up:
- No dedicated test asserts `--version` placed positionally after a
  subcommand (e.g. `create --title X -v`); the parser handles this correctly
  today, but it is not explicitly covered.
- Some incidental tooling/config churn (issue-tracker config, hook version
  markers, project instruction file) rode along in this sprint's diff. It
  does not affect the CLI or its tests but is worth a clean look next time
  tooling config changes.

The codebase is in a releasable state for the completed work.
