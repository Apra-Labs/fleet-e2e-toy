# Requirements -- CLI Features Sprint

This sprint implements a Command Line Interface (CLI) tool for the fleet-e2e-toy project. Currently, the project is a REST API (NoteAPI) with no CLI entry point. We need to introduce a command-line script named `tool` at the project root and implement help, version, and input validation features.

## Target Issues

1. **Implement a help command (gh-toy-kbk)**
   - **Requirement**: Add a `help` subcommand and `--help` / `-h` flags to print usage information for all available commands and flags.
   - **Acceptance Criteria**:
     - Running `./tool help` or `./tool --help` or `./tool -h` lists all available subcommands and flags.
     - The output must include descriptions of how to run the tool, its subcommands, and flags.
     - The command must exit with code 0.

2. **Add input validation for empty or blank strings (gh-toy-v6z)**
   - **Requirement**: When a user passes an empty string `""` or whitespace-only string (e.g. `"   "`) as an argument to any subcommand, the tool must reject it with a clear, user-friendly error message instead of silently proceeding or crashing.
   - **Acceptance Criteria**:
     - Passing empty/whitespace arguments prints a clear error message to stderr.
     - The tool must exit with a non-zero exit code.
     - Unit tests must be added to verify this input validation behavior.

3. **Add --version flag to CLI (gh-toy-4ef)**
   - **Requirement**: Support a `--version` (or `-v`) flag that prints the current version string.
   - **Acceptance Criteria**:
     - Running `./tool --version` or `./tool -v` prints `fleet-e2e-toy v1.0.0`.
     - The command must exit with code 0.
     - The flag must work alongside other flags.

## Architecture & Implementation Notes

- **Executable Entry Point**: The CLI entry point should be a file named `tool` (executable bash/node script) at the repository root.
- **Node.js/TypeScript**: The tool should invoke the TypeScript execution environment or be compiled. A shebang like `#!/usr/bin/env ts-node` or similar can be used to run the TypeScript entry point directly, or we can compile via `npm run build` and run using node.
- **Validation logic**: Place validation helpers in `src/utils/validation.ts` or reuse existing ones.
- **Tests**: Add unit tests under the `tests/` directory to test the CLI parsing, version, help, and validation.
