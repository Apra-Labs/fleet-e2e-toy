# NoteAPI CLI

A command-line client for the NoteAPI REST API, distributed as the `noteapi-cli` binary
(see the `bin` entry in `package.json`). It is a thin wrapper: every subcommand maps
directly onto one REST endpoint and prints the JSON (or a one-line summary) that the
API returns. It does not implement any business logic of its own — validation and
note-storage rules live in the API layer, not the CLI.

## Design goals

- **Thin client, not a second implementation.** The CLI never talks to the in-memory
  store directly; it always goes through the HTTP API (`src/cli/client.ts`), so the API
  remains the single source of truth for note behavior (id generation, timestamps,
  search/filter semantics, etc). The base URL is configurable via `NOTEAPI_BASE_URL`
  (defaults to `http://localhost:3000`), so the CLI can point at any running instance
  without a code change.
- **Non-zero exit on failure, always.** Every subcommand catches request errors and
  validation errors, writes `Error: <message>` to stderr, and sets `process.exitCode = 1`
  rather than throwing past `main`. This keeps the process exit code scriptable
  (`noteapi-cli read --id X || echo "failed"`) without ever leaking a raw stack trace to
  the user — the CLI has the same "never show raw errors" discipline as the HTTP API's
  `{ error: "message" }` convention, just expressed as stderr + exit code instead of a
  JSON body.
- **Help and version are handled before flag parsing.** `--help`/`-h` and `--version`/`-v`
  are recognized at the top of argument dispatch (globally, and per-subcommand via a
  leading help check inside each `run*` function) so that `noteapi-cli create --help`
  short-circuits before any required-flag validation runs. This means help output is
  always reachable even when other required flags are missing or malformed.
- **Validation trims and rejects blank values, not just missing ones.** A flag like
  `--title "   "` is treated the same as an absent `--title`: both are rejected with a
  descriptive `--<flag> is required and must not be empty or whitespace-only` message.
  Optional flags (`--tag`, `--q` on `list`; `--title`/`--content` on `update`) follow the
  same rule when present, but are allowed to be entirely absent. This mirrors the
  intent of the API's own input validation without duplicating its implementation.

## Subcommands

| Subcommand | Required flags | Optional flags | Maps to |
|---|---|---|---|
| `list` | — | `--tag`, `--q` | `GET /api/notes` |
| `read` | `--id` | — | `GET /api/notes/:id` |
| `create` | `--title`, `--content` | — | `POST /api/notes` |
| `update` | `--id` | `--title`, `--content` | `PUT /api/notes/:id` |
| `delete` | `--id` | — | `DELETE /api/notes/:id` |

`list` and `read` print a compact one-line-per-note summary and full JSON respectively;
`create`, `update` print the full resulting note as JSON; `delete` prints a short
confirmation line. This split (summary list vs. full single-note output) mirrors how
most REST CLIs distinguish collection views from resource views, and keeps `list`
output usable when there are many notes.

## Version string

`--version`/`-v` prints `<name> v<version>` where both fields are read from the
package's own `package.json` at runtime (not hardcoded into a constant), so the version
output tracks whatever is published, including in downstream forks that rename the
package. Note that the current implementation still has the display prefix
(`noteapi`) written as a literal string in the CLI entrypoint rather than sourced from
`package.json`'s `name` field — this is a latent inconsistency worth cleaning up before
the package is ever renamed or forked, since today's output happens to match by
coincidence.

## Error handling contract

Every subcommand follows the same three-outcome contract:

1. **Help requested** → print help text to stdout, exit 0.
2. **Validation failure** (missing/blank required flag, or a blank optional flag) →
   print `Error: <reason>` to stderr, exit 1, no network call is made.
3. **API call made** → on success, print result to stdout, exit 0; on any non-2xx
   response or network failure, print `Error: <message>` to stderr, exit 1.

The API client extracts `error` from a JSON error body when present and falls back to
a generic `Request failed with status <code>` message otherwise, so CLI error text
stays aligned with whatever the API itself reports.

## Testing approach

CLI behavior is tested end-to-end: a test harness spawns the CLI's `main()` entrypoint
in-process against a live (test-mode) instance of the Express app, captures stdout/
stderr and the exit code, and asserts on all three. This exercises the full path
(argument parsing → validation → HTTP call → output formatting) rather than mocking
the HTTP layer, so tests catch integration issues between the CLI and API contracts
that unit tests on either side alone would miss.
