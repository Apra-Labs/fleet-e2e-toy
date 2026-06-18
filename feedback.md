# CLI Features Sprint -- Code Review (Phase 3: JSON output mode + SIGINT graceful shutdown)

**Reviewer:** claude-opus-4-8 (reviewer-p3-i1)
**Date:** 2026-06-18 01:22:42-04:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.
> Prior entries below: Phase 1 re-review (APPROVED, ab5cb0c HEAD), Phase 2 --version
> re-review (APPROVED), and the original plan/Phase-1/Phase-2 entries. This entry reviews
> Phase 3 (gh-toy-aqd JSON mode + gh-toy-69s SIGINT) at HEAD ae60eba on temp-requirements.

---

## Context & Scope

Branch `temp-requirements`, HEAD `ae60eba`, base `main`. Phase 3 is the only phase with new
production work: `src/cli/tempfiles.ts` (registry), `src/cli/signals.ts` (SIGINT handler
factory), the `write` subcommand added to `src/cli/run.ts`, and SIGINT wiring in
`src/cli/index.ts`. Per the review model, scope spans Phases 1-3; Phases 1 and 2 were
re-reviewed APPROVED in the prior entries and are unchanged at this HEAD. progress.json marks
Tasks 3.1, 3.2, 3.3 `completed`.

---

## Working Tree, Build, Lint, Tests, CI

PASS. `git status --porcelain` is empty -- the review ran against exactly the committed state.
Local HEAD `ae60eba` equals `origin/temp-requirements` (0 commits ahead). `npm run build`
(tsc, strict) compiles clean. `npm run lint` (eslint over src/ and tests/) is clean. `npm test`
reports 55 passed / 55 total across 8 suites. CI is green on the exact HEAD: GitHub Actions run
27738435098, `headSha=ae60ebae...`, `conclusion=success` on the temp-requirements branch.

---

## gh-toy-aqd -- JSON output mode (--json)

PASS. The acceptance criteria are met:

- **Accepted on any subcommand.** `--json` is a global flag parsed by `parseArgs`
  (`src/cli/parse.ts`) independent of position, then threaded through `createOutputWriter`.
  The plan's intent ("demonstrated by a real subcommand that produces structured output")
  is satisfied by the new `write` subcommand in `run.ts`, not just the placeholder default.
- **Output is valid JSON.** `tests/cli-json.test.ts` drives `run(["write", <tmp>, "--json"])`,
  `JSON.parse`s stdout, and asserts it equals `{command:"write", path:<tmp>, status:"ok"}`.
  In JSON mode the writer's `text()` is a no-op, so no human text interleaves into the JSON
  stream -- the success test parses cleanly, confirming no stray output.
- **Human-readable default.** `run(["write", <tmp>])` (no --json) emits `Wrote <tmp>` to stdout
  and the test asserts the output is NOT a JSON object (`JSON.parse(...)` throws).
- **Errors also JSON-formatted.** `run(["write", "--json"])` (missing filename) returns 1 and
  emits `{"error":"write requires a filename"}` on stdout; the text-mode counterpart
  `run(["write"])` returns 1 and emits `Error: write requires a filename` on stderr with no
  stdout output. This exercises BOTH `OutputWriter.error()` branches, closing the item the
  Phase 1 reviewer explicitly deferred to Phase 3. The non-zero exit on the error path matches
  the plan's contract.

NOTE (non-blocking, style): in `run.ts` the `write` success path calls `writer.text(...)` and
`writer.json(...)` unconditionally rather than branching on `parsed.json` (as the `--version`
path does). This is correct because the inactive method no-ops in each mode -- verified by the
passing JSON success test that parses cleanly -- but it is slightly inconsistent with the
mode-conditional style used elsewhere and relies on the writer's no-op contract for correctness.
Acceptable as-is; worth keeping in mind if a future writer ever stops no-opping.

---

## gh-toy-69s -- SIGINT graceful shutdown

PASS. The acceptance criteria are met:

- **Prints `Interrupted.` and exits 130, no stack trace.** `src/cli/signals.ts` exports a pure,
  injectable `createSigintHandler({cleanup, write, exit})` whose returned handler calls
  `cleanup()` -> `write("Interrupted.\n")` -> `exit(130)`, in that order, and never throws or
  rethrows (so no stack trace). `tests/cli-signals.test.ts` asserts the exact string,
  `exit(130)`, and the call order with injected fakes -- the binding gate per the plan (real
  Ctrl-C delivery under Windows/PowerShell is confirmatory only).
- **No stdout corruption.** The shim (`src/cli/index.ts`) wires the handler to write to
  `process.stderr`, so any JSON already emitted on stdout is not corrupted by the interrupt
  message. This matches the plan's design decision.
- **Partial output files cleaned up.** The handler's `cleanup` is wired to `cleanupAll` from the
  temp-file registry. The `write` subcommand `register()`s the file it creates, so an interrupt
  removes registered partial output. The registry's `cleanupAll` is best-effort (try/catch
  around `fs.rmSync(path, {force:true})`) and never throws, tested directly.
- **index.ts shim is the right home.** Process-level `SIGINT`/`process.exit` concerns live only
  in the shim, which is excluded from coverage; the testable logic lives in `signals.ts`. DRY
  constraint honored -- no parallel parser/runner/entrypoint introduced.

---

## Temp-file registry

PASS. `src/cli/tempfiles.ts` exports exactly the three specified functions with no `any`:
`register` (push), `cleanupAll` (best-effort delete + clear), `list` (returns a copy).
`tests/cli-tempfiles.test.ts` covers register-then-list, the defensive-copy property (mutating
the returned array does not affect the registry), real-file deletion + emptied list, and
best-effort delete of a non-existent path (does not throw). Coverage is meaningful, not
box-ticking.

---

## Test Quality

PASS with one NOTE. New suites are focused and each case covers a distinct behavior (JSON
success, text success, JSON error, text error; registry register/copy/delete/missing-path;
signal order/string/code). No redundant overlap of concern.

NOTE (non-blocking): in `tests/cli-signals.test.ts`, the case titled "does not throw even if
cleanup throws internally" injects a no-op `cleanup` that never actually throws, so it does not
exercise a throwing-cleanup scenario -- it only confirms the handler does not throw with
well-behaved deps. The handler itself does not guard a throwing `cleanup` (a throw there would
propagate and could surface a trace). Because the production wiring injects `cleanupAll`, which
is itself try/catch-guarded and provably non-throwing, the end-to-end "no stack trace" guarantee
holds. This is a test-naming/coverage nuance, not a correctness defect; not required for
approval, but the title should be corrected or the test should inject a throwing cleanup to match
its description.

---

## File Hygiene

PASS. `git diff --name-only main..temp-requirements` lists only source (`src/cli/*.ts`), tests
(`tests/cli-*.test.ts`), sprint tracking (PLAN.md, requirements.md, progress.json, feedback.md),
and build config the CLI needs (package.json, jest.config.ts). No temp/scratch files, no
tool/harness config, no stale `plan-NNN`/`progress-NNN` artifacts. No `console.log` and no `any`
anywhere under `src/cli/` (grep-confirmed). `dist/` and `.beads/` are gitignored, not staged.

---

## Done-Criteria Check (PLAN.md Tasks 3.1-3.3)

PASS. Task 3.1: tempfiles registry with the three exports, `write` subcommand replacing the
placeholder dispatch, both new test suites green, both `error()` branches exercised -- all
present. Task 3.2: `createSigintHandler` factory + shim wiring + signals test -- all present.
Task 3.3 VERIFY: build/lint/test green, no any, no console.log, committed AND pushed, CI green
on pushed HEAD `ae60eba`. Every done-criterion is satisfied.

---

## Summary

Phase 3 (JSON output mode + SIGINT graceful shutdown) is APPROVED. Both issues meet their
requirements.md acceptance criteria: `--json` is accepted on a real subcommand with valid-JSON
success output, text default, and JSON-formatted errors on a non-zero exit; SIGINT prints
exactly `Interrupted.`, exits 130 with no stack trace, and triggers best-effort cleanup of
registered partial files. The Phase 1 deferred error-path coverage is now closed. Phases 1-2
remain intact (no regression). Clean tree, green build/lint/55 tests, green CI on HEAD.

Two non-blocking NOTEs for future polish: (1) the `write` success path calls both writer methods
unconditionally instead of branching on mode (correct due to no-op contract); (2) the signals
"does not throw even if cleanup throws" test does not actually inject a throwing cleanup -- its
title overstates what it verifies. Neither affects correctness or acceptance; nothing is required
before merge.

---

# CLI Features Sprint -- Code Review (Phase 1: CLI Foundation, re-review)

**Reviewer:** claude-opus-4-8 (reviewer-p1-i1)
**Date:** 2026-06-18 01:04:37-04:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.
> Prior entries: 8da3ccf (plan review, APPROVED), 7730f94 (Phase 1 code review, APPROVED),
> 861136c (Phase 2 --version, CHANGES NEEDED -- targeted the unrelated `feat/p1-cli-features`
> branch, not `temp-requirements`; resolved in PLAN.md Phase 2 provenance notes), 7625502
> (re-stated plan review APPROVED). This entry re-reviews Phase 1 at the current HEAD to confirm
> the foundation has not regressed under the Phase 2 and Phase 3 work layered on top of it.

---

## Context & Scope

Branch `temp-requirements`, HEAD `ab5cb0c`, base `main`. Phase 1 "CLI Foundation (shared
abstraction)" was previously APPROVED at HEAD `48162f2` (commit 7730f94). Per the review model,
scope spans Phase 1 through the current phase, so this pass re-verifies that the Phase 1 surface
(`parseArgs`, `OutputWriter`/`createOutputWriter`, the `run()` signature, the `index.ts` shim,
the two foundation test suites, and the jest coverage exclusions) is still intact after Phases 2
(`--version`) and 3 (`--json` write subcommand + SIGINT) built on it.

progress.json marks Tasks 1.1, 1.2, 1.3 `completed`. This review confirms Phase 1 remains valid.

---

## Working Tree, Build, Lint, Tests

PASS. `git status --porcelain` is empty -- clean tree; the review ran against exactly the
committed state. `npm run build` (tsc, strict) compiles clean. `npm run lint` (eslint over
`src/` and `tests/`) is clean. `npm test` reports 55 passed / 55 total across 8 suites. CI is
green on the exact HEAD: run 27737868880, `headSha=ab5cb0c...`, conclusion `success` on
Apra-Labs/fleet-e2e-toy.

---

## Phase 1 Foundation -- Regression Check

PASS. The shared abstractions are unchanged from the approved state:

- `src/cli/types.ts` -- `ParsedArgs` and `OutputWriter` interfaces unchanged; no `any`
  (`OutputWriter.json(o: unknown)` keeps the strict-typing convention).
- `src/cli/parse.ts` -- `parseArgs` is the approved hand-rolled parser:
  recognizes `--version`/`-v`, `--json`, `--help`/`-h`; first non-flag token becomes `command`;
  unknown flags preserved into `args` (non-fatal). No yargs dependency introduced.
- `src/cli/output.ts` -- `createOutputWriter(json)` unchanged: all output via
  `process.stdout`/`process.stderr`, no `console.log`. Text mode `error()` -> `Error: <msg>` on
  stderr; JSON mode `error()` -> `{"error":"<msg>"}` on stdout; cross-mode no-ops intact.
- `src/cli/run.ts` -- the Phase 1 contract is preserved: still `async run(argv): Promise<number>`,
  still parses -> builds writer -> dispatches -> returns an exit code, still does NOT call
  `process.exit` (stays unit-testable). Phase 3 correctly EXTENDED this file (added the `write`
  subcommand) rather than forking a parallel runner -- the DRY constraint from PLAN.md was
  honored. The default/no-command branch the Phase 1 tests assert (`fleet-e2e-toy: command=<cmd>`
  text, `{status,command,args}` json, `(none)`/`null` for empty) is still present and passing.
- `src/cli/index.ts` -- still a thin `#!/usr/bin/env node` shim; `process.exit` for normal flow
  lives only here. Phase 3 added SIGINT wiring in this shim, which is the legitimate place for
  process-level concerns, and the file remains excluded from coverage (the testable logic lives
  in `signals.ts`).
- `jest.config.ts` -- coverage exclusions for `src/index.ts` and `src/cli/index.ts` (the two
  shims) unchanged.

## Foundation Tests

PASS. `tests/cli-parse.test.ts` (12 tests) and `tests/cli-run.test.ts` (6 tests) are unchanged
and green. They exercise every `parseArgs` branch (each flag/alias, command extraction,
positional args, flags-before/after command, unknown-flag preservation, flags-only, empty argv)
and the runner's exit code / text / valid-JSON / command-in-JSON / no-command paths. Spies on
`process.stdout/stderr.write` are restored in `afterEach`, so no suite bleed.

## Phase 1 Deferred Item -- now closed

PASS. The Phase 1 review (7730f94) flagged that both `OutputWriter.error()` branches were
implemented but unexercised, deferring coverage to Phase 3. That is now satisfied:
`tests/cli-json.test.ts` drives `run(["write", "--json"])` (asserts `{error: ...}` on stdout +
non-zero) and `run(["write"])` (asserts `Error: ...` on stderr + non-zero), covering both
branches. The deferred item is closed.

## File Hygiene

PASS. `git diff --name-only main..temp-requirements` lists only source (`src/cli/*.ts`), tests
(`tests/cli-*.test.ts`), and sprint tracking (PLAN.md, requirements.md, progress.json,
feedback.md, plus package.json/jest.config.ts as build config the CLI needs). No temp/scratch
files, no tool/harness config committed (`.claude/settings.local.json`, `.beads/`, `dist/`,
`.opencode/` are all gitignored, not staged). No `console.log` or `any` anywhere under
`src/cli/` (grep-confirmed).

---

## Summary

Phase 1 (CLI Foundation) is APPROVED on re-review. The shared parser, output writer, runner
signature, and shim are intact and were extended -- not forked -- by the later phases, so the
foundation has not regressed. Clean tree, green build/lint/55 tests, green CI on HEAD `ab5cb0c`.
The error-path coverage deferred at the original Phase 1 approval is now exercised by Phase 3
tests. Nothing required for Phase 1.

---

# CLI Features Sprint -- Code Review (Phase 2: --version flag, re-review)

**Reviewer:** claude-sonnet-4-6 (reviewer-p2-i1)
**Date:** 2026-06-18 00:00:00+00:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.
> The prior CHANGES NEEDED entry (861136c) reviewed the wrong branch (`feat/p1-cli-features`),
> which had no connection to PLAN.md or the Phase 1 foundation. This entry reviews the actual
> Phase 2 work on the canonical sprint branch `temp-requirements`, commits `6259c02` and `ec8aa1d`.

---

## Context & Resolution of Prior CHANGES NEEDED

The prior Phase 2 review (861136c, reviewer-p2-i1) flagged: Phase 1 foundation absent, version
hardcoded, JSON mode missing, commit not pushed, stray demo fixture files present. All five
findings were specific to `feat/p1-cli-features` -- a separate, out-of-band branch that was
never the canonical sprint branch. On `temp-requirements`, every one of those findings is
inapplicable: Phase 1 was already approved here, version is sourced from `package.json`, JSON
mode is implemented, commits are pushed, and no stray fixtures are present. PLAN.md was updated
(commit `c90b6c9`) to explicitly document this provenance and clarify which branch is canonical.
The prior CHANGES NEEDED is resolved.

---

## Working Tree

PASS. `git status --porcelain` is empty -- clean working tree. Note: local HEAD is `7161465`
(Phase 3 VERIFY checkpoint), which is one commit ahead of `origin/temp-requirements` (`cb7f27b`).
The Phase 2 commits (`6259c02`, `ec8aa1d`) are fully pushed and were included in prior CI runs.
The single unpushed commit is a progress.json-only tracking update from Phase 3 verify; it does
not affect Phase 2 correctness. CI is green on pushed HEAD `cb7f27b`.

---

## CI

PASS. GitHub Actions CI (Apra-Labs/fleet-e2e-toy) is green on the pushed commits that include
Phase 2 work. Most recent relevant run: run 27738053143, conclusion `success`, branch
`temp-requirements`. Phase 2 code has been in CI for multiple successful runs.

---

## Implementation Correctness

### Version sourced from package.json -- not hardcoded

PASS. `src/cli/run.ts` (commit `6259c02`) imports:
```
import pkg from "../../package.json";
```
and uses `pkg.version` in both text mode (`fleet-e2e-toy v${pkg.version}`) and JSON mode
(`{ name: "fleet-e2e-toy", version: pkg.version }`). The `resolveJsonModule: true` tsconfig
setting enables this import. If `package.json` version is bumped, the CLI output updates
automatically. The prior review's hardcoded version finding does not apply here.

NOTE: The `name` field in JSON mode output (`"fleet-e2e-toy"`) is a string literal rather than
`pkg.name` (which is `"noteapi"`). This is intentional: requirements.md specifies the output
as `fleet-e2e-toy v1.0.0` and PLAN.md specifies the JSON form as
`{"name":"fleet-e2e-toy","version":"1.0.0"}`. Using `pkg.name` would produce `"noteapi"`, which
would violate the acceptance criteria. The hardcoded name literal is correct.

### JSON output mode present

PASS. The version short-circuit in `run.ts` branches on `parsed.json`:
- JSON mode: `writer.json({ name: "fleet-e2e-toy", version: pkg.version })` -- produces a single
  valid JSON document on stdout via `OutputWriter`.
- Text mode: `writer.text(`fleet-e2e-toy v${pkg.version}`)` -- human-readable to stdout.

Both paths go through the `OutputWriter` abstraction (no direct `process.stdout.write` in
`run.ts` outside the writer). The prior review's "JSON mode missing" finding does not apply here.

### Precedence over subcommands

PASS. The `if (parsed.version)` block is the first dispatch in `run()`, before the `write`
subcommand and before the default no-command case. `--version notes` returns version output,
not the `write` path.

### Architecture alignment with PLAN.md

PASS. Phase 2 edits only `src/cli/run.ts` (the correct file per Task 2.1), reuses `parseArgs`
and `OutputWriter` from Phase 1, does not introduce a parallel parser or new entrypoint, and
keeps `run()` returning `Promise<number>` without calling `process.exit`. DRY constraint honored.

---

## Build, Lint, Tests

PASS. `npm run build` (tsc, strict) compiles clean. `npm run lint` is clean. `npm test`
reports 55 passed / 55 total across 8 suites, including `tests/cli-version.test.ts` (4 tests):

- `run(["--version"])` -- returns 0, stdout equals `"fleet-e2e-toy v1.0.0\n"`.
- `run(["-v"])` -- returns 0, same output (short-alias coverage).
- `run(["--version", "--json"])` -- returns 0, stdout parses as JSON, equals
  `{ name: "fleet-e2e-toy", version: "1.0.0" }`.
- `run(["--version", "notes"])` -- returns 0, version output (precedence test).

All four done-criteria from PLAN.md Task 2.1 are tested and green. Test quality is appropriate:
no redundant tests, each covers a distinct behavioral branch. Spies are restored in `afterEach`.

---

## File Hygiene

PASS. Phase 2 adds two files only: `src/cli/run.ts` (modified -- version short-circuit added)
and `tests/cli-version.test.ts` (new -- 4 tests). Both are directly justified by Task 2.1.
No temp files, no tool config, no demo fixtures. The overall branch file list
(`git diff --name-only main..temp-requirements`) contains only source, tests, and sprint
tracking files -- all justified.

---

## Progress.json

PASS. Tasks 2.1 and 2.2 are marked `completed`. Task 2.2 notes explicitly clarify that the
prior CHANGES NEEDED was for the unrelated branch, not `temp-requirements`. The completion
claims (version sourced from package.json, JSON variant valid, precedence works) are all
accurate for this branch.

---

## Summary

Phase 2 (`--version` flag) is APPROVED on re-review. The implementation on `temp-requirements`
correctly follows PLAN.md: version sourced from `package.json` via `resolveJsonModule` import,
JSON mode present and routed through `OutputWriter`, precedence over subcommands, all built on
the Phase 1 foundation. Four tests cover all acceptance criteria. Build, lint, and full test
suite (55/55) are green. CI is green on pushed HEAD. No file hygiene issues.

The prior CHANGES NEEDED (861136c) was correctly identified at the time as targeting the wrong
branch; that finding is fully resolved by confirming this review is against `temp-requirements`.
