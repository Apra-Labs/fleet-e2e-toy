# Changelog

## pmlite-e2e/s10-1783495966513 — 2026-07-08

Sprint goal: ship a CLI client (`fleet-e2e-toy`) for NoteAPI covering `--version`,
full CRUD subcommands (list/read/create/update/delete), a help system (global and
per-subcommand), and input validation for required/blank fields. All three P1 sprint
goals (gh-toy-mi2, gh-toy-7rp, gh-toy-4ef) were implemented, tested, and merged in one
cycle.

#### Sprint cost analysis
Calibration: none   Cycles: estimated 1.5, actual 1

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |          0 |     21,518 |   n/a |   $0.000 |   $0.323 |
| reviewer   |          0 |      3,471 |   n/a |   $0.000 |   $0.052 |
| overhead   |      7,150 |     39,076 | +447% |   $0.121 |   $0.354 |
| TOTAL      |      7,150 |     64,065 | +796% |   $0.121 |   $0.729 |
True-cost estimate (output x 4x): $0.483

Outliers (>200% variance): overhead
Calibration failures (>500%): none

### Added
- `src/cli.ts` — `fleet-e2e-toy` CLI client for NoteAPI: `--version`/`-v`, `list`,
  `read`, `create`, `update`, `delete` subcommands, global and per-subcommand
  `--help`/`-h`, and validation of required/blank `--id`/`--title`/`--content` flags.
- `tests/cli.test.ts` — 50 new end-to-end tests covering version output, all CRUD
  happy paths, API error mapping (4xx/5xx), network failure handling, help output,
  and validation rejection paths. Full suite is now 71/71 passing.

### Notes
- `npm run build` and `npm run lint` are clean; no regressions in existing
  `validation.test.ts` or other suites.
- Per-subcommand `--help` intentionally takes precedence over `--version` when both
  are present alongside a recognized subcommand (e.g. `list --help --version` shows
  help, not version). This is documented and covered by tests.
- No open P1/P2 follow-ups from this sprint's scope; six pre-existing P1/P2 issues
  (config file support, SIGINT handling, `--json` output mode, tag filtering endpoint,
  a duplicate validation issue, and the parent sprint issue) remain open and were left
  untouched per policy (only P3/P4 issues are auto-deferred).
