# Requirements - CLI features (gh-toy-kbk, gh-toy-v6z, gh-toy-4ef)

## Overview
This sprint implements three key command line interface (CLI) features for the fleet-e2e-toy project. The CLI tool needs to support:
1. `--version` or `-v` flag to output the tool version.
2. `help` subcommand and `--help` / `-h` flags to display usage and subcommand info.
3. Input validation to prevent empty or whitespace-only strings from being passed as arguments to the tool.

## Key Code Locations
- CLI Entry Point: `src/cli.ts` (to be created)
- Wrapper script: `tool` (Unix shell executable wrapper using `ts-node`)
- Windows Batch wrapper: `tool.cmd` (Windows command executable wrapper using `ts-node`)
- Input validation helpers: `src/utils/validation.ts` (extend if needed)
- Tests: `tests/cli.test.ts` (to be created)

## Details and Acceptance Criteria

### 1. Version Flag (gh-toy-4ef)
- The CLI tool must support `--version` (or `-v`) flag.
- Output: `fleet-e2e-toy v1.0.0` followed by a newline.
- Exit code: `0`.
- Must work alongside other flags.

### 2. Help Command (gh-toy-kbk)
- The CLI tool must support a `help` subcommand as well as `--help` and `-h` flags.
- Output must print usage information listing all available commands and flags.
- Both `./tool help` and `./tool --help` (and `./tool -h`) must display the usage information.
- Exit code: `0`.

### 3. Input Validation (gh-toy-v6z)
- When a user passes an empty string (`""`) or a whitespace-only string (e.g. `"   "`) as an argument, the tool must reject it with a clear, user-friendly error message.
- The tool must exit with a non-zero exit code.
- Unit tests must be added in `tests/cli.test.ts` or `tests/validation.test.ts` to verify this behavior.

## Risks and Implementation Sequence
The riskiest part of this implementation is the CLI entry point setup and command/argument parsing framework. If the framework is not robust, flag combinations and edge cases will fail.
Thus, the foundation (creating the entry point, launcher scripts, and basic arg parser) must be implemented first, followed by the specific features and validation checks.
