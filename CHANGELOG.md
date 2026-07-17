# Changelog

## CLI: CRUD commands, help/validation, and --version

Added a `noteapi-cli` command-line client for the NoteAPI REST API. The CLI supports
five CRUD subcommands (`list`, `read`, `create`, `update`, `delete`), global and
per-subcommand `--help`/`-h`, rejection of empty/whitespace-only argument values with
clear non-zero-exit errors, and a `--version`/`-v` flag. All three sprint goals are
implemented, tested, and pass the full quality gate suite (clean build, clean lint,
full test suite passing across all suites).

#### Sprint cost analysis
Calibration: historical (1 sprint)   Cycles: estimated 1.5, actual 1

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |     16,500 |     46,574 | +182% |   $0.238 |   $0.662 |
| reviewer   |      7,260 |     21,507 | +196% |   $0.109 |   $0.323 |
| overhead   |      7,150 |     85,704 | +1099% |   $0.121 |   $0.826 |
| TOTAL      |     30,910 |    153,785 | +398% |   $0.468 |   $1.811 |
True-cost estimate (output x 4x): $1.873

Outliers (>200% variance): overhead
Calibration failures (>500%): overhead

### Details

- **CLI CRUD commands**: `src/cli/index.ts` implements all five subcommands — `list`
  (with `--tag`/`--q` filters), `read` (`--id`), `create` (`--title`/`--content`),
  `update` (`--id` plus optional `--title`/`--content`), `delete` (`--id`). The API
  client (`src/cli/client.ts`) maps non-2xx responses to thrown errors that yield
  non-zero exit codes. Covered end-to-end by integration tests including bad-id and
  missing-flag error paths.
- **Help and validation**: global and per-subcommand `--help`/`-h` (`src/cli/help.ts`)
  print usage and exit 0; empty/whitespace-only argument values are rejected with clear
  stderr messages, non-zero exit, and no stack traces (`src/cli/validation.ts`).
- **--version**: `--version` and `-v` print the CLI's name/version string and exit 0
  with no stack trace.

### Review notes

All three sprint goals (CLI CRUD, help + validation, `--version`) are fully
implemented, tested, and pass all quality gates (clean build, clean lint, full test
suite passing). Non-source diffs are all justified: `package.json` gains a valid `bin`
entry and `cli` script for the new CLI; workflow/config files reflect ordinary tooling
adjustments; the sprint log is a durable per-branch cost log.

Non-blocking observation carried forward: the CLI's version-printing code hardcodes its
display prefix as a literal string rather than reading the package name from
`package.json`, so output is correct today but would silently diverge if the package
were ever renamed. Also pre-existing and out of scope for this sprint: note updates via
the API/model layer do not bump `updatedAt`.

No security issues and no regressions in adjacent API code; conventions are consistent
with the rest of the codebase.

## Initial release

- REST API for managing notes with tags and search (Node.js + Express + TypeScript,
  in-memory store).
