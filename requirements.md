# Requirements - Fleet-e2e-toy Sprint

We have selected the following three P1 issues from the beads backlog to implement in this sprint:

## 1. Implement a help command (gh-toy-kbk)
- **Type**: Feature
- **Priority**: P1
- **Description**: Add a help subcommand (and --help / -h flag) that prints usage information for all available commands and flags.
- **Acceptance Criteria**:
  - `./tool help` and `./tool --help` both work.
  - Lists every subcommand and flag.
  - Exits with code 0.

## 2. Add input validation for empty or blank strings (gh-toy-v6z)
- **Type**: Bug
- **Priority**: P1
- **Description**: When a user passes an empty string or whitespace-only string as an argument, the tool should reject it with a clear error message instead of silently proceeding or crashing.
- **Acceptance Criteria**:
  - Passing empty or whitespace prints a user-friendly error.
  - Non-zero exit code.
  - Unit test added.

## 3. Add --version flag to CLI (gh-toy-4ef)
- **Type**: Feature
- **Priority**: P1
- **Description**: The CLI tool should support a --version (or -v) flag that prints the current version string and exits with code 0.
- **Acceptance Criteria**:
  - Running `./tool --version` prints `fleet-e2e-toy v1.0.0`.
  - Exits with code 0.
  - Works alongside other flags.
