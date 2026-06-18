# Implementation Plan — CLI Features (gh-toy-4ef, gh-toy-69s, gh-toy-aqd)

Branch: `temp-requirements` (canonical sprint branch; tracks `origin/temp-requirements`).

## Context & Findings (Phase 0 — Explore)

**Source of truth:** `requirements.md` lists three CLI issues. The trailing boilerplate in
requirements.md ("API handlers go in src/api/ … supertest") is copied project context and is NOT
relevant — all three issues are **CLI** behaviors, not HTTP API behaviors. Verified by reading the
three acceptance criteria: each is about the command-line tool (`--version`, Ctrl-C, `--json`).

**Current state of the branch (verified by reading source + running build/tests):**
- A real CLI already exists under `src/cli/`: `types.ts`, `parse.ts`, `output.ts`, `run.ts`,
  `index.ts`. This is the approved Phase 1 foundation (reviewer-p1-i1, APPROVED — see feedback.md).
- `parseArgs(argv)` (`src/cli/parse.ts`) already recognizes `--version`/`-v`, `--json`,
  `--help`/`-h`; first non-flag token is `command`; remaining tokens go to `args`; unknown flags are
  preserved into `args` (non-fatal). Returns `ParsedArgs`. VERIFIED by reading the file.
- `createOutputWriter(json)` (`src/cli/output.ts`) routes all output through
  `process.stdout`/`process.stderr` (no `console.log`). Text mode: `text()` → stdout,
  `error()` → `Error: <msg>` on stderr, `json()` is a no-op. JSON mode: `json()` → `JSON.stringify`
  + newline to stdout, `error()` → `{"error":"<msg>"}` to stdout, `text()` is a no-op. VERIFIED.
- `run(argv): Promise<number>` (`src/cli/run.ts`) parses args, builds the writer, handles
  `--version` (text: `fleet-e2e-toy v${pkg.version}`; json: `{"name":"fleet-e2e-toy","version":...}`,
  version sourced from `package.json`), then falls through to a **placeholder** default command that
  prints `fleet-e2e-toy: command=<cmd>` (text) or `{"status":"ok","command":...,"args":...}` (json).
  `run` does NOT call `process.exit` — it returns the exit code (kept unit-testable). VERIFIED.
- `src/cli/index.ts` is a thin shim: `#!/usr/bin/env node` + `run(process.argv.slice(2)).then(code
  => process.exit(code))`. This is the only place `process.exit` is called for normal flow. VERIFIED.
- `--version` (gh-toy-4ef) is fully implemented and tested (`tests/cli-version.test.ts`, Phase 2,
  reviewer verified on this branch). The CHANGES NEEDED entry in feedback.md targeted a *different*
  out-of-band branch (`feat/p1-cli-features`) that ignored the foundation — NOT this branch. On
  `temp-requirements` the version work matches the plan: sourced from package.json, JSON variant
  present, precedence over subcommands. VERIFIED by reading run.ts + cli-version.test.ts.

**Verified build/test facts (assumptions checked by running them):**
- `npm run build` (tsc, strict) compiles clean. VERIFIED (exit 0).
- `npx jest` → 43 passed / 43 total across 5 suites (cli-parse 12, cli-run 6, cli-version 4,
  validation, notes). VERIFIED.
- `dist/cli/index.js` IS produced by the build, so the `bin` entry
  (`"fleet-e2e-toy": "dist/cli/index.js"`) resolves. The `import pkg from "../../package.json"` in
  run.ts does NOT shift the rootDir output layout. VERIFIED by listing `dist/cli/`.
  (Note: `dist/` also contains stale artifacts — `cli.js`, `cli/apiClient.js`, `cli/commands.js`,
  `cli/validators.js` — left over from other branches' builds. They are not in current `src/` and
  are out of scope; `dist/` is gitignored build output, not a deliverable.)
- `tsconfig.json`: `rootDir: ./src`, `outDir: ./dist`, `strict: true`, `resolveJsonModule: true`,
  `esModuleInterop: true`. `jest.config.ts`: `preset ts-jest`, `roots: [tests]`,
  `testMatch ["**/*.test.ts"]`, `collectCoverageFrom` excludes `src/index.ts` and `src/cli/index.ts`
  (the two shims). VERIFIED.
- CLI tests follow the plain-unit-test pattern (import + invoke the function, spy on
  `process.stdout/stderr.write`, `mockRestore()` in `afterEach`); supertest is used only for the
  HTTP app. VERIFIED by reading existing cli-*.test.ts.
- `package.json` declares no `yargs` direct dependency; the parser is hand-rolled. No new external
  deps are needed for the remaining work (`fs` is built-in). VERIFIED.

**Carry-over note from the Phase 1 review (feedback.md):** `OutputWriter.error()` (both the
text-mode `Error: <msg>` stderr branch and the json-mode `{"error":...}` branch) is implemented but
not yet exercised by any test, because the placeholder runner has no error path. The Phase 1
reviewer explicitly deferred this to Phase 3 and stated Phase 3 "should not close" unless both
`error()` branches are covered. The remaining phase below MUST cover them.

**Design decisions resolving requirements ambiguity (for the remaining work):**
- **SIGINT (gh-toy-69s):** the handler prints exactly `Interrupted.` to **stderr**, removes any
  partial output files the run created (via a temp-file registry), and exits with code **130**. No
  stack trace is printed (the handler never throws; it calls `process.exit` directly). Because SIGINT
  is handled in the shim (`index.ts`) which runs before/independent of per-command `--json` state, the
  interrupt message is always the plain text `Interrupted.` on stderr — a JSON-shaped interrupt
  message is explicitly out of scope (acceptance requires only the literal `Interrupted.` + exit 130
  + no trace + cleaned partial files).
- **`--json` (gh-toy-aqd):** `--json` is a global flag accepted on any subcommand. When set, all
  normal command output is a single valid JSON document on stdout and errors are emitted as
  `{"error":"<message>"}` on stdout with a **non-zero** exit code; default (no `--json`) is
  human-readable text with errors as `Error: <msg>` on stderr. The acceptance "accepted on any
  subcommand" is demonstrated by a real subcommand that produces structured output (not just the
  placeholder) plus an error case, so both the success-JSON and error-JSON paths are observable.

---

## Phase 1 — CLI Foundation (shared abstraction) — COMPLETE

Already implemented and APPROVED (reviewer-p1-i1). Listed for provenance; no work remains.
The parser (`ParsedArgs`), output writer (`OutputWriter`), and runner (`run()`) are the shared
abstractions every later task builds on. Do NOT reinvent them — reuse them.

### Task 1.1 — CLI entrypoint, argv parser, output abstraction — COMPLETE
- **Type:** work
- **Status:** completed (commit `a7e57fc`)
- **Model:** claude-sonnet-4-6
- **Files:** `src/cli/types.ts`, `src/cli/parse.ts`, `src/cli/output.ts`, `src/cli/run.ts`,
  `src/cli/index.ts`; `package.json` (`bin` + `cli` script); `jest.config.ts` (coverage exclusion).
- **Done:** build + lint clean; `npm run cli -- somecommand` and `--json somecommand` work.

### Task 1.2 — Foundation tests — COMPLETE
- **Type:** work
- **Status:** completed (commit `a7e57fc`)
- **Model:** claude-sonnet-4-6
- **Files:** `tests/cli-parse.test.ts` (12 tests), `tests/cli-run.test.ts` (6 tests).
- **Done:** full suite green.

### Task 1.3 — VERIFY Phase 1 — COMPLETE
- **Type:** verify
- **Status:** completed (reviewer-p1-i1, APPROVED).

---

## Phase 2 — `--version` flag (gh-toy-4ef, P1) — COMPLETE

Already implemented and verified on this branch. Listed for provenance; no work remains.

### Task 2.1 — Implement and test `--version` — COMPLETE
- **Type:** work
- **Status:** completed (commits `6259c02`, `ec8aa1d`)
- **Model:** claude-haiku-4-5-20251001
- **Files:** `src/cli/run.ts` (version short-circuit, sourced from `package.json`),
  `tests/cli-version.test.ts` (4 tests).
- **Done:** `--version`/`-v` print `fleet-e2e-toy v1.0.0` and exit 0; `--version --json` prints
  `{"name":"fleet-e2e-toy","version":"1.0.0"}`; `--version <cmd>` still prints version (precedence).

### Task 2.2 — VERIFY Phase 2 — COMPLETE
- **Type:** verify
- **Status:** completed (verified on `temp-requirements`; the CHANGES NEEDED feedback.md entry
  applied to the unrelated `feat/p1-cli-features` branch, not this one).

---

## Phase 3 — JSON output mode + SIGINT graceful shutdown (gh-toy-aqd P2, gh-toy-69s P2)

This is the only phase with remaining work. The two features share one code path and data model:
both depend on the `OutputWriter` error contract and on a temp-file registry, and the SIGINT cleanup
path must remove the same partial files that the JSON-producing command creates. Implementing them
together avoids touching the signal/exit/output code twice. Cohesive unit → one phase. All three
work tasks run on the same model (claude-sonnet-4-6) so they batch into one doer dispatch (one
streak); the combined context (5 small CLI files + 3 test files) fits comfortably.

DRY constraint: every task below MUST reuse `parseArgs`, `OutputWriter`/`createOutputWriter`, and
`run()` from Phase 1. Do not introduce a parallel parser, a second output abstraction, or a new
entrypoint.

### Task 3.1 — Temp-file registry + a real JSON-capable subcommand
- **Type:** work
- **Model:** claude-sonnet-4-6
- **Files:**
  - Create `src/cli/tempfiles.ts` — a module-level registry with exactly three exports, no `any`:
    - `register(path: string): void` — records a path the CLI created during the run.
    - `cleanupAll(): void` — best-effort delete of every registered path using
      `fs.rmSync(path, { force: true })` inside a try/catch that swallows errors (cleanup must never
      throw), then clears the registry.
    - `list(): string[]` — returns a copy of the currently registered paths (for tests).
    Use Node's built-in `fs` (`import * as fs from "fs"`). No external deps.
  - Edit `src/cli/run.ts` — replace the placeholder default dispatch with a small, real command so
    `--json` acceptance is demonstrable. Add a `write <filename>` subcommand: it writes a file at
    `<filename>` containing a fixed payload, calls `register(<filename>)`, and reports success.
    - Text mode: `writer.text("Wrote " + filename)`.
    - JSON mode: `writer.json({ command: "write", path: filename, status: "ok" })`.
    - Keep the existing `--version` short-circuit and a sensible default for an unknown/empty command
      (the current placeholder behavior is acceptable for the no-command case).
    - Error path: if `write` is invoked with no filename, call `writer.error("write requires a
      filename")` and return a **non-zero** exit code (e.g. `1`). This is the first real error path
      and exercises BOTH `OutputWriter.error()` branches (text `Error: ...` on stderr; json
      `{"error":"..."}` on stdout) — required to satisfy the Phase 1 reviewer's deferred item.
    - All output MUST go through the `OutputWriter` — no direct `process.stdout.write` in run.ts
      outside the writer. Audit and confirm.
  - Create `tests/cli-tempfiles.test.ts` — unit tests for the registry: `register` then `list`
    returns the path; `cleanupAll` deletes a real temp file created under `os.tmpdir()` and empties
    `list()`; `cleanupAll` on a non-existent path does not throw (best-effort). Restore/cleanup any
    real files in `afterEach`.
  - Create `tests/cli-json.test.ts` — drive `run([...])` (reuse the stdout/stderr spy pattern from
    `tests/cli-run.test.ts`, `mockRestore()` in `afterEach`):
    - `run(["write", "<tmpfile>", "--json"])` → returns 0, stdout parses with `JSON.parse` and
      equals `{ command: "write", path: "<tmpfile>", status: "ok" }`; the file exists afterward;
      clean the file up in the test.
    - `run(["write", "<tmpfile>"])` (text mode) → returns 0, stdout contains `Wrote <tmpfile>`,
      stdout is NOT valid JSON-of-an-object (human text), file exists; clean up.
    - `run(["write", "--json"])` (missing filename) → returns non-zero; stdout parses as
      `{ error: "write requires a filename" }`.
    - `run(["write"])` (missing filename, text mode) → returns non-zero; stderr contains
      `Error: write requires a filename`.
- **Done when:** `npm run build` clean; `npm test` green including the two new suites; manual
  `npm run cli -- write out.txt --json` prints valid JSON and creates `out.txt`;
  `npm run cli -- write out.txt` prints `Wrote out.txt`. No `any`; `npm run lint` clean.
- **Could block:** test temp files must be written to a writable location (use `os.tmpdir()` +
  unique names) and removed in `afterEach` so the suite is idempotent. Ensure JSON mode never
  interleaves stray text — all writes route through the writer (audit run.ts).

### Task 3.2 — SIGINT graceful shutdown (testable handler + shim wiring)
- **Type:** work
- **Model:** claude-sonnet-4-6
- **Files:**
  - Create `src/cli/signals.ts` — export a pure, injectable factory so the handler is unit-testable
    without sending a real signal, no `any`:
    `createSigintHandler(deps: { cleanup: () => void; write: (s: string) => void; exit: (code: number) => void }): () => void`.
    The returned handler, when invoked: calls `deps.cleanup()`, then `deps.write("Interrupted.\n")`,
    then `deps.exit(130)`. It must not throw and must not print a stack trace (it never rethrows).
  - Edit `src/cli/index.ts` (the shim — the legitimate place for process-level concerns) — before
    invoking `run`, register the handler:
    `process.on("SIGINT", createSigintHandler({ cleanup: cleanupAll, write: s =>
    process.stderr.write(s), exit: code => process.exit(code) }))`, importing `cleanupAll` from
    `./tempfiles` and `createSigintHandler` from `./signals`. Keep the existing
    `run(process.argv.slice(2)).then(code => process.exit(code))` flow. The message goes to stderr so
    stdout JSON output (if any was already emitted) is not corrupted, and acceptance "no stack trace"
    is guaranteed because the handler exits directly.
  - Create `tests/cli-signals.test.ts` — call `createSigintHandler` with injected fakes
    (jest mock functions for `cleanup`, `write`, `exit`); invoke the returned handler; assert
    `cleanup` was called, `write` was called with exactly `"Interrupted.\n"`, and `exit` was called
    with `130`, in that order. No real signal sent.
- **Done when:** `npm test` green including `tests/cli-signals.test.ts`; `npm run build` clean;
  `npm run lint` clean; manual check: run a long-lived `npm run cli -- write big.txt` and press
  Ctrl-C → stderr shows `Interrupted.`, no stack trace, exit code 130 (`$LASTEXITCODE` in
  PowerShell / `echo $?` in bash), and `big.txt` is removed if it was registered.
- **Could block:** Windows Ctrl-C delivery under PowerShell can differ from POSIX; the unit test
  with injected fakes is the binding acceptance gate, the manual Ctrl-C check is confirmatory only.
  `src/cli/index.ts` is excluded from coverage (it is the shim) so the handler logic lives in
  `signals.ts` to stay covered.

### Task 3.3 — VERIFY Phase 3
- **Type:** verify
- **Model:** (reviewer — assigned by orchestrator, runs on strongest available model)
- The doer stops here. Reviewer confirms, against the committed state on `temp-requirements`:
  - `--json` accepted on a real subcommand; success output is a single valid JSON document
    (`JSON.parse` succeeds); default output is human-readable text; an error case under `--json`
    yields `{"error":"..."}` on stdout with a non-zero exit code; the text-mode error yields
    `Error: ...` on stderr — i.e. BOTH `OutputWriter.error()` branches are now exercised (closes the
    Phase 1 deferred item).
  - SIGINT handler prints exactly `Interrupted.`, exits 130, prints no stack trace, and triggers
    temp-file cleanup; `createSigintHandler` is unit-tested with injected fakes.
  - Temp-file registry register/cleanup/list behavior is tested, including best-effort delete of a
    missing path.
  - `npm run build`, `npm run lint`, and `npm test` are all green; no `any`; no `console.log`;
    work is committed AND pushed (CI green on the pushed HEAD).

---

## Risk Register (unverifiable-at-plan-time items)

- **JSON-mode SIGINT:** SIGINT is handled in the shim before/independent of per-command `--json`
  state; the handler always emits plain `Interrupted.` on stderr. A JSON-shaped interrupt message is
  intentionally out of scope (acceptance requires only the literal `Interrupted.` + exit 130 + no
  trace + cleaned files).
- **Windows Ctrl-C semantics:** real-signal manual verification may behave differently under
  PowerShell vs POSIX; the `cli-signals.test.ts` unit test (injected fakes) is the binding gate.
- **Stale `dist/` artifacts:** `dist/` contains leftover compiled files from other branches
  (`cli.js`, `cli/apiClient.js`, `cli/commands.js`, `cli/validators.js`). `dist/` is build output
  (gitignored), not a deliverable; a clean rebuild (`rm -rf dist && npm run build`) regenerates only
  current-src outputs. Not addressed by any task; flagged only so a reviewer does not mistake stale
  output for source.

## Out of Scope
- No changes to the Express API (`src/api/`, `src/app.ts`, `src/index.ts`), notes model, or HTTP
  validation.
- No new external dependencies — hand-rolled parser only; `fs`/`os` are Node built-ins.
- No JSON-formatted SIGINT message (see Risk Register).
- No reconciliation with the divergent `feat/p1-cli-features` branch; `temp-requirements` is
  canonical.
