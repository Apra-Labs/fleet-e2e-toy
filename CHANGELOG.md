# Changelog

## Unreleased

### Added

- **CLI (`fleet-e2e-toy`)**: a new command-line HTTP client for the NoteAPI
  REST API (`src/cli/`), wired up via the `bin` entry in `package.json`.
  - CRUD subcommands: `list [--tag] [--q]`, `read --id`,
    `create --title --content`, `update --id [--title] [--content]`,
    `delete --id`, each mapped to the corresponding NoteAPI REST endpoint.
  - Help system: global `--help`/`-h` (usage + command list) and
    per-subcommand `--help`/`-h` (usage for that command), sourced live from
    the command registry.
  - `--version`/`-v` flag, sourced from `package.json`'s `version` field.
  - Shared CLI input validation: required arguments that are missing, empty,
    or whitespace-only are rejected before any network call, with a clear
    error message and non-zero exit — never a raw stack trace.
  - Shared HTTP client normalizes both of the server's error response shapes
    (`{ error }` and `{ errors: [...] }`) into a single readable message.
  - `NOTEAPI_URL` environment variable to point the CLI at a NoteAPI instance
    other than the `http://localhost:3000` default.

  See `docs/cli.md` for architecture and usage details.
