# Sprint Requirements — fleet-e2e-toy (e2e-s1.1)

## gh-toy-4ef: Add --version flag to CLI (P1 · feature)

The CLI tool must support a `--version` (or `-v`) flag that prints the current version string and immediately exits with code 0. When a user runs `./tool --version`, the output must be exactly `fleet-e2e-toy v1.0.0`, the process must exit with code 0, and the flag must function correctly when combined alongside other flags without interfering with normal operation.

**Acceptance criteria:**
- `./tool --version` prints `fleet-e2e-toy v1.0.0` to stdout
- Exit code is 0
- Flag is compatible with other flags present in the same invocation

---

## gh-toy-kbk: Implement a help command (P1 · feature)

The CLI must expose a `help` subcommand as well as `--help` / `-h` flags that print usage information covering all available commands and flags, then exit with code 0. Both invocation styles (`./tool help` and `./tool --help`) must produce equivalent, complete output so users can discover every subcommand and flag without reading source code.

**Acceptance criteria:**
- `./tool help` and `./tool --help` both work and produce the same output
- Output lists every subcommand and every flag with a short description
- Exit code is 0

---

## gh-toy-v6z: Add input validation for empty or blank strings (P1 · bug)

Currently the tool either silently proceeds or crashes when a user passes an empty string or a whitespace-only string as an argument. The correct behaviour is to detect such inputs, print a clear, user-friendly error message explaining that the argument is invalid, and exit with a non-zero exit code. A unit test must be added to prevent regressions.

**Acceptance criteria:**
- Passing an empty string argument prints a descriptive error to stderr and exits non-zero
- Passing a whitespace-only string (e.g. `"   "`) is treated the same way
- No silent failure or crash — the error message must be human-readable
- A unit test covers both the empty and whitespace cases
