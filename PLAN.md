# PLAN — Sprint s8.3-1780537970446

Implements CLI features for NoteAPI including version flag, help command, and input validation.

Covers three P1 issues from the beads backlog:
- **gh-toy-4ef** — Version Flag (`--version` / `-v`)
- **gh-toy-kbk** — Help Command (`help` / `--help` / `-h`)
- **gh-toy-v6z** — Input Validation (blank or empty argument rejection)

Base branch: `main`. Work branch: `pmlite-e2e/s8.3-1780537970446`.
Worktree path: `/private/var/folders/b1/x3gsm3fn4pj4n7kjxb0wg5d80000gn/T/pmlite-e2e-s8.3-VLM5hF/repo-wt/s8.3`.

---

## Exploration Notes (Phase 0)

Files inspected:
- `src/index.ts` — Starts the NoteAPI HTTP server.
- `src/utils/validation.ts` — Contains existing input validation functions for API request bodies.
- `tests/validation.test.ts` — Unit tests for validation helpers.
- `package.json` — Describes dependencies and scripts.

Decisions made up-front:
1. **CLI entry point**: Create `src/cli.ts` as the CLI entry point as specified by the requirements. It will reuse the Express app startup logic from `src/app.ts` when starting the server.
2. **Rejection of blank arguments**: If *any* argument passed in `process.argv.slice(2)` is blank or empty, the CLI will print a user-friendly error message to stderr and exit with non-zero exit code `1`.
3. **Execution wrappers**: Implement `./tool` and `./tool.cmd` wrappers in the root directory that invoke `npx ts-node src/cli.ts` forwarding all arguments.
4. **Precedence**: If both `--help` (or `help`) and `--version` are passed together, help information takes precedence.
5. **Hardcoded version**: The version is hardcoded to `1.0.0` as per requirements, outputting `fleet-e2e-toy v1.0.0`.

---

## Phase 1 — Core Logic and Validation

### T1.1 — Add `isBlankOrEmpty` helper + unit tests (gh-toy-v6z)
- **Files:**
  - Edit `src/utils/validation.ts` — append the following helper:
    ```typescript
    export function isBlankOrEmpty(s: string): boolean {
      return s.trim().length === 0;
    }
    ```
  - Edit `tests/validation.test.ts` — import `isBlankOrEmpty` and append tests for it:
    - Should return true for empty string (`""`).
    - Should return true for whitespace-only strings (`"   "` and `"\t\n  "`).
    - Should return false for valid string (`"hello"`).
    - Should return false for valid string with surrounding whitespace (`"  hello  "`).
- **What "done" means:**
  - `npm test` passes successfully.
  - Linter/build has no errors.
- **Scope guard:** Do not implement CLI arguments validation logic here. Only write and unit-test the utility function.
- **Blockers:** None.
- **Model:** gemini-3.5-flash

### T1.2 — Create CLI Entry Point `src/cli.ts` (gh-toy-4ef, gh-toy-kbk, gh-toy-v6z)
- **Files:**
  - Create `src/cli.ts`.
- **Change details:**
  - Read arguments using `process.argv.slice(2)`.
  - Validate inputs: if any argument is empty or whitespace-only (using `isBlankOrEmpty`), output a user-friendly error message to stderr and exit with non-zero exit code `1`.
  - If argument validation passes:
    - If arguments include `help`, `--help`, or `-h`, output usage information and exit `0`.
    - Else if arguments include `--version` or `-v`, output `fleet-e2e-toy v1.0.0` and exit `0`.
    - Else if no flags/commands match, start the NoteAPI HTTP server on `process.env.PORT ?? 3000` using `app` imported from `./app`.
- **Help Message Output:**
  ```
  fleet-e2e-toy — NoteAPI CLI

  Usage:
    ./tool [command] [flags]

  Commands:
    help              Show this help message

  Flags:
    --help, -h        Show this help message
    --version, -v     Print version and exit
  ```
- **What "done" means:**
  - Running `npx ts-node src/cli.ts --version` or `-v` outputs `fleet-e2e-toy v1.0.0` and exits 0.
  - Running `npx ts-node src/cli.ts help`, `--help`, or `-h` outputs the usage message and exits 0.
  - Running `npx ts-node src/cli.ts` starts the HTTP server.
  - Running `npx ts-node src/cli.ts ""` or `"   "` exits with code 1 and prints a validation error to stderr.
- **Scope guard:** Do not create the tool wrappers yet. Keep linter rules clean.
- **Blockers:** T1.1.
- **Model:** gemini-3.5-pro

### VERIFY (end of Phase 1)
1. `npm test` runs and passes.
2. `npm run lint` has no errors.
3. Test all CLI entrypoint combinations: version, help, blank input validation, and server startup.

---

## Phase 2 — Wrapper Scripts

### T2.1 — Implement Shell and Batch wrappers (gh-toy-4ef, gh-toy-kbk, gh-toy-v6z)
- **Files:**
  - Create `./tool` in the root of the worktree.
  - Create `./tool.cmd` in the root of the worktree.
- **Change details:**
  - `./tool` content:
    ```sh
    #!/bin/sh
    npx ts-node src/cli.ts "$@"
    ```
  - `./tool.cmd` content:
    ```cmd
    @echo off
    npx ts-node src/cli.ts %*
    ```
  - Run `chmod +x ./tool` to make the Unix wrapper script executable.
- **What "done" means:**
  - Running `./tool --version` works and prints version.
  - Running `./tool.cmd --version` works and prints version.
  - Execution is non-interactive and handles all argument forwarding correctly.
- **Blockers:** T1.2.
- **Model:** gemini-3.5-flash

### VERIFY (end of Phase 2)
1. Run `./tool --version` -> outputs `fleet-e2e-toy v1.0.0`, exit code 0.
2. Run `./tool -v` -> same.
3. Run `./tool help` and `./tool --help` and `./tool -h` -> outputs usage info, exit code 0.
4. Run `./tool ""` -> exits with code 1 and prints validation error to stderr.
5. Run `./tool "   "` -> exits with code 1 and prints validation error to stderr.
6. Verify `./tool` starts the server when run with no arguments.
7. Run `git status` -> all changes committed, working directory clean.

---

## Self-Critique
- **Cohesion:** All tasks directly address the three P1 deliverables. Phase 1 handles TypeScript implementations; Phase 2 builds OS-specific wrappers.
- **Risk Mitigation:** Rejection of blank arguments is front-loaded to the entrypoint logic and fully verified. Hardcoding version output protects against package.json read drift.
- **No untracked work:** Unit tests for `isBlankOrEmpty` are explicitly listed. Linter and type safety checks are present.
