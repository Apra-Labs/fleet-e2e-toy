# Changelog

## Sprint: CLI CRUD commands, help system + input validation, --version flag

Added a brand-new CLI, "fleet-e2e-toy" (`src/cli.ts`), as a standalone HTTP
client against the existing NoteAPI Express server — no changes were made to
the existing API routes, models, or validation helpers. This closes three
source issues: `gh-toy-mi2` (CRUD commands), `gh-toy-7rp` (help system and
input validation), and `gh-toy-4ef` (--version flag).

- **CRUD subcommands**: `list [--tag] [--q]`, `read --id`, `create --title
  --content [--tags]`, `update --id [--title] [--content] [--tags]`, `delete
  --id`, each calling the corresponding NoteAPI HTTP endpoint and printing
  pretty-printed JSON to stdout on success, or `{ "error": "<message>" }` to
  stderr with a non-zero exit on failure.
- **Help system**: global `--help`/`-h` (no subcommand) prints full usage;
  `--help`/`-h` after a subcommand prints that subcommand's own usage. Both
  exit 0.
- **Input validation**: required flags (`--id`, `--title`, `--content`) reject
  missing, empty, and whitespace-only values with a consistent
  `Error: <field> is required and must not be empty` message on stderr and
  exit code 1 — no stack traces are ever surfaced.
- **--version / -v**: prints `fleet-e2e-toy v1.0.0` and exits 0; checked first,
  before help or subcommand dispatch, so it takes effect regardless of other
  flags present.
- Configuration is via the `NOTEAPI_URL` environment variable (default
  `http://localhost:3000`); no new runtime dependencies were introduced.
- Tests added in `tests/cli.test.ts`, exercising the CLI against a live
  ephemeral-port instance of the Express app.

No items were carried forward — all three source issues (P1) and all ten
sprint sub-tasks were completed and closed this sprint.
