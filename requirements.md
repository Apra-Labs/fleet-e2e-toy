# Requirements — P1 issues for fleet-e2e-toy

## Base Branch
`main`

## Goal
Implement CLI features and bug fixes for fleet-e2e-toy: version flag, help subcommand/flag, and blank/empty string input validation.

## Scope
- Implement a help command (gh-toy-kbk): Support help subcommand and --help / -h flags to print usage info for all commands/flags. Exit code 0.
- [BUG] Add input validation for empty/blank strings (gh-toy-v6z): Reject empty or whitespace-only arguments with user-friendly error and non-zero exit code.
- Add --version / -v flag (gh-toy-4ef): Print fleet-e2e-toy v1.0.0 and exit 0.

## Out of Scope
- Config file support or JSON output mode (these are P2).

## Constraints
- Must run in Windows/Linux, written in TypeScript/JavaScript.

## Acceptance Criteria
- [ ] ./tool help and ./tool --help / -h prints usage for all commands and exits with 0.
- [ ] ./tool with empty or blank string as argument rejects it with a user-friendly error and exits non-zero. Unit test added.
- [ ] ./tool --version / -v prints fleet-e2e-toy v1.0.0 and exits 0.
