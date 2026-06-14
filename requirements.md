# Sprint Requirements — pmlite-e2e-s1

## Source Issues (P1, from bd ready)

Three P1 ready issues drive this sprint:

| ID | Title | Type |
|----|-------|------|
| gh-toy-4ef | Add --version flag to CLI | feature |
| gh-toy-v6z | Add input validation for empty or blank strings | bug |
| gh-toy-kbk | Implement a help command | feature |

## Context

This is a Node.js + TypeScript project (NoteAPI). The project needs a CLI entrypoint
(`src/cli.ts`, compiled to `dist/cli.js`) that exposes the utility commands described
below. The CLI binary should be invocable as `node dist/cli.js` (or via a `tool` npm
script). All three features are independent and low-risk.

No design doc needed — each task has one obvious implementation path.

## Feature Specifications

### 1. `--version` / `-v` flag (gh-toy-4ef)

**Acceptance criteria:**
- `node dist/cli.js --version` prints exactly `fleet-e2e-toy v1.0.0` and exits 0
- `-v` is an alias that works identically
- Flag works alongside (and takes precedence over) any other flags
- Unit test: spawn CLI, check stdout and exit code

**Implementation notes:**
- Version string `fleet-e2e-toy v1.0.0` is hardcoded (no package.json lookup needed)
- CLI entry: `src/cli.ts`
- Tests: `tests/cli.test.ts`

### 2. Input validation for empty/blank strings (gh-toy-v6z)

**Acceptance criteria:**
- Passing an empty string `""` or whitespace-only string `"   "` as an argument
  prints a user-friendly error message to stderr and exits with a non-zero code
- Error message is descriptive (e.g., "Error: argument must not be empty or blank")
- Unit test covering both empty and whitespace-only inputs added

**Implementation notes:**
- Add a `validateNonBlank(value: string, argName: string): void` helper in
  `src/utils/validation.ts` (file already exists; add to it)
- CLI should call this helper before processing any user-supplied argument
- Use exit code 1 for validation errors

### 3. Help command (gh-toy-kbk)

**Acceptance criteria:**
- `node dist/cli.js help` and `node dist/cli.js --help` / `-h` both print usage
  information for all available commands and flags, exit code 0
- Output lists every subcommand and flag with a short description
- Unit test: spawn CLI with `help` and `--help`, verify output contains expected text

**Implementation notes:**
- Help text should document: `--version` / `-v`, `help` / `--help` / `-h`
- Help output goes to stdout; exit code 0

## Risk / Priority Order

Riskiest assumption: whether TypeScript compilation and `ts-node` work cleanly for a
new CLI entrypoint. Make the `--version` flag Task 1 to prove the end-to-end CLI
pipeline first (smallest scope, binary acceptance criteria). Validation helper and
help command follow.

## Definition of Done

- All three acceptance criteria pass
- `npm test` (full Jest suite) passes with no regressions
- `npm run lint` passes
- `npm run build` compiles without errors
