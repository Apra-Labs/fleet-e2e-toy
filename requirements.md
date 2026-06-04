# Sprint Requirements: CLI Enhancements (s8.3-1780537970446)

Implement CLI features for NoteAPI including version flag, help command, and input validation.

## Deliverables

### 1. Version Flag (gh-toy-4ef)
- The CLI tool must support a `--version` (or `-v`) flag.
- Output: `fleet-e2e-toy v1.0.0`
- Exit Code: 0 on success
- Must work alongside other flags.

### 2. Help Command (gh-toy-kbk)
- The CLI tool must support a `help` subcommand and `-h` / `--help` flags.
- Both `./tool help` and `./tool --help` must work.
- It must print usage information for all available commands and flags.
- Exit Code: 0 on success.

### 3. Input Validation (gh-toy-v6z)
- The CLI tool must reject empty or whitespace-only strings passed as arguments.
- It should output a user-friendly error message.
- Exit Code: Non-zero on validation failure.
- Must add a unit test for this behavior.

## Implementation Details
- Create `src/cli.ts` as the CLI entry point.
- Implement Unix shell wrapper `./tool` (calling `npx ts-node src/cli.ts`).
- Implement Windows batch wrapper `./tool.cmd` (calling `npx ts-node src/cli.ts`).
- Use `src/utils/validation.ts` for validation functions (specifically implementing/utilizing `isBlankOrEmpty` or similar validation helpers).
- Add unit tests in `tests/validation.test.ts` or a new CLI test file.
