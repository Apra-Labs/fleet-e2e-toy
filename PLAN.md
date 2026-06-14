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

- **R1 — TypeScript compiles `src/cli.ts` to `dist/cli.js` cleanly.** Verified
  structurally: `tsconfig.json` has `include: ["src/**/*"]` and `outDir: "./dist"`
  with `rootDir: "./src"`, so any new `.ts` file under `src/` will be emitted.
  Confirmed at T1.1 VERIFY (the build step).
- **R2 — Jest spawning `node dist/cli.js` works on Windows and Linux CI.** Using
  `spawnSync` with `process.execPath` for portability. Confirmed at T1.4.

---

## Phase 1 — Implement CLI entrypoint with all three features

Single coherent phase: every task touches the new CLI surface or its tests; the
phase produces one reviewable increment (the CLI works end-to-end). VERIFY at the
end runs the full build + lint + test gate.

Tasks are ordered to (a) front-load the smallest dependency (`validateNonBlank`
so T1.2 can import it), then (b) build the CLI that exercises the riskiest
assumption (TS compile of a new entrypoint), then (c) add tests, then (d) wire
the build into `npm test`, then VERIFY. T1.1, T1.3, T1.4, T1.5 are haiku and
sit on a contiguous streak around the one sonnet task (T1.2) where light
judgment on arg parsing/precedence is needed.

### T1.1 — Add `validateNonBlank` helper and its unit tests

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
    - throws on `""` with message containing `must not be empty or blank` and the
      `argName`
    - throws on `"   "` (whitespace-only) with the same message shape
    - throws when called with a non-string value cast through `unknown as string`
- **Done when:**
  - `npm test -- tests/validation.test.ts` passes locally (after T1.4 wires
    `pretest`, full `npm test` will also pass).
  - `npm run lint` passes for both edited files.
- **Blockers:** none.
- **Model:** claude-haiku-4-5-20251001

### T1.2 — Create `src/cli.ts` implementing all three CLI features

- **Files:**
  - Create `src/cli.ts`.
- **Change:** Implement a single-file CLI per decisions D2–D7. Skeleton:
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
- **Done when:**
  - `npm run build` succeeds; `dist/cli.js` exists.
  - `node dist/cli.js --version` prints exactly `fleet-e2e-toy v1.0.0` and exits 0
    (smoke-checkable by the doer before moving on).
  - `npm run lint` passes for `src/cli.ts`.
- **Blockers:** T1.1 (imports `validateNonBlank`).
- **Model:** claude-sonnet-4-6

### T1.3 — Add `tests/cli.test.ts` covering all three features

- **Files:**
  - Create `tests/cli.test.ts`.
- **Change:** Use `child_process.spawnSync` (with `process.execPath` as the node
  binary and `path.resolve(__dirname, "..", "dist", "cli.js")` as the script) to
  exercise the CLI as a subprocess. Cover at minimum:
  - `--version` prints exactly `fleet-e2e-toy v1.0.0\n` on stdout, exit 0
  - `-v` is identical to `--version` (same stdout, same exit code)
  - `--version` takes precedence when combined with `--help` (output is the
    version string, not the help text; exit 0)
  - `help` (positional) prints help text containing `Usage:`, `--version`, and
    `--help`; exit 0
  - `--help` prints help text containing the same markers; exit 0
  - `-h` prints help text containing the same markers; exit 0
  - empty-string argument `""` -> stderr contains `must not be empty or blank`,
    exit code 1
  - whitespace-only argument `"   "` -> stderr contains `must not be empty or
    blank`, exit code 1
  Use `encoding: "utf8"` on `spawnSync` to get string `stdout`/`stderr` directly.
  Assert exit codes via `result.status`.
- **Done when:**
  - After `npm run build`, `npx jest tests/cli.test.ts` passes locally.
  - `npm run lint` passes for the new test file.
- **Blockers:** T1.2 (test spawns `dist/cli.js` which is built from `src/cli.ts`).
- **Model:** claude-haiku-4-5-20251001

### T1.4 — Wire `pretest` so `npm test` always rebuilds `dist/`

- **Files:**
  - Modify `package.json` (scripts section only).
- **Change:** Add `"pretest": "npm run build"` to the `scripts` map. Keep all
  other scripts untouched. Do NOT modify dependencies, version, name, or any
  other field.
- **Done when:**
  - `npm test` (run from a clean state with `dist/` deleted) succeeds and
    produces a fresh `dist/cli.js` before Jest runs.
  - `package.json` remains valid JSON (no trailing commas, no stray edits).
- **Blockers:** none (independent of T1.2/T1.3 mechanically, but logically
  required for the VERIFY step to pass without a manual build).
- **Model:** claude-haiku-4-5-20251001

### T1.5 — VERIFY: build + lint + full test suite

- **Files:** none modified.
- **Change:** Run in order from the repo root:
  1. `npm run build`  — must exit 0, must emit `dist/cli.js`
  2. `npm run lint`   — must exit 0 with no errors
  3. `npm test`       — must exit 0; all pre-existing `notes.test.ts` and
     `validation.test.ts` tests still pass, plus the new `validateNonBlank` and
     `cli.test.ts` tests pass. No skipped tests.
- **Done when:** All three commands exit 0 and the output of `npm test` shows the
  new `validateNonBlank` describe block and `cli.test.ts` file with all assertions
  passing.
- **Blockers:** T1.1, T1.2, T1.3, T1.4.
- **Model:** claude-haiku-4-5-20251001

---

## Streak / dispatch grouping

Task model assignments produce two streaks:

- Streak A (haiku): T1.1
- Streak B (sonnet): T1.2
- Streak C (haiku): T1.3, T1.4, T1.5

Three dispatches total. Streak C is purposely contiguous so the haiku doer
writes the CLI tests, wires `pretest`, and runs VERIFY in one fresh context.
