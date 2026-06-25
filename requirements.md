# Requirements: Sprint s8

Implement three P1 issues: gh-toy-mi2, gh-toy-7rp, gh-toy-4ef.

## 1. CLI CRUD Commands (gh-toy-mi2)
Implement five subcommands against the NoteAPI:
- `list`: lists notes, with optional `--tag` and `--q` filters.
- `read`: retrieves a note, `--id` required.
- `create`: creates a note, `--title` and `--content` required.
- `update`: updates a note, `--id` required, `--title` and `--content` optional.
- `delete`: deletes a note, `--id` required.

Each command must call the NoteAPI and print results to stdout. Any API error must result in a non-zero exit code.

## 2. CLI Help System and Input Validation (gh-toy-7rp)
- The CLI must support `--help` / `-h` flags globally and per subcommand.
- Usage information must be printed to stdout/stderr and exit with status 0.
- Input validation must reject empty or whitespace-only arguments.
- Failures must output a clear error message and exit with a non-zero exit code.
- No Python/Node/etc. stack traces should be shown in error output.

## 3. Version Flag (gh-toy-4ef)
- The CLI tool must support a `--version` / `-v` flag that prints `fleet-e2e-toy v1.0.0` and exits with code 0.
- This flag should work globally and alongside other flags.
