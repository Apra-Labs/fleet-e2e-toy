# Changelog

## Sprint s10 — CLI Features (2026-06-25)

**Sprint goal:** Add a `fleet-e2e-toy` CLI binary to the NoteAPI project, giving users a command-line interface for full CRUD access to notes.

**Implemented:**

- `fleet-e2e-toy list` — list notes with optional `--tag` and `--q` filters
- `fleet-e2e-toy read` — fetch a single note by `--id`
- `fleet-e2e-toy create` — create a note with `--title`, `--content`, and optional `--tag` (repeatable)
- `fleet-e2e-toy update` — update title and/or content of an existing note by `--id`
- `fleet-e2e-toy delete` — delete a note by `--id`
- `--help` / `-h` flags working globally and per subcommand (exit 0)
- `--version` / `-V` flag printing `fleet-e2e-toy v1.0.0` (exit 0)
- Input validation rejecting empty or whitespace-only argument values (exit 2)
- No stack traces in error output; structured `error: <message>` format on stderr
- CLI test suite covering version, help, validation, and happy-path subcommands

**Architecture:** yargs (^18.0.0, promoted to an explicit runtime dependency), built-in Node 20 `fetch` (zero new HTTP deps), entry at `src/cli/index.ts` compiled to `dist/cli/index.js`, exposed via the `bin.fleet-e2e-toy` field in `package.json`.

**Items carried forward (open):**

- gh-toy-24g (P2) — config file support (`~/.fleet-e2e-toy.yaml`)
- gh-toy-69s (P2) — graceful SIGINT handling (Ctrl-C)
- gh-toy-aqd (P2) — `--json` output mode
- gh-toy-s5k (P2) — tag filtering endpoint
- gh-toy-mi2, gh-toy-7rp, gh-toy-4ef, gh-toy-13t (P1/P2 source issues) — remain open for PM closure
