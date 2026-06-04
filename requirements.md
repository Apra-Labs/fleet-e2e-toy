# Sprint Requirements

This sprint implements three P1 features/bugfixes:
1. **Implement a help command** (Issue: `gh-toy-kbk`)
2. **Add input validation for empty or blank strings** (Issue: `gh-toy-v6z`)
3. **Add --version flag to CLI** (Issue: `gh-toy-4ef`)

## 1. Implement a help command (gh-toy-kbk)
- **Goal:** Add a help subcommand (and --help / -h flag) that prints usage information for all available commands and flags.
- **Acceptance Criteria:**
  - `./tool help` works.
  - `./tool --help` and `./tool -h` work.
  - Usage information listing every subcommand and flag is printed.
  - Exit code is 0.

## 2. Add input validation for empty or blank strings (gh-toy-v6z)
- **Goal:** Reject empty strings or whitespace-only strings passed as arguments with a clear error message instead of silently proceeding or crashing.
- **Acceptance Criteria:**
  - Passing empty or whitespace string prints a user-friendly error message.
  - Non-zero exit code on validation failure.
  - Unit tests added to verify this behavior.

## 3. Add --version flag to CLI (gh-toy-4ef)
- **Goal:** Support a --version (or -v) flag that prints the current version string.
- **Acceptance Criteria:**
  - Running `./tool --version` or `./tool -v` prints `fleet-e2e-toy v1.0.0`.
  - Exit code is 0.
  - Works alongside other flags.
