# Changelog

## [Unreleased] — Sprint feat/four-p1-v2 (2026-06-23)

### Sprint goal

Implement a full CLI (`fleet-e2e-toy`) that wraps the NoteAPI REST endpoints, covering CRUD operations, `--version` reporting, a structured help system, and blank-value input validation. All four P1 epics (gh-toy-13t, gh-toy-4ef, gh-toy-7rp, gh-toy-mi2) are complete. Quality gates (build, lint, 46/46 tests) pass. Codebase is in a releasable state for the completed P1 work.

#### Sprint cost analysis
Calibration: historical (2 sprints)   Cycles: estimated 1.5, actual 1

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |     24,000 |     33,454 |  +39% |   $0.402 |   $0.558 |
| reviewer   |      8,361 |     15,417 |  +84% |   $0.140 |   $0.263 |
| overhead   |      7,150 |     53,990 | +655% |   $0.121 |   $0.679 |
| TOTAL      |     39,511 |    102,861 | +160% |   $0.663 |   $1.501 |
True-cost estimate (output x 4x): $2.651

Outliers (>200% variance): overhead
Calibration failures (>500%): overhead

### What was implemented

- **CLI entry point** (`src/cli/index.ts`): subcommand dispatch, global flag interception (`--version`/`-v`, `--help`/`-h`), exit-code plumbing without `process.exit()`.
- **HTTP client** (`src/cli/client.ts`): typed Fetch wrapper over all five NoteAPI endpoints; `CliError` carries HTTP status; `API_BASE_URL` env var selects the target server.
- **CRUD subcommands** (`src/cli/commands/`): `list`, `read`, `create`, `update`, `delete` — each parses its own flags, validates inputs, calls the API, and returns a non-zero exit code on error.
- **Version flag** (`src/cli/version.ts`): reads version from `package.json` at require-time; prints `fleet-e2e-toy v<version>` to stdout and exits 0.
- **Help system** (`src/cli/help.ts`): global usage and per-subcommand usage strings; `--help`/`-h` before a subcommand prints per-command help, otherwise global help.
- **Input validation** (`src/cli/validation.ts`): `assertNonBlank(name, value)` — central helper used by all mutating commands; no inlining, no `any` types.
- **Test suites**: `tests/cli-version.test.ts`, `tests/cli-help-validation.test.ts`, `tests/cli-crud.test.ts` — 46 tests total across 5 suites, all passing.
- **`bin` entry** in `package.json`: `"fleet-e2e-toy": "dist/cli/index.js"`.

### Carried forward

- gh-toy-24g — config file support (`~/.fleet-e2e-toy.yaml`)
- gh-toy-43i — CI pipeline
- gh-toy-69s — SIGINT / Ctrl-C graceful handling
- gh-toy-aqd — `--json` output mode

### Final review notes

Sprint goal (all P<=1 issues) is met. Reviewed branch feat/four-p1-v2 against main (16 commits, +1096 lines).

QUALITY GATES (all pass):
- npm run build: clean (tsc, no errors)
- npm run lint: clean (eslint, no errors)
- npm test: 46/46 pass across 5 suites (cli-crud, cli-help-validation, cli-version, notes, plus app/health)

MINOR / NON-BLOCKING OBSERVATIONS:
1. Working tree is not empty: uncommitted .beads/interactions.jsonl and package-lock.json. These are passive bd export and npm metadata, not authored code in the reviewed commits. Recommend committing or discarding package-lock.json before raising the PR so the tree is clean.
2. gh-toy-s5k (tag-filtering endpoint, P2) was closed this sprint but its server-side test ("filters by tag" in tests/notes.test.ts) pre-existed on main; no new endpoint test was added on this branch. The new CLI "filters by --tag" test in cli-crud.test.ts does exercise the path indirectly. Acceptable since s5k is P2 and outside the four named P1 epics.
