# Changelog

## pmlite-e2e/s10-1783459338121 — 2026-07-07

Sprint goal: deliver a command-line client (`fleet-e2e-toy`) for the
NoteAPI service, covering CRUD operations (`gh-toy-mi2`), a help system
plus input validation (`gh-toy-7rp`), and a `--version`/`-v` flag
(`gh-toy-4ef`). All three P1 goals plus the P2 dependency
(`gh-toy-13t`, input validation for empty/blank strings) were completed
in a single cycle with no carried-forward work.

#### Sprint cost analysis
Calibration: historical (1 sprint)   Cycles: estimated 1.5, actual 1

| Role       | Est tokens | Act tokens |   D%   | Est USD  | Act USD  |
|------------|------------|------------|-------|----------|----------|
| doer       |     24,000 |     62,375 | +160% |   $0.360 |   $0.893 |
| reviewer   |     10,560 |     29,428 | +179% |   $0.158 |   $0.441 |
| overhead   |      7,150 |    133,495 | +1767% |   $0.121 |   $1.460 |
| TOTAL      |     41,710 |    225,298 | +440% |   $0.639 |   $2.794 |
True-cost estimate (output x 4x): $2.557

Outliers (>200% variance): overhead
Calibration failures (>500%): overhead

### Delivered

- **CLI CRUD commands** (`gh-toy-mi2`): `list` (`--tag`/`--q`), `read`
  (`--id`), `create` (`--title`/`--content`, optional `--tags`), `update`
  (`--id` plus optional fields), `delete` (`--id`) — all implemented in
  `src/cli/commands/*.ts` against `src/cli/apiClient.ts`. API errors surface
  as clean non-zero exits. Covered end-to-end in `tests/cli/crud.test.ts`.
- **Help system and input validation** (`gh-toy-7rp`, `gh-toy-13t`):
  `src/cli/help.ts` provides top-level and per-subcommand usage (exit 0);
  `src/cli/validation.ts`'s `requireNonBlank` rejects empty/whitespace flag
  values with `"<name> must not be empty"` and a non-zero exit, never a
  stack trace. Covered in `tests/cli/help-validation.test.ts` and
  `tests/cli/validation.test.ts`.
- **`--version`/`-v` flag** (`gh-toy-4ef`): prints exactly
  `fleet-e2e-toy v1.0.0` and exits 0. Covered in `tests/cli/version.test.ts`.

### Review notes

All three P1 sprint goals plus the P2 dependency (gh-toy-13t) are fully delivered, and every acceptance criterion checks out. Build, lint, and the full test suite (46/46) all pass. The compiled binary was verified against the exact ACs.

Goal coverage:
- gh-toy-mi2 (CRUD): list (--tag/--q), read (--id), create (--title/--content, optional --tags), update (--id + optional fields), delete (--id) all implemented in src/cli/commands/*.ts against src/cli/apiClient.ts. API errors surface as clean non-zero exits (apiClient.ts:53-61 extractErrorMessage). End-to-end tests in tests/cli/crud.test.ts exercise happy paths, bogus-id error path, and missing-flag path.
- gh-toy-7rp (help + validation): src/cli/help.ts provides top-level and per-subcommand usage exiting 0; src/cli/validation.ts requireNonBlank rejects empty/whitespace with "<name> must not be empty" and non-zero exit, no stack traces. Covered by tests/cli/help-validation.test.ts and tests/cli/validation.test.ts.
- gh-toy-4ef (--version): verified compiled binary prints exactly "fleet-e2e-toy v1.0.0" and exits 0 for both --version and -v (src/cli/index.ts:113-117, version.ts). Tested in tests/cli/version.test.ts.

File hygiene: package.json bin/cli-script additions are justified by the CLI work. src/cli/* and tests/cli/* all map to sprint tasks. sprint-logs/ and .beads/ churn are workflow/tooling artifacts (not scaffold). Note: .beads/hooks/* were rewritten and the version marker went from v1.0.5 to v1.0.4, and AGENTS.md/CLAUDE.md/.claude/settings.json show beads tooling churn (hash/marker updates, added bd-prime hooks) — this is auto-managed beads tooling, unrelated to the sprint, not a code concern and not a blocker for harvest.

Non-blocking observations (no reopen needed):
1. src/cli/commands/create.ts:25-35 — an empty-string flag value (--title '') hits the "--title is required" branch (falsy empty string) rather than the requireNonBlank "must not be empty" path. Both yield a clean non-zero error so behavior/tests are correct, but the two required-vs-blank messages are slightly inconsistent.
2. Pre-existing, out of sprint scope: src/models/note.ts:30-42 noteStore.update pins updatedAt to existing.updatedAt, so updates never bump updatedAt. Not introduced by this sprint; flag for a future task.
3. The -v/--version and -h/--help flags are only recognized in the command position, not alongside a subcommand (e.g. `create -v`). The ACs only require standalone flag behavior, which works; noting for completeness.

Codebase is in a releasable state for the completed work. Ready to harvest and raise a PR.

### Carried forward (open, deferred to backlog)

- `gh-toy-24g` (P2) — Add config file support (`~/.fleet-e2e-toy.yaml`)
- `gh-toy-69s` (P2) — Handle SIGINT gracefully (Ctrl-C)
- `gh-toy-aqd` (P2) — Add JSON output mode via `--json` flag
- `gh-toy-s5k` (P2) — Tag filtering endpoint
