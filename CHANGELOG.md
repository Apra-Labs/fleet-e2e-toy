# Changelog

## CLI client for NoteAPI

Sprint goal: build a command-line client for the NoteAPI REST service,
covering CLI CRUD commands, a help system with input validation, and a
`--version` flag. All three P1 features were delivered and closed; no items
were carried forward.

- Added `src/cli/client.ts`: shared HTTP client (`notesClient`), base URL
  from `NOTEAPI_URL` (default `http://localhost:3000`), CLI-local response
  types independent from server internals, and `ApiError` normalizing error
  bodies (`error`/`errors` fields) into clean, stack-trace-free messages.
- Added `src/cli/validate.ts`: `validateTitle` / `validateContent` /
  `validateId`, rejecting empty or whitespace-only required arguments before
  any HTTP call is made.
- Added `src/cli.ts`: CLI entry point with argv parsing, global and
  per-subcommand `--help`/`-h` (exits 0, no network call), `--version`/`-v`
  (prints the product name and version, resolved before subcommand
  dispatch), and five CRUD subcommands (`list`, `read`, `create`, `update`,
  `delete`) wired to a `bin` entry.
- Added Jest coverage for CRUD subcommands, help/validation behavior, and
  version output/exit codes.
- Extracted durable design knowledge to `docs/cli.md`, including the key
  architectural decision that the CLI is a pure HTTP client with no imports
  of server-internal modules.

#### Sprint cost analysis
Calibration: historical (1 sprint)   Cycles: estimated 1.5, actual 1

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |     18,300 |          0 | -100% |     $NaN |   $0.000 |
| reviewer   |      8,052 |          0 | -100% |     $NaN |   $0.000 |
| overhead   |      7,150 |          0 | -100% |   $0.121 |   $0.000 |
| TOTAL      |     33,502 |          0 | -100% |     $NaN |   $0.000 |
True-cost estimate (output x 4x): $NaN

Outliers (>200% variance): none
Calibration failures (>500%): none
