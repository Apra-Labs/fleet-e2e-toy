# Changelog

All notable changes to this project will be documented in this file.

## [Sprint S8] - 2026-07-17

This sprint introduced a fully-featured command-line interface (CLI) to interact with the NoteAPI service, supporting all CRUD operations, robust input validation, and a comprehensive help/versioning system.

### Added
- **Global Version Flag (`gh-toy-4ef`)**: Added `--version` and `-v` flags. They print the version `fleet-e2e-toy v1.0.0` and immediately exit `0`, taking precedence over all other inputs.
- **CLI CRUD Subcommands (`gh-toy-mi2`)**:
  - `list`: Lists notes, supporting query (`--q`, `--query`) and tag (`--tag`, `-t`) filters.
  - `read`: Reads note details by ID.
  - `create`: Creates new notes with title, content, and tags.
  - `update`: Performs partial updates to existing notes by ID (title, content, tags).
  - `delete`: Deletes a note by ID.
- **Help System (`gh-toy-7rp`)**: Added global help (`--help` / `-h`) showing subcommands and usage syntax, and subcommand-specific help screens (e.g. `./tool create --help`).
- **CLI-Level Validation (`gh-toy-7rp`)**: Validates input arguments to reject empty or whitespace-only inputs locally. Exits with status `1` and prints clean error messages without stack traces on validation failures.
- **Dynamic Port Selection**: Configured the CLI to default to port `3000` or dynamically fetch the target NoteAPI port from the `PORT` environment variable.
- **Automated Tests**:
  - Added CLI unit tests covering help system, version flags, and validation behavior.
  - Added integration tests launching a local NoteAPI instance dynamically and verifying the full CRUD cycle.
