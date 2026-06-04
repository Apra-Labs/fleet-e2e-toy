# Requirements - Sprint pmlite-e2e/s8.2-1780536838068

This sprint implements the top 3 P1 issues from the beads backlog:
1. **Implement a help command** (`gh-toy-kbk`)
2. **Add input validation for empty or blank strings** (`gh-toy-v6z`)
3. **Add --version flag to CLI** (`gh-toy-4ef`)

## Issue Details & Acceptance Criteria

### 1. Implement a help command (`gh-toy-kbk`)
- **Description**: Add a help subcommand (and --help / -h flag) that prints usage information for all available commands and flags.
- **Acceptance Criteria**: 
  - `./tool help` and `./tool --help` both work.
  - Lists every subcommand and flag.
  - Exits with code 0.
- **Scope**: CLI parser and help print utility.

### 2. [BUG] Add input validation for empty or blank strings (`gh-toy-v6z`)
- **Description**: When a user passes an empty string or whitespace-only string as an argument, the tool should reject it with a clear error message instead of silently proceeding or crashing.
- **Acceptance Criteria**:
  - Passing empty or whitespace prints a user-friendly error.
  - Non-zero exit code.
  - Unit test added.
- **Scope**: Validation utilities and route/input parsing.

### 3. Add --version flag to CLI (`gh-toy-4ef`)
- **Description**: The CLI tool should support a --version (or -v) flag that prints the current version string and exits with code 0.
- **Acceptance Criteria**:
  - Running `./tool --version` prints `fleet-e2e-toy v1.0.0`.
  - Exits with code 0.
  - Works alongside other flags.
- **Scope**: CLI entry point and version constant setup.
