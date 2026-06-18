# CLI Features Sprint -- Code Review (Phase 1: CLI Foundation)

**Reviewer:** claude-opus-4-8 (reviewer-p1-i1)
**Date:** 2026-06-18 04:15:00+00:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.
> The prior entry (commit 8da3ccf) was the **plan review** (APPROVED). This is the
> first **code review**, covering Phase 1 (Tasks 1.1 and 1.2).

---

## Context & Scope

Reviewing Phase 1 "CLI Foundation (shared abstraction)" on branch `temp-requirements`
(sprint label `sprint/cli-features`). The named branch `sprint/cli-features` does not exist
locally or on the remote; `temp-requirements` is the active working branch carrying the sprint
tracking files (PLAN.md, requirements.md, progress.json, feedback.md) and the Phase 1 work.
HEAD is `48162f2`.

Phase 1 commits reviewed:
- `a7e57fc` Tasks 1.1 & 1.2: CLI foundation -- entrypoint, parser, output abstraction, tests
- `48162f2` Task 1.3: mark Phase 1 tasks complete in progress.json

progress.json marks Tasks 1.1 and 1.2 `completed`; Task 1.3 (VERIFY) is `pending` and is
satisfied by this review.

---

## Working Tree, Build, Lint, Tests

PASS. `git status --porcelain` is empty -- clean tree, review ran against exactly the committed
state. `npm run build` (tsc, strict mode) compiles with no errors. `npm run lint` (eslint) is
clean. `npm test` reports 39 passed / 39 total across 4 suites, including the two new CLI suites
(cli-parse: 12 tests, cli-run: 6 tests). Existing notes/validation suites still pass -- no
regression.

CI: green for HEAD `48162f2` (`test: completed success` via GitHub Actions on Apra-Labs/fleet-e2e-toy).

---

## Done Criteria (Task 1.1 -- entrypoint, parser, output abstraction)

PASS. Every file the plan specified exists with the specified shape:
- `src/cli/types.ts` -- `ParsedArgs` and `OutputWriter` interfaces exactly as planned, no `any`.
- `src/cli/parse.ts` -- hand-rolled `parseArgs`: recognizes `--version`/`-v`, `--json`,
  `--help`/`-h`; first non-flag token becomes `command`; unknown flags preserved into `args`
  (not fatal). No transitive yargs dependency pulled in, per the plan's decision.
- `src/cli/output.ts` -- `createOutputWriter(json)` routes all output through
  `process.stdout`/`process.stderr` (no `console.log`). Text mode: `text()` -> stdout,
  `error()` -> `Error: <msg>` on stderr. JSON mode: `json()` -> serialized stdout,
  `error()` -> `{"error":"<msg>"}` on stdout, `text()` suppressed. This matches the planned
  error-formatting contract that Phases 2/3 will reuse.
- `src/cli/run.ts` -- `async run(argv): Promise<number>` parses, builds writer, dispatches a
  placeholder, returns an exit code, does NOT call `process.exit` (stays unit-testable). Good.
- `src/cli/index.ts` -- thin shim with `#!/usr/bin/env node`, the only place `process.exit` is
  called for normal flow. Correctly excluded from coverage in jest.config.ts (mirrors the
  existing `!src/index.ts` exclusion).
- `package.json` -- `bin.fleet-e2e-toy -> dist/cli/index.js` and `cli` ts-node script added.

Manual checks from the plan's done criteria reproduced:
- `npm run cli -- somecommand` -> `fleet-e2e-toy: command=somecommand`
- `npm run cli -- --json somecommand` -> `{"status":"ok","command":"somecommand","args":[]}`
  (valid JSON).

Convention compliance: no `any` types and no `console.log` anywhere under `src/cli/` (grep
confirmed). CLI stdout/stderr writes are appropriate here -- the CLAUDE.md `console.log` ban is
scoped to route handlers, and the entrypoint correctly uses `process.stdout.write` regardless.

---

## Done Criteria (Task 1.2 -- foundation tests)

PASS. Coverage is meaningful, not box-checking:
- `tests/cli-parse.test.ts` (12 tests): each flag and alias (`--version`/`-v`, `--json`,
  `--help`/`-h`), command extraction, command+positional args, flags-before-command,
  mixed flag/command/arg ordering, unknown-flag preservation, flags-only (no command), and
  empty argv defaults. This exercises every branch of `parseArgs`.
- `tests/cli-run.test.ts` (6 tests): exit code, human text in default mode, valid-JSON in
  `--json` mode (asserted via `JSON.parse`), command name in JSON, no-command in text (`(none)`),
  no-command in JSON (`null`). Uses `process.stdout/stderr` spies with `mockRestore()` in
  `afterEach`, so other suites are unaffected -- confirmed by the full suite passing.

No redundant/overlapping tests of note; each asserts a distinct behavior.

---

## Test Coverage Gap Assessment (not blocking)

NOTE. `OutputWriter.error()` (both the text-mode `Error: <msg>` stderr path and the json-mode
`{"error":...}` path) is implemented in Phase 1 but not yet directly exercised by a test. This is
**appropriately deferred**, not a Phase 1 hole: the plan routes error-path coverage to Phase 3
Task 3.1 (`tests/cli-json.test.ts` asserts the error-under-json shape and non-zero return). There
is no error-producing code path in the Phase 1 placeholder runner to test against yet. I am
flagging it only so the Phase 3 reviewer confirms the `error()` paths do get covered when the
first real error case lands; if Phase 3 ships without exercising both `error()` branches, that
phase should not close.

---

## Requirements Alignment

PASS (foundation-level). Phase 1 does not implement any of the three user-facing acceptance
criteria (`--version`, SIGINT, `--json` mode) -- by design; those are Phases 2 and 3. What Phase 1
delivers is the shared abstraction those features hang off: a parser that already recognizes the
`--version`/`-v`/`--json` tokens, and an `OutputWriter` whose text/json/error contract matches the
exact output strings the later acceptance criteria require (`fleet-e2e-toy v1.0.0`,
`{"error":"..."}`). The foundation is correctly aligned with downstream requirements intent.

---

## File Hygiene

PASS. `git diff --name-only main..temp-requirements` lists 13 files, all justifiable:
- Sprint tracking: PLAN.md, requirements.md, progress.json, feedback.md.
- CLI source: src/cli/{types,parse,output,run,index}.ts.
- Tests: tests/cli-parse.test.ts, tests/cli-run.test.ts.
- Config edits the plan explicitly called for: jest.config.ts (coverage exclusion for the shim),
  package.json (bin + cli script).
No scratch files (`*.tmp`, `*.base64`, `*.txt`), no harness/tool config (`.claude/settings.json`,
`permissions.json`), no stale `plan-NNN`/`progress-NNN` artifacts.

---

## Summary

Phase 1 is solid and complete. The working tree is clean, build and lint are clean, all 39 tests
pass, and CI is green on HEAD. Tasks 1.1 and 1.2 meet every done criterion in PLAN.md, including
the manual `npm run cli` checks. The shared abstraction (`ParsedArgs`, `OutputWriter`, `run()`) is
correctly front-loaded, kept unit-testable (no `process.exit` in `run`), and conforms to project
conventions (no `any`, no `console.log`, errors wrapped as `{ error: ... }`). Test coverage of the
foundation is meaningful. File hygiene is clean.

One deferred item for the Phase 3 reviewer to track: `OutputWriter.error()`'s two branches are not
yet directly tested -- they should be covered when the first real error path lands in Phase 3.

Verdict: APPROVED. Task 1.3 (VERIFY Phase 1) is satisfied.
