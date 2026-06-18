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
