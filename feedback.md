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
