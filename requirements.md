# Sprint Requirements — fleet-e2e-toy

Three oldest open issues from https://github.com/Apra-Labs/fleet-e2e-toy

---

## Issue #1 — Add --version flag to CLI

The CLI tool should support a `--version` (or `-v`) flag that prints the current version string and exits cleanly.

**Desired outcome:** Running `./tool --version` outputs something like `fleet-e2e-toy v1.0.0` and exits with code 0. The flag must not conflict with any other flags or subcommands.

**Acceptance criteria:**
- `./tool --version` prints the version string (e.g. `fleet-e2e-toy v1.0.0`)
- Exit code is 0
- Works alongside other flags without conflict

---

## Issue #2 — Add input validation for empty or blank strings

When a user passes an empty string or whitespace-only string as an argument, the tool must reject it with a clear error message rather than silently proceeding or crashing.

**Desired outcome:** Passing `""` or `"   "` as input produces a user-friendly error and a non-zero exit code, so users get immediate feedback on bad input.

**Acceptance criteria:**
- Passing `""` or `"   "` prints `Error: input must not be empty`
- Exit code is non-zero (e.g. 1)
- Unit test added covering both empty and whitespace-only cases

---

## Issue #3 — Implement a help command

Add a `help` subcommand and `--help` / `-h` flag that prints usage information for all available commands and flags.

**Desired outcome:** A user who runs `./tool help` or `./tool --help` sees a well-formatted usage summary listing every subcommand with a one-line description and every flag with its type and default value.

**Acceptance criteria:**
- `./tool help` and `./tool --help` both work
- Output lists every subcommand with a one-line description
- Output lists every flag with its type and default value
- Exit code is 0
