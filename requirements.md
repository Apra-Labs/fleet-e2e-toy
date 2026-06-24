# Sprint P1 Requirements

## P1 Issues

### gh-toy-mi2: CLI CRUD Commands (list/read/create/update/delete)

Implement five subcommands against the NoteAPI:
- `list` — optional `--tag`/`--q` filter
- `read` — `--id` required
- `create` — `--title`, `--content` required; optional `--tags`
- `update` — `--id` required; optional `--title`/`--content`/`--tags`
- `delete` — `--id` required

Each command calls the API and prints results to stdout. Non-zero exit on API error.

**Acceptance criteria:**
- All five subcommands implemented and functional
- Each command makes correct HTTP requests to the NoteAPI
- Output is printed to stdout
- Non-zero exit code on API error

### gh-toy-7rp: CLI Help System and Input Validation

The CLI must support `--help`/`-h` flags globally and per subcommand, printing usage and exiting 0. Input validation must reject empty or whitespace-only arguments with a clear error message and non-zero exit code. No stack traces in error output.

**Acceptance criteria:**
- `--help`/`-h` works globally and per subcommand
- Empty/whitespace arguments rejected with clear error message
- Non-zero exit on validation failure
- No stack traces in output

### gh-toy-13t: Input Validation for Empty or Blank Strings

When user passes empty string or whitespace-only string as argument, reject with clear error message. Non-zero exit code. Add unit test.

**Acceptance criteria:**
- Empty/blank string arguments are rejected
- Clear error message provided
- Non-zero exit code on validation failure
- Unit tests for validation

### gh-toy-4ef: Add --version Flag to CLI

The CLI tool should support a `--version` (or `-v`) flag that prints the current version string and exits with code 0.

**Acceptance criteria:**
- `--version`/`-v` flag works
- Prints "fleet-e2e-toy v1.0.0" and exits 0
- Works alongside other flags
