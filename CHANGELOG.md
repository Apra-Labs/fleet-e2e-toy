# Changelog

## [1.0.0] — 2026-06-19 — Sprint P1: CLI Feature Set

### Sprint goal

Deliver a complete command-line interface for the NoteAPI covering full CRUD, help and input validation, and a --version flag. All three P1 epics closed and verified.

### What was implemented

**CLI CRUD commands (gh-toy-mi2)**
- Five subcommands: `list`, `read`, `create`, `update`, `delete`
- `list` supports `--tag` and `--q` filters, forwarded to the API as query parameters
- All commands exit non-zero on any error; errors go to stderr, not stdout
- API client in `src/cli/apiClient.ts` targets `/api/notes` with `NOTEAPI_URL` override support
- Full lifecycle covered by e2e tests (`tests/cli/crud.e2e.test.ts`)

**Help system and input validation (gh-toy-7rp)**
- Global `--help` / `-h` prints all subcommands and global flags
- Per-subcommand `--help` prints that subcommand's usage
- `validateRequired` in `src/cli/validate.ts` rejects empty or whitespace-only required flags
- All five handlers wire validation before the API call
- No stack traces surfaced to the user on any error path
- Covered by `tests/cli/blank-input.e2e.test.ts` and `tests/cli/help-validation.e2e.test.ts`

**Version flag (gh-toy-4ef)**
- `--version` / `-v` prints `fleet-e2e-toy v1.0.0` and exits 0
- Version string is read from `package.json` at runtime via `src/cli/version.ts`
- Works when combined with other flags; version takes priority
- Covered by `tests/cli/version.e2e.test.ts`

**CI pipeline (gh-toy-dhr)**
- GitHub Actions workflow extended to trigger on `sprint/**` branches

### Quality gates

- `npm run build` — clean
- `npm run lint` — clean
- `npm test` — 76 passed / 7 suites

### Token cost summary

Sprint cycle 1: ~27,000 input tokens, ~1,600 output tokens. 0 open P0/P1 issues at cycle close.

### Known follow-ups (non-blocking)

1. `src/cli/index.ts` lacks a `#!/usr/bin/env node` shebang — `npm link` / global install will not produce an executable binary without it.
2. The argument parser treats any value beginning with `-` in `--key value` form as a new flag. The `--key=value` form (used by all tests) is unaffected.
3. Three tag-filtering bead issues (`gh-toy-s5k`, `gh-toy-b5e`, `gh-toy-9ew`) deferred to next sprint; tag filtering is present and functional in the API but additional coverage tasks were scoped out.

### Issues closed this sprint

20 of 20 issues closed (3 P1 epics + 17 implementation/test tasks). See `bd list --status=closed` for full list.
