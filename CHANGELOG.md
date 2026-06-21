# Changelog

## [Unreleased] — Sprint main-20260621 (2026-06-21)

### Sprint goal

Implement a fully functional CLI for the NoteAPI: `--version` flag, global and per-subcommand `--help`, input validation, and complete CRUD commands (list / read / create / update / delete). All three P1 epics (gh-toy-4ef, gh-toy-7rp, gh-toy-mi2) are closed. The goal is met: 111/111 tests pass, build and lint are clean.

Additional features delivered beyond the P1 goal: `--json` output mode for machine-readable output, graceful SIGINT handling (exit 130), and config file support via `~/.fleet-e2e-toy.yaml`.

#### Sprint cost analysis
Calibration: none   Cycles: estimated 1.5, actual 2

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |          0 |     68,635 |   n/a |   $0.000 |   $0.900 |
| reviewer   |          0 |     19,268 |   n/a |   $0.000 |   $0.289 |
| overhead   |        NaN |     24,301 |   n/a |     $NaN |   $0.190 |
| TOTAL      |        NaN |    112,204 |   n/a |     $NaN |   $1.379 |
True-cost estimate (output x 4x): $NaN

Outliers (>200% variance): none
Calibration failures (>500%): none

### What was built

- `src/cli/parse.ts` — pure argument parser (no side effects), supports `--flag value`, `--flag=value`, boolean flags, and short `-x` flags.
- `src/cli/validate.ts` — `requireFlag` / `optionalFlag` helpers that throw `CliError` on missing or blank values.
- `src/cli/types.ts` — shared `CliError` class and `ParsedArgs` / `CommandResult` interfaces.
- `src/cli/version.ts` — reads `package.json` at runtime to print `fleet-e2e-toy v<version>`.
- `src/cli/help.ts` — static global help and per-subcommand help strings.
- `src/cli/apiClient.ts` — thin `fetch` wrapper with one function per CRUD operation; throws `CliError` on HTTP errors.
- `src/cli/config.ts` — loads `~/.fleet-e2e-toy.yaml`; hand-rolled scalar YAML parser to avoid a dependency.
- `src/cli/commands/` — five command handlers: `list`, `read`, `create`, `update`, `delete`.
- `src/cli/cli.ts` — entry point, command dispatch, top-level error boundary (JSON errors, no stack traces), SIGINT handler.
- Tests: 15 new test suites under `tests/cli/` covering all commands, validation, help, version, JSON mode, SIGINT, and config.

### Carried forward

- `gh-toy-8iw` (P2): Add CI pipeline — deferred, outside P1 sprint goal.

### Non-blocking observations

- `feedback.md` is a committed reviewer artifact from cycle 1. It does not affect build or tests but should be removed before raising a PR, as reviewer feedback conventionally does not live in the repository.
- `list --tag` filtering is client-side; the server supports `?tag=` but the CLI does not use it. Functionally correct, less efficient at scale.
- The `Array.isArray(tagValue)` branch in `create.ts` is dead code because the parser uses last-value-wins for repeated flags. Harmless.
