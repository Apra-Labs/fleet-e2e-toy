# Changelog

## [feat/four-p1] — 2026-06-22

### Sprint goal

Implement all four P1 CLI epics: `--version` flag, help system with input validation, blank-string validation, and full CRUD subcommands (list/read/create/update/delete) backed by a zero-dependency HTTP client.

All four P1 epics are fully implemented, tested, and pass quality gates. Build clean, lint clean, 83/83 tests pass across 7 suites.

Epic coverage:
- **gh-toy-4ef** (`--version`): `src/cli/version.ts` prints `fleet-e2e-toy v1.0.0`, exit 0, `-v` alias works. `tests/cli-version.test.ts` green.
- **gh-toy-7rp** (help + validation): `src/cli/help.ts` (global + per-subcommand for all 5 commands), `validateNonBlank` rejects blank input with non-zero exit and no stack traces. `tests/cli-help.test.ts` + `cli-validation.test.ts` green.
- **gh-toy-13t** (blank-string validation): `validateNonBlank` in `src/cli/args.ts` handles undefined/boolean/whitespace, returns trimmed value. Unit + integration tested.
- **gh-toy-mi2** (CRUD): `src/cli/commands/{list,read,create,update,delete}.ts` backed by `src/cli/apiClient.ts`. `tests/cli-crud.test.ts` exercises full create-list-filter-read-update-delete cycle against the live Express app plus missing `--id` error cases; all green.

#### Sprint cost analysis
Calibration: historical (1 sprint)   Cycles: estimated 1.5, actual 1

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |     20,400 |     51,925 | +155% |   $0.327 |   $0.825 |
| reviewer   |      8,976 |     13,321 |  +48% |   $0.144 |   $0.236 |
| overhead   |      7,150 |     50,380 | +605% |   $0.121 |   $0.660 |
| TOTAL      |     36,526 |    115,626 | +217% |   $0.592 |   $1.722 |
True-cost estimate (output x 4x): $2.367

Outliers (>200% variance): overhead
Calibration failures (>500%): overhead

### Added

- `src/cli/index.ts` — CLI entry point with flag-priority dispatch table
- `src/cli/args.ts` — `parseArgs` and `validateNonBlank` utilities
- `src/cli/version.ts` — `printVersion()` reads version from `package.json`
- `src/cli/help.ts` — `printHelp(command?)` global and per-subcommand usage
- `src/cli/apiClient.ts` — zero-dependency HTTP client wrapping all five NoteAPI operations
- `src/cli/commands/list.ts` — `list` subcommand with `--tag` and `--q` filters
- `src/cli/commands/read.ts` — `read` subcommand with required `--id`
- `src/cli/commands/create.ts` — `create` subcommand with required `--title`, `--content`, optional `--tags`
- `src/cli/commands/update.ts` — `update` subcommand with required `--id`, optional field flags
- `src/cli/commands/delete.ts` — `delete` subcommand with required `--id`
- `tests/cli-args.test.ts` — unit tests for `parseArgs` and `validateNonBlank`
- `tests/cli-version.test.ts` — integration tests for `--version`/`-v`
- `tests/cli-help.test.ts` — integration tests for global and per-subcommand help
- `tests/cli-validation.test.ts` — integration tests for blank-string rejection
- `tests/cli-crud.test.ts` — end-to-end CRUD cycle against live Express app
- `docs/cli-architecture.md` — durable design reference for the CLI layer
- `package.json` — added `cli` npm script (`ts-node src/cli/index.ts`)

### Carried forward (open P2 issues)

- gh-toy-24g: config file support (`~/.fleet-e2e-toy.yaml`)
- gh-toy-69s: graceful SIGINT handling
- gh-toy-aqd: `--json` output mode
- gh-toy-wae: CI pipeline
