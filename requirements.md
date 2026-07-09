# Requirements for sprint: toy-sprint

## Goal
Implement three P1 issues for the fleet-e2e-toy CLI tool:
1. `gh-toy-mi2`: CLI CRUD commands (list/read/create/update/delete)
2. `gh-toy-7rp`: CLI help system and input validation
3. `gh-toy-4ef`: Add --version flag to CLI

## Scope

### 1. CLI CRUD Commands
The CLI must support the following five subcommands against the NoteAPI:
- `list` (optional `--tag`/`--q` filter)
- `read` (`--id` required)
- `create` (`--title`, `--content` required)
- `update` (`--id` required, `--title`/`--content` optional)
- `delete` (`--id` required)

Each subcommand should call the API and print the results to standard output. If the API returns an error, the CLI must exit with a non-zero exit code.

### 2. Help System and Input Validation
- Global and per-subcommand help: Support `--help` and `-h` flags globally and for every subcommand. When used, the tool must print usage instructions and exit with code 0.
- Input validation: Reject empty or whitespace-only arguments with a clear error message and a non-zero exit code. The error output must not contain stack traces (Python tracebacks or Node stack traces).

### 3. Version Flag
- Support a `--version` (or `-v`) flag at the top level.
- When invoked, it must print `fleet-e2e-toy v1.0.0`, exit with code 0, and work alongside other flags.

## Riskiest Assumptions
The riskiest assumption is how the CLI parsing framework interacts with input validation and the help system. We must establish a clear foundation for flag parsing and ensure that error handling (no stack traces) is enforced globally before building the subcommands.

No design phase is required for this work as it involves straightforward CLI parsing and API interactions.
