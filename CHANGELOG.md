# Changelog

## CLI: CRUD commands, help system, and version flag

Added a `noteapi` command-line client for the existing REST API. The CLI implements the
full note lifecycle (`list`, `read`, `create`, `update`, `delete`) as thin wrappers over the
HTTP API, with `--tag`/`--q` filtering on `list`, per-subcommand required-flag validation
with readable errors, global and per-subcommand `--help`/`-h` output, and a `--version`/`-v`
flag. All error paths (HTTP failures, validation failures, unknown commands) exit non-zero
and print a readable message to stderr — never a raw stack trace. Covered by unit tests per
concern plus an end-to-end test that drives the CLI against the real Express app over HTTP
through the full create/read/list/update/delete lifecycle. See `docs/cli.md` for the
internal design.

No items were carried forward — all sprint goals were completed and verified.

#### Sprint cost analysis
Calibration: historical (1 sprint)   Cycles: estimated 1.5, actual 1

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |     26,100 |     57,678 | +121% |   $0.424 |   $0.902 |
| reviewer   |     11,484 |     14,903 |  +30% |   $0.191 |   $0.271 |
| overhead   |      7,150 |    116,057 | +1523% |   $0.121 |   $1.391 |
| TOTAL      |     44,734 |    188,638 | +322% |   $0.736 |   $2.564 |
True-cost estimate (output x 4x): $2.944

Outliers (>200% variance): overhead
Calibration failures (>500%): overhead
