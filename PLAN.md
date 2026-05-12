# fleet-e2e-toy --- Implementation Plan

Sprint: CLI features --- --version flag, input validation, --help command

Issues: fleet-e2e-toy-1778393401792-1 (--version), fleet-e2e-toy-1778393401895-2 (input validation), fleet-e2e-toy-1778393401973-3 (--help)

All three issues share the same code path: argument parsing in a new src/cli.ts module wired into src/index.ts. One phase covers all three issues, with a single VERIFY checkpoint.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| src/index.ts has module-load side effects (starts server), making it hard to unit-test | Med | Extract all parsing logic into src/cli.ts; unit-test that module directly |
| package.json import path differs between ts-node and compiled output | Low | resolveJsonModule is already true in tsconfig.json; use direct TS JSON import |

---

## Tasks

### Phase 1: CLI Argument Handling

#### Task 1.1: Create src/cli.ts with argument parser and tests
- **Files:** src/cli.ts (new), tests/cli.test.ts (new)
- **Change:** Create parseCli(argv: string[]) that accepts process.argv-style array (first two elements are node/script paths, sliced from index 2). Returns an object with action field: "version", "help", or "serve", plus optional input string. Priority order: --version checked first, then --help or help subcommand, then positional args. When a positional (non-flag) arg is present and its trimmed value is empty, throw new Error("Input must not be empty or whitespace-only."). Export HELP_TEXT constant string listing all supported commands and flags. Write unit tests in tests/cli.test.ts covering all cases.
- **Tier:** cheap
- **Done when:** All unit tests in tests/cli.test.ts pass with npm test; parseCli returns correct action for all input combinations; throws on empty/blank positional input; HELP_TEXT mentions --version, --help, and help.
- **Blockers:** None --- pure TypeScript logic, no external dependencies.

#### Task 1.2: Wire argument handling into src/index.ts
- **Files:** src/index.ts
- **Change:** Import parseCli and HELP_TEXT from "./cli" and pkg from "../package.json". Before app.listen(), call parseCli(process.argv) in a try/catch. Handle results: "version" action prints pkg.version to stdout and exits 0; "help" action prints HELP_TEXT to stdout and exits 0. In the catch block, write err.message to stderr and exit 1. If action is "serve", fall through to app.listen() as before.
- **Tier:** cheap
- **Done when:** src/index.ts compiles with tsc without errors. ts-node src/index.ts --version prints 1.0.0 to stdout and exits 0; --help and help subcommand print usage and exit 0; empty/blank args write error to stderr and exit 1.
- **Blockers:** Requires Task 1.1 complete.

#### VERIFY: Phase 1 CLI Features
- **Type:** verify
- **Steps:**
  1. Run npm run build --- must produce dist/ with zero TypeScript errors
  2. Run npm test --- all tests must pass: tests/notes.test.ts, tests/validation.test.ts, tests/cli.test.ts
  3. Smoke-test: node dist/index.js --version prints 1.0.0 and exits 0; --help and help print usage and exit 0; empty/blank args write error to stderr and exit 1
  4. Push to origin e2e-s1-25744544063/cli-features
- **Done when:** Build passes, all tests green, smoke tests confirmed, code on origin.

---

## Notes
- Each task results in one commit
- VERIFY tasks are checkpoints --- stop and report after reaching one
- Base branch: main
- Implementation branch: e2e-s1-25744544063/cli-features
- src/index.ts is excluded from jest coverage collection --- unit-test logic via src/cli.ts instead
- tsconfig.json already has resolveJsonModule: true --- JSON import of package.json works without modification
