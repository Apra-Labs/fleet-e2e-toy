# Requirements

This sprint implements the CLI foundation and resolves the top 3 P1 issues from the backlog for the NoteAPI CLI tool.

## Target Issues

### 1. gh-toy-4ef: Add --version flag to CLI
- **Description:** The CLI tool should support a `--version` (or `-v`) flag that prints the current version string and exits with code 0.
- **Acceptance Criteria:**
  - Running `./tool --version` or `./tool -v` prints `fleet-e2e-toy v1.0.0`.
  - Exits with status code `0`.
  - Works correctly alongside other flags.

### 2. gh-toy-kbk: Implement a help command
- **Description:** Add a `help` subcommand (and `--help` / `-h` flag) that prints usage information for all available commands and flags.
- **Acceptance Criteria:**
  - `./tool help` and `./tool --help` (and `./tool -h`) both print comprehensive usage info.
  - Lists every subcommand and flag.
  - Exits with status code `0`.

### 3. gh-toy-v6z: Add input validation for empty or blank strings
- **Description:** When a user passes an empty string or whitespace-only string as an argument, the tool should reject it with a clear error message instead of silently proceeding or crashing.
- **Acceptance Criteria:**
  - Passing empty or whitespace string prints a user-friendly error message.
  - Exits with non-zero exit code.
  - Unit tests added to verify this behavior.

## CLI Architecture & Launcher
Since the project currently does not have a CLI interface or a launcher script `./tool` in the root:
- We need to create a CLI entry point: `src/cli.ts`.
- We need to create a runner script `./tool` in the root of the repository.
- The `./tool` script must be executable and delegate command execution to the typescript CLI entrypoint (either via `ts-node` directly or after compiling).
- Ensure linting and tests are fully functional and pass.

## Design Note
No formal `design.md` is needed for this sprint, as the CLI implementation follows standard Unix CLI conventions and integrates directly into the existing in-memory store architecture.

