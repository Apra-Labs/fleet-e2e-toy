# PLAN — fleet-e2e-toy Sprint

## Phase 1: Implement all three features

### Task 1: Add --version flag (Issue #1)
- Add CLI argument parsing to the application entry point
- Read version from package.json
- When `--version` is passed, print the version string to stdout and exit with code 0
- Add tests for the --version flag

### Task 2: Add input validation for empty/blank strings (Issue #2)
- Update validation utilities in `src/utils/validation.ts`
- Reject empty or whitespace-only strings with a clear error message on stderr
- Return non-zero exit code for invalid input
- Ensure existing non-blank input works as before
- Add tests for empty/blank string validation

### Task 3: Implement --help command (Issue #3)
- Add --help flag parsing to the entry point
- Display formatted usage information covering all commands and flags
- Print to stdout and exit with code 0
- Add tests for the --help flag

### Task 4: Final verification
- Run `npm test` to ensure all tests pass
- Run `npm run lint` to ensure no lint errors
- Run `npm run build` to ensure TypeScript compiles
- Commit and push all changes
