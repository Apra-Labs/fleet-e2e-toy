# Changelog

## sprint pmlite-e2e/s10-1782929272488 — 2026-07-01

**Sprint goal:** P1 — CLI CRUD commands, help/validation system, and --version flag.  
**Goal met:** Yes. All three P1 goals (gh-toy-mi2, gh-toy-7rp, gh-toy-4ef) and their associated test/impl subtasks are closed. 59/59 tests pass across 6 suites. No regressions in the existing notes API tests. Remaining open backlog is P2 only.

#### Sprint cost analysis
Calibration: historical (1 sprint)   Cycles: estimated 1.5, actual 1

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |     20,700 |     39,761 |  +92% |   $0.334 |   $0.592 |
| reviewer   |      9,108 |     13,026 |  +43% |     $NaN |   $0.249 |
| overhead   |      7,150 |     62,929 | +780% |   $0.121 |   $0.948 |
| TOTAL      |     36,958 |    115,716 | +213% |     $NaN |   $1.788 |
True-cost estimate (output x 4x): $NaN

Outliers (>200% variance): overhead
Calibration failures (>500%): overhead

### What was implemented

- **CLI CRUD commands** (`gh-toy-mi2`): five subcommands (`list`, `read`, `create`, `update`, `delete`) in `src/cli/commands/`. `list` supports `--tag` and `--q` filters. `read`, `update`, and `delete` require `--id`. Non-zero exit on API error via `CliError` and a typed `ExitCode` map in `src/cli/client.ts`.
- **Help and input validation** (`gh-toy-7rp`): global and per-command `--help`/`-h` implemented in `src/cli/help.ts`. Empty/whitespace args rejected in `src/cli/validation.ts`. Unknown command emits stderr usage hint and exits non-zero.
- **Version flag** (`gh-toy-4ef`): `--version`/`-v` prints `fleet-e2e-toy v1.0.0` and exits 0, short-circuiting all other flags. Version string read from `package.json` at runtime, resolving correctly in both `ts-node` and compiled `dist/` modes.

### Items carried forward (P2 backlog)

- `gh-toy-24g`: Config file support (`~/.fleet-e2e-toy.yaml`)
- `gh-toy-69s`: Graceful SIGINT handling
- `gh-toy-aqd`: JSON output mode via `--json` flag
- `gh-toy-s5k`: Tag filtering endpoint (server-side)
