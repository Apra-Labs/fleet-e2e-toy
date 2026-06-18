# Implementation Plan — CLI Features (gh-toy-4ef, gh-toy-69s, gh-toy-aqd)

## Context & Findings (Phase 0 — Explore)

**Source of truth:** `requirements.md` lists three issues. The boilerplate sentence in
requirements.md ("API handlers go in src/api/ … supertest") is copied project context and is
NOT relevant to these three issues — all three are **CLI** behaviors, not HTTP API behaviors.

**Critical discovery — there is no CLI to extend on this branch.**
- The current branch (`temp-requirements`) has only the Express app: `src/app.ts`, `src/index.ts`,
  `src/api/notes.ts`, `src/models/note.ts`, `src/utils/validation.ts`.
- A `cli/README.md` exists *only on `main`* (commit `9a078c9`) and describes intended CLI features,
  but contains **no actual CLI source code**. It is aspirational documentation, not an implementation.
- Therefore this plan must **build a minimal CLI entrypoint first**, then layer the three features
  onto it. The CLI is the shared abstraction every later task depends on (Phase 2 front-loading).

**Verified facts (assumptions checked):**
- `tsconfig.json`: `rootDir: ./src`, `outDir: ./dist`, `strict: true`, `resolveJsonModule: true`,
  `esModuleInterop: true`. CLI source MUST live under `src/` to compile. Importing `package.json`
  for the version string is supported (`resolveJsonModule`). VERIFIED by reading tsconfig.json.
- `jest.config.ts`: `preset: ts-jest`, `roots: [<rootDir>/tests]`, `testMatch: ["**/*.test.ts"]`.
  All tests MUST live in `tests/` and end in `.test.ts`. VERIFIED.
- Test convention: plain unit tests import from `src/...` directly (see `tests/validation.test.ts`).
  Supertest is used only for the HTTP app (`tests/notes.test.ts`). CLI tests will follow the
  plain-unit-test pattern (import and invoke the CLI runner function), NOT supertest. VERIFIED.
- `package.json` on this branch declares NO `bin` field and does NOT list `yargs` as a direct
  dependency. `yargs@17.7.2` and `@types/yargs@17.0.35` exist in `node_modules`/lockfile only as
  transitive deps. DECISION: do **not** rely on the transitive yargs; implement a tiny hand-rolled
  argv parser (three flags + passthrough). This removes dependency-resolution risk and keeps the
  foundation self-contained. VERIFIED by reading package.json + package-lock.json.
- Project conventions (CLAUDE.md): no `any` types, no `console.log` in *route handlers* (CLI
  entrypoint output is allowed and necessary — it is not a route handler), wrap errors as
  `{ error: "message" }`. VERIFIED.

**Design decisions resolving requirements ambiguity:**
- Version string is exactly `fleet-e2e-toy v1.0.0` (literal, per acceptance criterion), sourced
  from `package.json`'s `version` field formatted as `fleet-e2e-toy v${version}`.
- `--version` and `-v` are aliases; both print the version and exit 0. `--version` takes precedence
  over and short-circuits any subcommand (acceptance: "works alongside other flags").
- SIGINT handler prints exactly `Interrupted.` to stderr, exits code 130, suppresses stack traces,
  and removes any partial output files the CLI created during the run (tracked via a registry).
- `--json` is a global flag accepted on any subcommand. When set: all normal output is a single
  valid JSON document on stdout; errors are emitted as `{"error":"<message>"}` JSON (exit non-zero).
  Default (no `--json`) is human-readable text. `--version` under `--json` prints
  `{"name":"fleet-e2e-toy","version":"1.0.0"}`.

---

## Phase 1 — CLI Foundation (shared abstraction)

Builds the entrypoint, argv parser, and output/exit abstractions that all three features use.
This is one cohesive unit: the parser, the output writer, and the runner share one data model
(`ParsedArgs`) and one code path (`run()`), so they belong in the same phase.

### Task 1.1 — Create CLI entrypoint, argv parser, and output abstraction
- **Type:** work
- **Model:** claude-sonnet-4-6
- **Files:**
  - Create `src/cli/types.ts` — define `ParsedArgs` interface
    (`{ command?: string; args: string[]; json: boolean; version: boolean; help: boolean }`)
    and an `OutputWriter` interface (`{ text(s: string): void; json(o: unknown): void;
    error(msg: string): void }`). No `any`.
  - Create `src/cli/parse.ts` — export `parseArgs(argv: string[]): ParsedArgs`. Hand-rolled:
    recognizes `--version`/`-v`, `--json`, `--help`/`-h`; first non-flag token is `command`;
    remaining tokens go into `args`. Unknown flags are preserved into `args` (not fatal).
  - Create `src/cli/output.ts` — export `createOutputWriter(json: boolean): OutputWriter`.
    Text mode writes human strings to stdout via `process.stdout.write`; json mode buffers and
    serializes with `JSON.stringify`. `error()` in text mode writes `Error: <msg>` to stderr; in
    json mode writes `{"error":"<msg>"}` to stdout. Output goes through `process.stdout`/`stderr`
    (NOT `console.log`).
  - Create `src/cli/run.ts` — export `async function run(argv: string[]): Promise<number>` that
    parses args, builds the writer, dispatches to a placeholder command (an `echo`/default command
    that prints a recognizable string in both text and json modes), and returns an exit code.
    `run` does NOT call `process.exit` (keeps it unit-testable); it returns the code.
  - Create `src/cli/index.ts` — thin binary shim: `#!/usr/bin/env node`, calls
    `run(process.argv.slice(2)).then(code => process.exit(code))`. This file is the only place
    `process.exit` is allowed for normal flow.
  - Edit `package.json` — add `"bin": { "fleet-e2e-toy": "dist/cli/index.js" }` and a script
    `"cli": "ts-node src/cli/index.ts"`. Add `collectCoverageFrom` exclusion is not needed.
  - Edit `jest.config.ts` — add `"!src/cli/index.ts"` to `collectCoverageFrom` (the shim is the
    only un-unit-testable file, mirroring the existing `!src/index.ts` exclusion).
- **Done when:** `npm run build` compiles with no errors; `npm run cli -- somecommand` prints the
  placeholder output; `npm run cli -- --json somecommand` prints valid JSON. No `any` types; lint
  passes (`npm run lint`).
- **Could block:** ts-node ESM/shebang interaction on Windows — if the shebang causes issues under
  `ts-node`, the `cli` script still works because ts-node ignores the shebang line.

### Task 1.2 — Foundation tests
- **Type:** work
- **Model:** claude-sonnet-4-6
- **Files:**
  - Create `tests/cli-parse.test.ts` — unit tests for `parseArgs`: detects `--version`/`-v`,
    `--json`, `--help`/`-h`; extracts command + args; preserves unknown flags.
  - Create `tests/cli-run.test.ts` — calls `run([...])` and asserts the returned exit code and
    captured stdout/stderr (spy on `process.stdout.write`/`process.stderr.write`). Covers text vs
    json placeholder output. Follows the plain-unit-test pattern from `tests/validation.test.ts`
    (no supertest).
- **Done when:** `npm test` passes including the new files; existing tests still pass.
- **Could block:** capturing `process.stdout.write` requires a spy/restore in `afterEach` — ensure
  mocks are restored so other tests are unaffected.

### Task 1.3 — VERIFY Phase 1
- **Type:** verify
- The doer stops here. Reviewer confirms: CLI foundation compiles, `run()` is testable and returns
  exit codes, output abstraction supports text+json, no `any`, no `console.log`, lint+tests green.

---

## Phase 2 — `--version` flag (gh-toy-4ef, P1)

Smallest, lowest-risk feature; builds directly on the foundation. Isolated change (1 code path).

### Task 2.1 — Implement and test `--version`
- **Type:** work
- **Model:** claude-haiku-4-5-20251001
- **Files:**
  - Edit `src/cli/run.ts` — at the start of `run`, after parsing, if `parsed.version` is true:
    in text mode write exactly `fleet-e2e-toy v1.0.0` to stdout; in json mode write
    `{"name":"fleet-e2e-toy","version":"1.0.0"}`. Return `0`. The version number is read from
    `package.json` (`import pkg from "../../package.json"`, allowed by `resolveJsonModule`) and
    formatted as `fleet-e2e-toy v${pkg.version}` — do NOT hardcode the number.
  - Verify version short-circuits before command dispatch so `--version somecommand` still prints
    the version (acceptance: "works alongside other flags").
  - Create `tests/cli-version.test.ts` — assert `run(["--version"])` and `run(["-v"])` return `0`
    and print `fleet-e2e-toy v1.0.0`; assert `run(["--version","--json"])` prints the JSON form and
    returns `0`; assert `run(["--version","notes"])` still prints version (precedence).
- **Done when:** `npm test` passes; manual `npm run cli -- --version` prints `fleet-e2e-toy v1.0.0`
  and `echo $?` / `$LASTEXITCODE` is 0.
- **Could block:** importing JSON across `rootDir` — `../../package.json` is outside `src`. If tsc
  complains, set the import to use `resolveJsonModule` (already on) and, if needed, add the file via
  a typed `version` constant module under `src/cli/` that re-exports `pkg.version`; prefer the
  direct JSON import first.

### Task 2.2 — VERIFY Phase 2
- **Type:** verify
- Reviewer confirms `--version`/`-v` exit 0, exact string, json variant valid, precedence over
  subcommands, version sourced from package.json.

---

## Phase 3 — SIGINT handling + JSON output mode (gh-toy-69s P2, gh-toy-aqd P2)

These two features share one data model and code path: graceful exit and error formatting both
depend on the `OutputWriter` and on a temp-file registry, and the SIGINT cleanup path must emit its
message in a way consistent with `--json` error formatting. Implementing them together avoids
touching the signal/exit code path twice. Cohesive unit → one phase.

### Task 3.1 — Temp-file registry + JSON output mode wiring
- **Type:** work
- **Model:** claude-sonnet-4-6
- **Files:**
  - Create `src/cli/tempfiles.ts` — a registry: `register(path: string): void`,
    `cleanupAll(): void` (best-effort `fs.rmSync` with `{ force: true }`, swallow errors), and
    `list(): string[]`. Used so SIGINT can remove partial output files (acceptance: "partial output
    files cleaned up"). No `any`.
  - Edit `src/cli/run.ts` / command dispatch — ensure every command emits through the
    `OutputWriter` so `--json` produces a single valid JSON document and text mode stays default.
    Add a demonstrable command that writes an output file (registered with the temp registry) so the
    cleanup behavior is observable and testable.
  - Edit `src/cli/output.ts` if needed so error formatting is identical between the SIGINT path and
    normal errors (`{"error":"..."}` in json, `Error: ...` on stderr in text).
  - Create `tests/cli-json.test.ts` — for a sample command, assert `--json` output parses with
    `JSON.parse` and matches expected shape; assert default output is human text; assert an error
    case under `--json` yields `{"error": "..."}` and a non-zero return code.
- **Done when:** `npm test` passes; `npm run cli -- <cmd> --json` output passes `JSON.parse`;
  error-under-json case returns non-zero and valid JSON.
- **Could block:** ensuring JSON mode never interleaves stray text — all writes must route through
  the writer; audit for any direct `process.stdout.write` outside the writer.

### Task 3.2 — SIGINT graceful shutdown
- **Type:** work
- **Model:** claude-sonnet-4-6
- **Files:**
  - Edit `src/cli/index.ts` (the shim — the legitimate place for process-level concerns) — register
    `process.on("SIGINT", handler)`. Handler: call `tempfiles.cleanupAll()`, write `Interrupted.`
    (to stderr in text mode; the shim is pre-`--json` parse, so print plain `Interrupted.` to
    stderr to guarantee "no stack trace" — JSON-mode SIGINT is out of scope and noted as a risk),
    then `process.exit(130)`. Ensure no stack trace is printed.
  - Extract the SIGINT handler into a testable function in `src/cli/signals.ts`
    (`createSigintHandler(cleanup, write, exit)`) so it can be unit-tested without sending a real
    signal; `index.ts` wires the real `process`/`tempfiles` into it.
  - Create `tests/cli-signals.test.ts` — call the handler with injected fakes; assert it invokes
    cleanup, writes exactly `Interrupted.`, and calls exit with `130`. No real signal needed.
- **Done when:** `npm test` passes; manual check: start a long-running `npm run cli -- <cmd>`,
  press Ctrl-C → prints `Interrupted.`, no stack trace, exit code 130, any registered temp file is
  gone.
- **Could block:** Windows Ctrl-C delivery under PowerShell can differ; the unit test (injected
  fakes) is the authoritative gate, manual check is confirmatory.

### Task 3.3 — VERIFY Phase 3
- **Type:** verify
- Reviewer confirms: `--json` valid on any subcommand with valid JSON output and JSON-formatted
  errors; human-readable default preserved; SIGINT prints `Interrupted.`, exits 130, no stack trace,
  temp files cleaned. Full suite + lint green.

---

## Risk Register (unverifiable-at-plan-time items)

- **JSON-mode SIGINT:** SIGINT fires in the shim before/independent of `--json` parsing; the handler
  emits plain `Interrupted.` on stderr. Emitting a JSON-shaped interrupt message is intentionally
  out of scope (acceptance only requires the literal `Interrupted.` + exit 130 + no trace).
- **Windows Ctrl-C semantics:** real-signal manual verification may behave differently under
  PowerShell vs POSIX; unit tests with injected fakes are the binding acceptance gate.
- **`bin` execution:** `dist/cli/index.js` only exists after `npm run build`; the `cli` ts-node
  script is the dev-time invocation path used by manual checks.

## Out of Scope
- No changes to the Express API (`src/api/`, `src/app.ts`), notes model, or HTTP validation.
- No new external dependencies (no yargs as a direct dep) — hand-rolled parser only.
- The aspirational `cli/README.md` on `main` is not imported or reconciled here.
