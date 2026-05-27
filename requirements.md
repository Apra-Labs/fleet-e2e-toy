# Sprint Requirements — fleet-e2e-toy (e2e-s1.1-26544203024)

Three P1 issues selected from `bd ready` for this sprint.

## Issue 1 — gh-toy-4ef: Add --version flag to CLI

**Goal:** The CLI tool should support a `--version` (or `-v`) flag that prints the current version string and exits with code 0.

**Acceptance criteria:**
- Running `./tool --version` prints `fleet-e2e-toy v1.0.0`
- Exit code 0
- Works alongside other flags

**External:** gh-1

---

## Issue 2 — gh-toy-v6z: [bug] Add input validation for empty or blank strings

**Goal:** When a user passes an empty string or whitespace-only string as an argument, the tool should reject it with a clear error message instead of silently proceeding or crashing.

**Acceptance criteria:**
- Passing empty or whitespace string prints user-friendly error message
- Non-zero exit code on invalid input
- Unit test added

**External:** gh-2

---

## Issue 3 — gh-toy-kbk: Implement a help command

**Goal:** Add a help subcommand (and `--help` / `-h` flag) that prints usage information for all available commands and flags.

**Acceptance criteria:**
- `./tool help` works
- `./tool --help` works
- Lists every subcommand and flag
- Exit code 0

**External:** gh-3
