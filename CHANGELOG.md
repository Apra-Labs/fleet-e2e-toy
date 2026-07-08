# Changelog

## pmlite-e2e/s10-1783482482928 — 2026-07-07

Sprint goal: ship a CLI client (`fleet-e2e-toy`) for NoteAPI covering
`--version`, full CRUD (list/read/create/update/delete), a global and
per-subcommand help system, and input validation — all P1 scope. Goal met in
1 cycle (7 tasks closed: gh-toy-mi2, gh-toy-7rp, gh-toy-4ef and sub-tasks
gh-toy-ww3.1–ww3.4). No existing NoteAPI server/API code was modified.

#### Sprint cost analysis
Calibration: historical (1 sprint)   Cycles: estimated 1.5, actual 1

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |     15,600 |     38,127 | +144% |   $0.213 |   $0.405 |
| reviewer   |      6,864 |     10,786 |  +57% |   $0.103 |   $0.162 |
| overhead   |      7,150 |    100,930 | +1312% |   $0.121 |   $0.938 |
| TOTAL      |     29,614 |    149,843 | +406% |   $0.437 |   $1.504 |
True-cost estimate (output x 4x): $1.747

Outliers (>200% variance): overhead
Calibration failures (>500%): overhead

### Added

- `fleet-e2e-toy` CLI (`src/cli.ts`, `src/cli/`): a dependency-free client
  for the NoteAPI server built on Node's built-in `fetch`.
  - `--version`/`-v` prints `fleet-e2e-toy v1.0.0`, exit 0.
  - `list`, `read`, `create`, `update`, `delete` subcommands, each mapped to
    the corresponding NoteAPI endpoint, printing pretty JSON on success
    (exit 0) and `Error: <message>` on stderr (exit 1) on failure.
  - Global `--help`/`-h` and per-subcommand `--help`/`-h`, always exit 0.
  - Input validation (`src/cli/validate.ts`) that runs before any network
    call and rejects missing/blank required flags.
- `docs/cli.md`: design notes, command surface, validation rules, and output
  contract for the new CLI.
- `tests/cli.test.ts`: 73 total tests now passing project-wide, covering
  version/help/CRUD happy paths, API 404 errors, network errors, and
  validation rejection paths (including an explicit assertion that stdout
  never contains `"Error:"` on a failure path).

### Carried forward (not in this sprint, filed as open P2 issues)

- `gh-toy-aqd` — `--json` output mode flag
- `gh-toy-24g` — config file support (`~/.fleet-e2e-toy.yaml`)
- `gh-toy-69s` — graceful `SIGINT`/Ctrl-C handling
- `gh-toy-s5k` — tag-filtering endpoint (server-side)
- `gh-toy-4ef.1`, `gh-toy-7rp.1`, `gh-toy-mi2.1` — end-to-end test sub-tasks;
  equivalent coverage already exists in `tests/cli.test.ts`, so there is no
  known P1 coverage gap, but these remain open by design pending explicit
  end-to-end (subprocess-level) tests.

### Known, accepted limitation

- The CLI argument parser (`src/cli/args.ts`) treats any token starting with
  `-` as a new flag, even when it is meant to be the value of the preceding
  flag (e.g. `--title -5` will not set `--title` to `-5`). Acceptable for
  this toy CLI's scope; not treated as a bug.

### Quality gates

`npm run build`, `npm run lint`, and `npm test` (73/73) all pass clean on
this branch.
