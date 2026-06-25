# Sprint s10: CLI Features

## Source Issues

- **gh-toy-mi2** — CLI CRUD commands (list/read/create/update/delete)
- **gh-toy-7rp** — CLI help system and input validation
- **gh-toy-4ef** — Add --version flag to CLI

## Requirement Detail

### gh-toy-mi2: CLI CRUD commands

Implement five CLI subcommands that call the NoteAPI REST endpoints:

- `list` — GET /api/notes with optional `--tag <tag>` and `--q <query>` filters; print results to stdout
- `read` — GET /api/notes/:id; `--id` required
- `create` — POST /api/notes; `--title` and `--content` required
- `update` — PUT /api/notes/:id; `--id` required; `--title` and/or `--content` optional
- `delete` — DELETE /api/notes/:id; `--id` required

Each command calls the API and prints results to stdout (human-readable or JSON). Non-zero exit on API error.

The NoteAPI is a Node.js/Express/TypeScript REST API running at a configurable base URL (default `http://localhost:3000`). See `src/api/` for existing handler patterns and `src/models/` for interfaces.

### gh-toy-7rp: CLI help system and input validation

- `--help` / `-h` flags work globally and per subcommand; print usage and exit 0
- Input validation: reject empty or whitespace-only arguments with a clear error message and non-zero exit code
- No stack traces in error output

This ties into gh-toy-mi2: the CLI built for that issue must have this help and validation wired in.

### gh-toy-4ef: --version flag

- `--version` (or `-V`) prints `fleet-e2e-toy v1.0.0` and exits 0
- Works alongside other flags (e.g. `--help`)

## Architecture Notes

The repo already has an Express API under `src/`. The CLI is a **new** top-level entry point (e.g. `src/cli/` or `cli/`). It must:

- Be a TypeScript file compiled as part of `npm run build`
- Use `commander` or `yargs` (both are likely available as transitive deps; check `package.json`) or the built-in `process.argv` if no flag library is present
- Make HTTP calls to the NoteAPI (use `axios`, `node-fetch`, or the built-in `fetch` if Node ≥ 18)

No external DB. No new dependencies unless absolutely needed. Re-use the existing `src/models/` types where possible.

## Risk / Front-loaded Task

The riskiest assumption is whether a CLI framework (`commander`/`yargs`) is already available. Task 1 must probe `package.json` and choose the implementation approach before building anything. All subsequent tasks depend on this decision.

## Design Decision

No separate `design.md` needed — the architecture is straightforward (new CLI entry point, HTTP client calls, flag library choice). The planner should wire `gh-toy-7rp` tasks as dependencies of `gh-toy-mi2` tasks so validation and help are built into the same CLI commands, not retrofitted.
