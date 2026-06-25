# Sprint: CLI for NoteAPI

Implement three P1 features (gh-toy-mi2, gh-toy-7rp, gh-toy-4ef) that add a
command-line interface to the NoteAPI project. No CLI exists yet — this is
greenfield work on top of an existing REST API server (Node.js + Express +
TypeScript at `src/`).

## Riskiest assumption (Task 1 must validate this)

The CLI is a **standalone script** that calls the running NoteAPI over HTTP. The
acceptance criteria for gh-toy-4ef says `./tool --version` — implying a named
executable entry point. The version string is `fleet-e2e-toy v1.0.0`. The CLI
must be wired into `package.json` `bin` (or scripts), buildable with `npm run build`,
and executable without a server running for `--help` and `--version` subcommands.
Task 1 must prove this wire-up works end-to-end before any CRUD code is written.

## Architecture decision

Use **`commander`** (v12, already present in npm ecosystem) for arg parsing.
It provides auto-generated `--help` output per subcommand, `--version` support,
and input validation hooks, satisfying gh-toy-7rp without hand-rolling argument
parsing. Install as a prod dependency. No `yargs` — less idiomatic for TypeScript.

## Source issues and acceptance criteria

### gh-toy-4ef — Add --version flag to CLI (P1)
Running `./tool --version` (or `node dist/cli.js --version`) prints:
```
fleet-e2e-toy v1.0.0
```
Exit code 0. Works alongside other flags. The `-v` short flag is also accepted.

### gh-toy-mi2 — CLI CRUD commands (P1)
Five subcommands that call the NoteAPI at a configurable base URL
(default `http://localhost:3000`):

| Subcommand | Required flags | Optional flags | Behaviour |
|------------|---------------|----------------|-----------|
| `list`     | —             | `--tag <tag>`, `--q <query>` | GET /api/notes[?tag=…][?q=…], print JSON to stdout |
| `read`     | `--id <id>`   | —              | GET /api/notes/:id, print JSON |
| `create`   | `--title <t>`, `--content <c>` | — | POST /api/notes, print created note |
| `update`   | `--id <id>`   | `--title <t>`, `--content <c>` | PUT /api/notes/:id |
| `delete`   | `--id <id>`   | —              | DELETE /api/notes/:id, print success |

Non-zero exit on API error. Print error message to stderr, not a stack trace.

### gh-toy-7rp — CLI help system and input validation (P1)
- Global `--help`/`-h` prints usage and exits 0.
- Each subcommand supports `--help`/`-h` and prints its own usage.
- Input validation: empty or whitespace-only arguments (e.g. `--title "  "`) are
  rejected with a clear error message to stderr and non-zero exit. No stack traces
  in error output anywhere.

## Out of scope for this sprint

- gh-toy-24g (config file), gh-toy-69s (SIGINT), gh-toy-aqd (JSON output mode)
- Integration against a live running server (unit tests mock the HTTP layer)

## No design.md needed

Architecture is clear: single `src/cli.ts` entry point using `commander`, compiled
to `dist/cli.js`, wired as `bin.cli` in package.json. One file per concern is
sufficient — no multi-file redesign warranted.
