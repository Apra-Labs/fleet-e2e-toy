# Sprint Plan - fleet-e2e-toy

## P1 Issues to Implement:
1. **gh-toy-kbk: Implement a help command**
   - Add `help` subcommand and `--help` / `-h` flags.
   - List all available subcommands and flags.
   - Exit with code 0.

2. **gh-toy-v6z: Add input validation for empty strings**
   - Reject empty or whitespace-only arguments with a clear error message.
   - Exit with non-zero code.
   - Add unit tests.

3. **gh-toy-4ef: Add --version flag to CLI**
   - Add `--version` / `-v` flag.
   - Print `fleet-e2e-toy v1.0.0` and exit 0.

## Implementation Steps:
1. Initialize `src/cli.ts` using `yargs`.
2. Implement `--version` flag.
3. Implement `help` command and `--help` flag.
4. Implement `add` command with input validation for the title argument.
5. Add unit tests in `tests/cli.test.ts`.
6. Verify all tests pass.
