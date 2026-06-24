# Sprint Requirements

This sprint implements the top 3 P1 issues from the beads backlog:

1. **gh-toy-mi2: CLI CRUD commands (list/read/create/update/delete)**
   - Implement 5 subcommands against the NoteAPI:
     - `list`: Supports optional `--tag` and `--q` filters.
     - `read`: Requires `--id`.
     - `create`: Requires `--title` and `--content`.
     - `update`: Requires `--id`, and accepts optional `--title` and/or `--content`.
     - `delete`: Requires `--id`.
   - Each command must call the API and print results to stdout.
   - Non-zero exit code on API error.

2. **gh-toy-7rp: CLI help system and input validation**
   - Support `--help` and `-h` flags globally and per subcommand.
   - Print usage and exit with code 0.
   - Input validation must reject empty or whitespace-only arguments with a clear error message.
   - Non-zero exit code on validation errors.
   - No stack traces/tracebacks in error output.

3. **gh-toy-13t: Add input validation for empty or blank strings**
   - When a user passes an empty or whitespace-only string as an argument, reject it with a clear error message.
   - Non-zero exit code.
   - Add unit tests.
   - Reference: `gh-toy-v6z`.
