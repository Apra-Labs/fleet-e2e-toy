# Changelog

## CLI: CRUD commands, help/validation, and version flag

Added a `noteapi-cli` command-line client for the NoteAPI service, covering three
sprint goals: full CRUD subcommands (`list`, `read`, `create`, `update`, `delete`)
against the REST API; a global and per-subcommand `--help`/`-h` system plus rejection
of empty/whitespace-only required arguments with clear, stack-trace-free error output;
and a `--version`/`-v` flag that prints the CLI's version and exits 0, composable with
other flags anywhere in the argument list. Build, lint, and the full test suite pass.
See `docs/cli.md` for the CLI's design (dispatch, argument parsing, validation, help,
API client, version resolution) and `README.md` for usage.

#### Sprint cost analysis
Calibration: historical (1 sprint)   Cycles: estimated 1.5, actual 1

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |     18,600 |     66,719 | +259% |   $0.261 |   $0.878 |
| reviewer   |      8,184 |     22,849 | +179% |   $0.123 |   $0.343 |
| overhead   |      7,150 |    115,744 | +1519% |   $0.121 |   $1.290 |
| TOTAL      |     33,934 |    205,312 | +505% |   $0.505 |   $2.510 |
True-cost estimate (output x 4x): $2.018

Outliers (>200% variance): doer, overhead
Calibration failures (>500%): overhead

### Notes

- One of the sprint's source tickets carried acceptance-criteria text written for a
  generic fleet smoke-test canary (a `./tool --version` binary printing a fixed,
  project-agnostic version string) rather than this project. The implementation instead
  follows this project's own `noteapi v<version>` convention, satisfying the substantive
  intent of the ticket (a working, composable version flag that exits 0) rather than the
  literal placeholder string. Filed as follow-up for the planner to review rather than
  treated as a defect.
- Deferred/backlog items (config file support, JSON output mode, SIGINT handling, tag
  filtering endpoint, additional input validation) remain open at low priority for a
  future sprint.
