# Sprint Requirements

## Issue 1: Add --version flag to CLI (fleet-e2e-toy-1778393401792-1-841f342d)

The CLI must support a `--version` flag that prints the current version of the application and exits with code 0. The version string should match the value declared in `package.json`. Running the tool with `--version` must not perform any other operation — it must print the version and exit immediately. Acceptance criteria: (1) `fleet-e2e-toy --version` outputs a version string in the format `x.y.z` or `fleet-e2e-toy vx.y.z`; (2) the exit code is 0; (3) no other output is produced; (4) the value matches `version` in `package.json`.

## Issue 2: Add input validation for empty or blank strings (fleet-e2e-toy-1778393401895-2-13e23129)

The CLI must reject empty or whitespace-only string inputs with a clear, human-readable error message and a non-zero exit code rather than proceeding silently or producing undefined behavior. Blank strings (spaces, tabs, newlines) must be treated the same as empty strings. Acceptance criteria: (1) passing an empty string as input prints an error message indicating the input is invalid; (2) passing a whitespace-only string produces the same error; (3) the process exits with a non-zero exit code in both cases; (4) valid non-blank input continues to be processed normally.

## Issue 3: Implement a help command (fleet-e2e-toy-1778393401973-3-86763565)

The CLI must provide a `help` command (and/or `--help` flag) that prints usage information describing all available commands, flags, and a brief description of what the tool does, then exits with code 0. The help output must be kept up to date as new commands and flags are added. Acceptance criteria: (1) `fleet-e2e-toy help` and `fleet-e2e-toy --help` both produce usage output; (2) the output lists all supported commands and flags with short descriptions; (3) the exit code is 0; (4) no unrelated side effects occur when help is invoked.
