Build passes, lint is clean, all 38 tests pass. Two tasks have acceptance-criteria gaps in test coverage:

---

**gh-toy-8ga — [impl] Add --version/-v flag to CLI** (REOPENED)

The implementation is correct: `--version` and `-v` both cause `main()` to print `fleet-e2e-toy v1.0.0` and return 0. The version number is sourced from `package.json`.

Missing tests in `tests/cli.test.ts`:
- No test for `main(['--version'])` verifying it returns 0.
- No test for `main(['-v'])` verifying it returns 0.
- No test capturing the printed string (e.g. via `jest.spyOn(process.stdout, 'write')`).

The acceptance criteria states: "Running CLI with --version or -v prints exactly 'fleet-e2e-toy v1.0.0' to stdout and main() returns 0." Currently only the parser behaviour is tested (`parseArgs(['--version']).flags.version === true`), not the `main()` return value or stdout output.

Side note: `/src/cli/version.ts` line 13 hardcodes the string prefix `fleet-e2e-toy` rather than reading `package.json`'s `name` field (which is `noteapi`). The version number is read from package.json, but the task description says "reading version from package.json (import or fs read)" and "reads version from package.json not a hardcoded duplicate." The prefix should also be read from `packageJson.name` to be truly sourced from package.json.

---

**gh-toy-hxg — [impl] Add --help/-h help system** (REOPENED)

The implementation is correct: `src/cli/help.ts` exists, `globalHelp()` and `commandHelp(command)` work, all five subcommands are listed, and `main()` routes both paths correctly.

Missing tests in `tests/cli.test.ts`:
- No test for `main(['--help'])` returning 0.
- No test for `main(['-h'])` returning 0.
- No test for `main(['create', '--help'])` (or any subcommand) returning 0 with per-command help output.

The acceptance criteria states: "main(['--help']) and main(['-h']) print global usage and return 0; main(['<cmd>','--help']) prints per-command usage and returns 0." Currently only `parseArgs(['--help']).flags.help === true` is tested.

---

**gh-toy-teo — [impl] Add CLI API client for NoteAPI** (APPROVED)

`src/cli/apiClient.ts` exists and exports all five required functions (`listNotes`, `getNote`, `createNote`, `updateNote`, `deleteNote`) with correct signatures. Base URL is configurable via `NOTEAPI_URL` env var. Non-2xx responses throw an `Error` with the server-provided message. No `any` types; imports from `src/models/note`. tsc passes. No tests were required by the AC and none were added.

---

**gh-toy-13t — [impl] Add input validation for empty or blank strings** (APPROVED)

`src/cli/validate.ts` exports `validateRequired(name, value)` and `ValidationError`. The function rejects `undefined`, empty, and whitespace-only strings, returning the trimmed value on success. `tests/cliValidate.test.ts` covers all cases including field name in error message. The AC's "required CLI flags reject" clause is satisfied at the unit level; full CLI integration awaits downstream command-handler tasks (gh-toy-hxb, gh-toy-ddh), which is acceptable at this stage.
