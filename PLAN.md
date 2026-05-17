# fleet-e2e-toy - Implementation Plan

> Implement the 3 assigned issues from the requirements: help command, version flag, and blank string validation.

---

## Tasks

### Phase 1: CLI Foundation

#### Task 1: Create CLI entry point and wrapper script
- **Change:** Create `src/cli.ts` as the CLI entry point. Create a root `tool` script (shebang + `npx ts-node`) and `tool.cmd` for Windows.
- **Files:** `src/cli.ts`, `tool`, `tool.cmd`
- **Tier:** standard
- **Done when:** Running `./tool` executes without error (even if it does nothing yet).
- **Blockers:** None

#### VERIFY: Phase 1
- Run `./tool` and confirm it exits 0 without error.

---

### Phase 2: CLI Features and Validation

#### Task 2: Implement --version flag
- **Change:** Add `--version` and `-v` flag handling to `src/cli.ts` using `yargs`. Print `fleet-e2e-toy v1.0.0`.
- **Files:** `src/cli.ts`
- **Tier:** cheap
- **Done when:** `./tool --version` prints `fleet-e2e-toy v1.0.0` and exits 0.
- **Blockers:** Task 1

#### Task 3: Implement help subcommand and --help flag
- **Change:** Configure `yargs` in `src/cli.ts` to support the `help` subcommand and `--help` flag. List all available commands (e.g., `add`, `serve`).
- **Files:** `src/cli.ts`
- **Tier:** standard
- **Done when:** `./tool help` and `./tool --help` print usage information and exit 0.
- **Blockers:** Task 2

#### Task 4: Implement 'add' command with blank string validation
- **Change:** Add an `add` subcommand that takes a title argument. Implement validation to reject empty or whitespace-only strings.
- **Files:** `src/cli.ts`
- **Tier:** standard
- **Done when:** `./tool add ""` or `./tool add "  "` prints an error and exits with a non-zero code.
- **Blockers:** Task 3

#### Task 5: Add automated tests for CLI features
- **Change:** Create `tests/cli.test.ts` to verify version, help, and blank string validation using `execSync`.
- **Files:** `tests/cli.test.ts`
- **Tier:** standard
- **Done when:** `npm test tests/cli.test.ts` passes.
- **Blockers:** Task 4

#### VERIFY: Phase 2
- Run `./tool help`
- Run `./tool add ""` and verify failure.
- Run all tests.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Issue descriptions mention "Python traceback" | Low | Project is Node.js; assume generic "stack trace" meaning. |
| `./tool` execution on Windows | Medium | Provide both `tool` (shebang) and `tool.cmd` for compatibility. |
| Dependency on `yargs` | Low | `yargs` is already present in `node_modules`; will use it for robust parsing. |
