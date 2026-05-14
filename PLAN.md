# Sprint Plan — fleet-e2e-toy

## Phase 1: CLI Features & Input Validation

### Task 1: `--version` flag (gh-toy-4ef)
- Create `src/cli.ts` as the CLI entry point that parses `process.argv`
- Handle `--version` / `-v` flag: print `fleet-e2e-toy v1.0.0` and exit 0
- Add `bin` field to `package.json` pointing to compiled CLI
- Add unit tests in `tests/cli.test.ts`

### Task 2: `help` command and `--help`/`-h` flag (gh-toy-kbk)
- Add `help` subcommand and `--help` / `-h` flag handling to `src/cli.ts`
- Output lists all subcommands and flags the tool supports
- Both invocation styles produce identical output, exit 0
- Add unit tests

### Task 3: Input validation for empty/whitespace strings (gh-toy-v6z)
- Validate that string arguments passed to the CLI are not empty or whitespace-only
- Print a clear error message and exit with non-zero code on bad input
- Add unit tests covering empty string, whitespace-only string, and valid input

### VERIFY
- `npm run build` passes with no errors
- `npm test` passes — all existing + new tests green
- All 3 task commits present on the sprint branch
