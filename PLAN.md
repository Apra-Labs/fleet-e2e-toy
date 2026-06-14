# PLAN — pmlite-e2e-s1 (NoteAPI CLI: --version, input validation, help)

Sprint goal: add a CLI entrypoint (`src/cli.ts` -> `dist/cli.js`) exposing three
features from `requirements.md`:

1. `--version` / `-v` flag (gh-toy-4ef)
2. Empty/blank-string input validation (gh-toy-v6z)
3. `help` command and `--help` / `-h` flag (gh-toy-kbk)

Definition of Done: `npm run build`, `npm run lint`, and `npm test` all pass with
no regressions; all three acceptance criteria from `requirements.md` are met.

---

## Decisions resolved up-front (do NOT re-litigate in tasks)

These are bakery-stamped here so two implementers will produce the same CLI:

- **D1 — Build-before-test.** Add a `pretest` npm script that runs `npm run build`,
  so `npm test` always rebuilds `dist/` before Jest runs. CLI tests spawn
  `node dist/cli.js` directly (no ts-node in tests). Rationale: keeps `npm test`
  as a single entrypoint per the DoD and matches requirements which point to
  `dist/cli.js`.
- **D2 — `validateNonBlank` signature is `void`-returning and throws.** Signature:
  `validateNonBlank(value: string, argName: string): void`. On invalid input it
  throws `new Error("Error: <argName> must not be empty or blank")`. The CLI
  catches at top level, prints `err.message` to **stderr**, and exits with code
  **1**. Invalid = `typeof value !== "string"` OR `value.trim().length === 0`.
- **D3 — CLI argument precedence order.** Resolve flags in this exact order, and
  exit immediately on the first match:
  1. `--version` or `-v`  -> print `fleet-e2e-toy v1.0.0` to stdout, exit 0
  2. `help` (positional) OR `--help` / `-h`  -> print help text to stdout, exit 0
  3. Otherwise, for every remaining positional argument: call `validateNonBlank`.
     If any throws, print the error message to stderr and exit 1.
  4. If no flags and no positionals and nothing fails, print help text and exit 0
     (avoids a silent no-op; deterministic behaviour for the no-arg case).
- **D4 — Help text content** (one block, used by both `help` and `--help`/`-h`):
  ```
  Usage: fleet-e2e-toy [command|flags] [args...]

  Commands:
    help                  Show this help text

  Flags:
    --version, -v         Print the CLI version and exit
    --help, -h            Show this help text and exit
  ```
  Help output goes to **stdout**, exit code **0**.
- **D5 — Version string** is the literal `fleet-e2e-toy v1.0.0` (hardcoded; no
  `package.json` lookup). Printed via `console.log` (stdout, trailing newline).
- **D6 — File locations** match requirements exactly:
  - CLI source: `src/cli.ts` (compiled to `dist/cli.js` by existing `tsconfig.json`,
    which already includes `src/**/*`)
  - Validation helper: append to existing `src/utils/validation.ts`
  - CLI tests: `tests/cli.test.ts`
  - Validation tests: append to existing `tests/validation.test.ts`
- **D7 — No new dependencies.** Use only Node built-ins (`process.argv`,
  `child_process.spawnSync` in tests). No `commander`, `yargs`, `minimist`, etc.

---

## Risk register (assumptions that could NOT be fully verified up-front)

- **R1 — TypeScript compiles a new `src/cli.ts` entrypoint to `dist/cli.js`
  cleanly.** Verified structurally: `tsconfig.json` has `include: ["src/**/*"]`
  and `outDir: "./dist"` with `rootDir: "./src"`, so any new `.ts` file under
  `src/` will be emitted. **First empirically confirmed at T1.1 Done-when**
  (`npm run build` succeeds and `dist/cli.js` exists). This is also the riskiest
  assumption per `requirements.md` "Risk / Priority Order", which is why the
  task ordering below makes the `--version`-only stub the first task.
- **R2 — Jest spawning `node dist/cli.js` works on Windows and Linux CI.** Using
  `spawnSync` with `process.execPath` for portability. First confirmed at T1.1
  (smoke spawn for `--version`) and broadened at T1.4 (full CLI test suite).
- **R3 — `tsconfig.json` has `"declaration": true`.** `tsc` will emit
  `dist/cli.d.ts` alongside `dist/cli.js`. Benign for this sprint (nothing
  imports it), but noted so a future `files` allowlist in `package.json` is not
  surprised by the extra emit. No task action required.
- **R4 — ESLint `@typescript-eslint/no-unused-vars` is enforced.** Implementer of
  T1.3 must not leave unused imports or unused `catch (err)` bindings. The
  skeleton in T1.3 uses `err` in both branches, so it lints clean as written;
  do not "simplify" by dropping the `String(err)` branch.
- **R5 — `process.exit` is called synchronously around `main(argv)`.** Acceptable
  for this sprint because `main` is fully synchronous (no I/O, no awaits). If a
  future task adds async work inside `main`, the synchronous `process.exit` will
  truncate pending microtasks — out of scope for this sprint, but flagged.

---

## Phase 1 — Implement CLI entrypoint with all three features

Single coherent phase: every task touches the new CLI surface or its tests; the
phase produces one reviewable increment (the CLI works end-to-end). VERIFY at the
end runs the full build + lint + test gate.

**Ordering rationale (per `requirements.md` "Risk / Priority Order"):** the
riskiest assumption is that TypeScript compilation + Jest spawn of a brand-new
`src/cli.ts` entrypoint works. T1.1 collapses to the smallest possible scope that
exercises that whole pipeline: a `--version`-only `src/cli.ts`, one smoke test,
and an actual `npm run build`. Subsequent tasks add the validation helper
(T1.2), extend the CLI with help + validation (T1.3), broaden the test suite
(T1.4), wire `pretest` (T1.5), and VERIFY (T1.6). T1.3 is the only task with
non-mechanical judgment (argv precedence/parsing) and is the lone sonnet task;
T1.1, T1.2, T1.4, T1.5, T1.6 are haiku. The haiku tasks form two contiguous
streaks around the sonnet task so dispatches are minimised.

### T1.1 — Create `src/cli.ts` with `--version` / `-v` only; prove the pipeline

Goal: prove the riskiest assumption (R1, R2) end-to-end with the smallest possible
scope before any other CLI work begins.

- **Files:**
  - Create `src/cli.ts`.
  - Create `tests/cli.test.ts` (smoke-only at this stage; broadened in T1.4).
- **Change:**
  - `src/cli.ts` contents (exactly, do not add help/validation yet):
    ```ts
    #!/usr/bin/env node
    const VERSION = "fleet-e2e-toy v1.0.0";

    function main(argv: string[]): number {
      if (argv.includes("--version") || argv.includes("-v")) {
        console.log(VERSION);
        return 0;
      }
      // Placeholder behaviour for non-version invocations; replaced in T1.3.
      return 0;
    }

    process.exit(main(process.argv.slice(2)));
    ```
  - `tests/cli.test.ts` contents (smoke set, exactly three cases):
    ```ts
    import { spawnSync } from "child_process";
    import * as path from "path";

    const CLI = path.resolve(__dirname, "..", "dist", "cli.js");

    function run(args: string[]) {
      return spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8" });
    }

    describe("cli --version (smoke)", () => {
      test("--version prints exact version and exits 0", () => {
        const r = run(["--version"]);
        expect(r.status).toBe(0);
        expect(r.stdout).toBe("fleet-e2e-toy v1.0.0\n");
      });

      test("-v is an alias for --version", () => {
        const r = run(["-v"]);
        expect(r.status).toBe(0);
        expect(r.stdout).toBe("fleet-e2e-toy v1.0.0\n");
      });

      test("non-version invocation exits 0 (placeholder)", () => {
        const r = run([]);
        expect(r.status).toBe(0);
      });
    });
    ```
  - Run `npm run build` once during this task and confirm `dist/cli.js` exists
    before running the smoke test with `npx jest tests/cli.test.ts`.
- **Done when:**
  - `npm run build` exits 0 and `dist/cli.js` is present (this is the first
    empirical confirmation of R1).
  - `npx jest tests/cli.test.ts` passes all three smoke cases (this is the first
    empirical confirmation of R2 on this machine).
  - `npm run lint` passes for both new files.
- **Blockers:** none.
- **Model:** claude-haiku-4-5-20251001

### T1.2 — Add `validateNonBlank` helper and its unit tests

- **Files:**
  - Modify `src/utils/validation.ts` (append a new exported function).
  - Modify `tests/validation.test.ts` (append a new `describe` block).
- **Change:**
  - Append to `src/utils/validation.ts`:
    ```ts
    export function validateNonBlank(value: string, argName: string): void {
      if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`Error: ${argName} must not be empty or blank`);
      }
    }
    ```
  - Append to `tests/validation.test.ts` a `describe("validateNonBlank", ...)`
    with at least these cases:
    - accepts a non-blank string (does not throw)
    - throws on `""` with message containing `must not be empty or blank` and
      the `argName`
    - throws on `"   "` (whitespace-only) with the same message shape
    - throws when called with a non-string value cast through `unknown as string`
- **Done when:**
  - `npx jest tests/validation.test.ts` passes (the previously existing tests
    plus the new `validateNonBlank` block).
  - `npm run lint` passes for both edited files.
- **Blockers:** none (purely additive; does not touch the CLI).
- **Model:** claude-haiku-4-5-20251001

### T1.3 — Extend `src/cli.ts` with help command and input validation

Goal: complete the CLI surface per D2–D7. This is the only task with non-trivial
judgment (argv parsing precedence under D3) and so runs on sonnet.

- **Files:**
  - Modify `src/cli.ts` (replace the placeholder body from T1.1).
- **Change:** Replace the body of `src/cli.ts` with the full implementation. The
  `--version` / `-v` branch from T1.1 MUST remain functionally identical (same
  output string, same exit code, same precedence). Final file contents:
  ```ts
  #!/usr/bin/env node
  import { validateNonBlank } from "./utils/validation";

  const VERSION = "fleet-e2e-toy v1.0.0";
  const HELP_TEXT = [
    "Usage: fleet-e2e-toy [command|flags] [args...]",
    "",
    "Commands:",
    "  help                  Show this help text",
    "",
    "Flags:",
    "  --version, -v         Print the CLI version and exit",
    "  --help, -h            Show this help text and exit",
  ].join("\n");

  function main(argv: string[]): number {
    // Precedence (D3):
    if (argv.includes("--version") || argv.includes("-v")) {
      console.log(VERSION);
      return 0;
    }
    if (argv.includes("help") || argv.includes("--help") || argv.includes("-h")) {
      console.log(HELP_TEXT);
      return 0;
    }
    const positionals = argv.filter((a) => !a.startsWith("-"));
    if (positionals.length === 0) {
      console.log(HELP_TEXT);
      return 0;
    }
    try {
      positionals.forEach((p, i) => validateNonBlank(p, `arg${i + 1}`));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(msg + "\n");
      return 1;
    }
    // No further subcommands in this sprint; successful no-op for valid args.
    return 0;
  }

  process.exit(main(process.argv.slice(2)));
  ```
  Notes for the implementer:
  - Strictly follow precedence D3; do NOT reorder the checks.
  - Use `console.log` for stdout (D4/D5), `process.stderr.write` for stderr (D2).
  - Do NOT add a `bin` entry in `package.json` (not required by requirements).
  - Do NOT add new npm dependencies (D7).
  - Per R4, do not "simplify" the `catch (err)` branch by dropping `String(err)`.
- **Done when:**
  - `npm run build` succeeds; `dist/cli.js` exists.
  - All four of the following smoke checks pass when run by the doer:
    - `node dist/cli.js --version` -> prints `fleet-e2e-toy v1.0.0`, exit 0
    - `node dist/cli.js help` -> stdout contains `Usage:` and `--version`, exit 0
    - `node dist/cli.js --help` -> stdout contains `Usage:`, exit 0
    - `node dist/cli.js ""` -> stderr contains `must not be empty or blank`,
      exit code 1
  - `npm run lint` passes for `src/cli.ts`.
- **Blockers:** T1.1 (file exists), T1.2 (imports `validateNonBlank`).
- **Model:** claude-sonnet-4-6

### T1.4 — Broaden `tests/cli.test.ts` to cover help and validation

- **Files:**
  - Modify `tests/cli.test.ts` (add cases; keep the existing smoke cases from
    T1.1 — they remain valid).
- **Change:** Add additional `describe` blocks (or `test` cases inside the
  existing block) so the file covers, at minimum:
  - `--version` prints exactly `fleet-e2e-toy v1.0.0\n` on stdout, exit 0
    (already covered in T1.1; keep)
  - `-v` is identical to `--version` (already covered in T1.1; keep)
  - `--version` takes precedence when combined with `--help` (output is the
    version string, not the help text; exit 0)
  - `help` (positional) prints help text containing `Usage:`, `--version`, and
    `--help`; exit 0
  - `--help` prints help text containing the same markers; exit 0
  - `-h` prints help text containing the same markers; exit 0
  - empty-string argument `""` -> stderr contains `must not be empty or blank`,
    exit code 1
  - whitespace-only argument `"   "` -> stderr contains `must not be empty
    or blank`, exit code 1
  - **Portability note:** invoke `spawnSync` with the array form
    `spawnSync(process.execPath, [CLI, ""], { encoding: "utf8" })` so an empty
    string element is passed verbatim as argv on both Windows and Linux. Do
    NOT use a shell string form.
  - Use `encoding: "utf8"` on every `spawnSync` so `stdout`/`stderr` are
    strings. Assert exit codes via `result.status`.
- **Done when:**
  - After `npm run build`, `npx jest tests/cli.test.ts` passes all listed
    cases (the original three from T1.1 plus the new ones).
  - `npm run lint` passes for the test file.
- **Blockers:** T1.3 (CLI must implement help + validation before these tests
  can pass).
- **Model:** claude-haiku-4-5-20251001

### T1.5 — Wire `pretest` so `npm test` always rebuilds `dist/`

- **Files:**
  - Modify `package.json` (scripts section only).
- **Change:** Add `"pretest": "npm run build"` to the `scripts` map. Keep all
  other scripts untouched. Do NOT modify dependencies, version, name, or any
  other field.
- **Done when:**
  - `npm test` (run from a clean state with `dist/` deleted) succeeds and
    produces a fresh `dist/cli.js` before Jest runs.
  - `package.json` remains valid JSON (no trailing commas, no stray edits).
- **Blockers:** none (mechanically independent of T1.3/T1.4, but logically
  required for VERIFY to pass without a manual build).
- **Model:** claude-haiku-4-5-20251001

### T1.6 — VERIFY: build + lint + full test suite

- **Files:** none modified.
- **Change:** Run in order from the repo root:
  1. `npm run build`  — must exit 0, must emit `dist/cli.js`
  2. `npm run lint`   — must exit 0 with no errors
  3. `npm test`       — must exit 0; all pre-existing `notes.test.ts` and
     `validation.test.ts` tests still pass, plus the new `validateNonBlank` and
     `cli.test.ts` tests pass. No skipped tests.
- **Done when:** All three commands exit 0 and the output of `npm test` shows
  the new `validateNonBlank` describe block and `cli.test.ts` file with all
  assertions passing.
- **Blockers:** T1.1, T1.2, T1.3, T1.4, T1.5.
- **Model:** claude-haiku-4-5-20251001

---

## Streak / dispatch grouping

Task model assignments produce three streaks (three dispatches):

- Streak A (haiku): T1.1, T1.2
- Streak B (sonnet): T1.3
- Streak C (haiku): T1.4, T1.5, T1.6

Streak A is the haiku head: T1.1 proves the pipeline with a `--version`-only
stub, then T1.2 adds the validation helper. Both are mechanical and share a
fresh context comfortably. Streak B is the lone sonnet task (T1.3) where argv
parsing/precedence judgment matters. Streak C is the haiku tail: broaden the
CLI tests, wire `pretest`, run VERIFY — one fresh context handles all three.
