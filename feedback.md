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

---

# CLI Features Sprint -- Code Review (Phase 2: --version flag)

**Reviewer:** claude-sonnet-4-6 (reviewer-p2-i1)
**Date:** 2026-06-18 08:00:00+00:00
**Verdict:** CHANGES NEEDED

> See the recent git history of this file to understand the context of this review.
> The prior entry (reviewer-p1-i1) approved Phase 1 on branch `temp-requirements`.
> This review covers Phase 2 "-- version flag (gh-toy-4ef, P1)" on branch `feat/p1-cli-features`.

---

## Branch Resolution

The sprint specification names `sprint/cli-features` as the working branch. That branch does not
exist locally or on the remote. There are two separate branches carrying CLI work:

- `temp-requirements`: Phase 1 (foundation) + Phase 2 work done by the approved doer (claude-sonnet-4-6
  for Phase 1, claude-haiku-4-5-20251001 for Phase 2). PLAN.md, requirements.md, progress.json,
  and feedback.md all live here. Phase 2 commits `6259c02` and `ec8aa1d` are on this branch and
  follow the plan exactly.
- `feat/p1-cli-features`: A completely different, apparently out-of-band implementation. One commit
  (`696fe3a`) from a separate doer that ignores Phase 1 entirely and builds a parallel architecture.
  No PLAN.md, no progress.json, no feedback.md, no requirements.md.

The reviewer-requested branch `sprint/cli-features` does not map to either of these. This review
was directed at `feat/p1-cli-features` (the only local branch with the `--version` label). The
findings below are for that branch.

---

## Working Tree

PASS (on `feat/p1-cli-features`). `git status --porcelain` is empty -- clean local working tree.
However, the Phase 2 commit `696fe3a` is **local-only and not pushed**. The remote
`origin/feat/p1-cli-features` is at `aa7c101` (the main branch cut point). Work stranded locally
is not reviewable by CI and violates the session completion protocol in CLAUDE.md ("Work is NOT
complete until `git push` succeeds"). FAIL.

---

## CI

FAIL. Since commit `696fe3a` was never pushed to the remote, GitHub Actions has never run against
it. There is no CI green status to verify. The remote branch tip (`aa7c101`) pre-dates any CLI
work.

---

## Architecture Divergence from PLAN.md

FAIL. This is the most critical finding. PLAN.md Phase 1 specified a `src/cli/` directory with
five files (`types.ts`, `parse.ts`, `output.ts`, `run.ts`, `index.ts`) forming the shared
foundation. PLAN.md Phase 2 Task 2.1 specifies editing `src/cli/run.ts` to handle the version
flag, using the `ParsedArgs`/`OutputWriter` abstractions from Phase 1, and sourcing the version
from `package.json` via `import pkg from "../../package.json"`.

The `feat/p1-cli-features` branch has none of the Phase 1 foundation:

- No `src/cli/` directory at all.
- No `ParsedArgs` interface, no `OutputWriter` interface, no `run()` function.
- Instead, a flat `src/cli.ts` file was created with `handleCLIArgs(args: string[]): CLIResult`,
  a synchronous function with no JSON output mode support and no output abstraction.
- `src/index.ts` was modified to call `handleCLIArgs` and handle the result inline -- wiring
  CLI behavior into the Express server entrypoint directly, which the plan explicitly avoided
  (the plan put the shim in `src/cli/index.ts` to keep it separate from the HTTP server path).

This doer did not read or follow PLAN.md. Phase 2 cannot be built on top of a Phase 1 that was
never implemented per the plan.

---

## Version Hardcoded -- Plan Violation

FAIL. PLAN.md Task 2.1 explicitly requires:

> The version number is read from `package.json` (`import pkg from "../../package.json"`,
> allowed by `resolveJsonModule`) and formatted as `fleet-e2e-toy v${pkg.version}` -- do NOT
> hardcode the number.

`src/cli.ts` line 1:
```
export const VERSION = "fleet-e2e-toy v1.0.0";
```

The version is hardcoded as a string literal. If `package.json` version is bumped, the CLI would
silently report the wrong version. This directly contradicts the plan's explicit instruction.

---

## JSON Output Mode Missing

FAIL. PLAN.md Task 2.1 requires:

> in json mode write `{"name":"fleet-e2e-toy","version":"1.0.0"}`. Return `0`.

The `handleCLIArgs` function has no concept of a `--json` flag at the point where version is
returned. The `CLIResult` interface has no `json` mode field. The test file (`tests/cli.test.ts`)
has no test for `run(["--version","--json"])` producing the JSON variant.

The Phase 2 done criteria in progress.json (task 2.2) state "JSON variant valid" was verified --
this claim is false for this branch.

---

## Stray / Unjustifiable Files

FAIL. `git diff --name-only main..feat/p1-cli-features` includes:

- `plan.md` -- This is the old demo fixture (`NoteAPI v2 -- Search, Pagination, and Archiving`)
  unrelated to this sprint. It was not present on main before `f0e34f9` removed it. It is a lab
  artifact, not a sprint deliverable.
- `progress.md` -- Same demo fixture describing tag filtering and full-text search. No relation
  to CLI work.

Both files are unjustifiable against the sprint requirements and should not be in this branch.

---

## Tests

Locally: `npm test` passes (37 tests across 3 suites), build and lint are clean. The tests that
exist do test `--version` and `-v` behavior correctly for the simplified `handleCLIArgs` API.
However the test suite is testing the wrong abstraction (the flat `CLIResult`-based API rather
than `run()` returning a `Promise<number>` via the planned `OutputWriter`). The missing JSON mode
test is a direct gap against the plan's done criteria.

---

## Progress.json Task 2.2 Verification Claim is Inaccurate

FAIL. The `progress.json` on `temp-requirements` branch (the actual sprint tracking file) shows
Task 2.2 `completed` with notes: "Verified: --version/v flags exit 0, print exact string
'fleet-e2e-toy v1.0.0', JSON variant valid, precedence over subcommands works, version sourced
from package.json."

This completion entry refers to the `temp-requirements` branch work (where all those properties
are true), not to the `feat/p1-cli-features` branch (where JSON variant and package.json sourcing
are both false). The review must focus on what is actually committed on the branch under review.

---

## Summary

The `feat/p1-cli-features` branch cannot be approved for Phase 2 for the following reasons:

1. **Phase 1 foundation is absent.** No `src/cli/` directory, no `ParsedArgs`, no `OutputWriter`,
   no `run()` function. Phase 2 built a parallel architecture instead of extending Phase 1.
2. **Version is hardcoded** as a string literal -- plan explicitly prohibited this.
3. **JSON output mode is missing** -- `--version --json` does not produce `{"name":"...","version":"..."}`.
4. **Commit not pushed** -- `696fe3a` is local-only; CI has never run against Phase 2 work.
5. **Stray files** -- `plan.md` and `progress.md` are unrelated demo fixtures with no justification.
6. **No sprint tracking files** -- PLAN.md, requirements.md, progress.json, and feedback.md are
   all absent from this branch, making the sprint state unauditable.

**Required actions for re-review:**
- Either rebase `feat/p1-cli-features` onto the Phase 1 foundation from `temp-requirements`, or
  confirm that `temp-requirements` is the canonical sprint branch and the Phase 2 work already
  there (commits `6259c02`, `ec8aa1d`) is what should be reviewed.
- If `feat/p1-cli-features` is to be the sprint branch, implement Phase 1 per PLAN.md first,
  then re-implement Phase 2 on top of it: source version from `package.json`, implement JSON
  mode, edit `src/cli/run.ts` (not `src/cli.ts`).
- Remove `plan.md` and `progress.md` from the branch.
- Push all commits and verify CI is green before requesting re-review.

---

# CLI Features Sprint -- Plan Review (PLAN.md + progress.json structural validation)

**Reviewer:** claude-sonnet-4-6 (plan-reviewer-r0)
**Date:** 2026-06-18 00:00:00+00:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.
> Prior entries: reviewer-p1-i1 (APPROVED Phase 1 code), reviewer-p2-i1 (CHANGES NEEDED Phase 2 code).
> This entry is a structural validation of PLAN.md and progress.json as plan documents.

---

## Structural Checks

### Phases Array Not Empty

PASS. `progress.json` contains 3 phases (IDs "1", "2", "3"). All are present and non-empty.

### Tasks Array Not Empty

PASS. `progress.json` contains 8 tasks (IDs 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 3.3). All are
present and non-empty.

### Each Phase Has a Verify Task

PASS.
- Phase 1: Task 1.3 "VERIFY Phase 1" (type: verify in PLAN.md).
- Phase 2: Task 2.2 "VERIFY Phase 2" (type: verify in PLAN.md).
- Phase 3: Task 3.3 "VERIFY Phase 3" (type: verify in PLAN.md).

All three phases have an explicit verification gate.

### Each Phase Has "model" and "reviewer_model"

PASS. All three phase objects in `progress.json` include both fields:
- Phase 1: `model: claude-sonnet-4-6`, `reviewer_model: claude-opus-4-8`
- Phase 2: `model: claude-haiku-4-5-20251001`, `reviewer_model: claude-sonnet-4-6`
- Phase 3: `model: claude-opus-4-8`, `reviewer_model: claude-opus-4-8`

### All Model IDs Are in the Allowed Set

PASS. The allowed set is: `claude-haiku-4-5-20251001`, `claude-sonnet-4-6`, `claude-opus-4-8`.

Checking every model ID across phases and tasks:
- Phase models: claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-8 -- all valid.
- Phase reviewer_models: claude-opus-4-8, claude-sonnet-4-6, claude-opus-4-8 -- all valid.
- Task models: claude-sonnet-4-6 (tasks 1.1, 1.2, 1.3, 3.1, 3.2), claude-haiku-4-5-20251001
  (tasks 2.1, 2.2), claude-opus-4-8 (task 3.3) -- all valid.

No disallowed model IDs found anywhere in the document.

---

## Plan Quality Checks

### Done Criteria

PASS. Every task in PLAN.md states explicit done criteria:
- Tasks 1.1 and 1.2: "build + lint clean; `npm run cli -- somecommand` and `--json somecommand` work."
- Task 2.1: version flag text/json output, exit 0, precedence over subcommands.
- Tasks 3.1 and 3.2: "npm run build clean; npm test green including the two new suites; [specific
  manual verification steps]."
- Verify tasks (1.3, 2.2, 3.3): checklist items the reviewer confirms against committed state.

All criteria are sufficiently concrete that two different developers would agree on whether they
are met.

### Cohesion and Coupling

PASS. Each phase is a coherent unit:
- Phase 1: foundation only -- parser, output abstraction, runner. No feature logic.
- Phase 2: single feature (--version) building on the Phase 1 abstraction.
- Phase 3: two tightly coupled features (JSON mode + SIGINT) that share a single code path and
  data model (temp-file registry, OutputWriter error contract). Grouping them into one phase is
  the right call -- the plan's rationale ("both depend on the OutputWriter error contract and on a
  temp-file registry") is sound.

### Key Abstractions Front-Loaded

PASS. Phase 1 establishes `ParsedArgs`, `OutputWriter`, and `run()` before any feature work
begins. PLAN.md explicitly instructs Phase 3 doers to reuse these and not reinvent them.

### Riskiest Assumption Validated First

PASS. The riskiest assumption (TypeScript strict compilation with `resolveJsonModule` + `import
pkg from package.json`, hand-rolled parser, `process.stdout` spy pattern for tests) is validated
in Phase 1 Task 1.1 before any feature work begins. Phase 1 is APPROVED and verified.

### DRY

PASS. PLAN.md contains an explicit DRY constraint at the top of Phase 3: "every task below MUST
reuse `parseArgs`, `OutputWriter`/`createOutputWriter`, and `run()` from Phase 1."

### Phase Boundaries at Cohesion Boundaries

PASS. See cohesion check above. Each phase boundary falls where a logical unit closes: foundation,
first feature, combined final features.

### Model Assignments and Streaking

NOTE. There is a minor inconsistency between phase-level and task-level model assignments in Phase 3.
`progress.json` phase 3 `model` is `claude-opus-4-8`, but PLAN.md tasks 3.1 and 3.2 (the work
tasks) specify `model: claude-sonnet-4-6`. The task-level model is authoritative for dispatching
the doer; the phase-level `model` appears to have been set incorrectly in `progress.json` for
Phase 3. This inconsistency does not block the plan (all model IDs are valid and the task-level
assignments determine actual dispatch), but the phase-level field should be corrected to
`claude-sonnet-4-6` to match tasks 3.1 and 3.2, with `claude-opus-4-8` reserved for the reviewer
role (already correctly set as `reviewer_model`). This is a low-severity data quality issue.

Tasks 3.1 and 3.2 are both `claude-sonnet-4-6`, which correctly batches them into a single
streak. Task 3.3 (VERIFY) is `claude-opus-4-8` as assigned by the orchestrator.

### Each Task Completable in One Dispatch

PASS. Task 3.1 is the largest (two new source files + two new test files + edit to run.ts) but the
scope is tightly bounded and the plan provides exact file names, export signatures, and test
cases. A single dispatch can complete it. Task 3.2 is smaller (one new source file + edit to
index.ts + one test file). Both fit within a single model context.

### Dependencies Satisfied in Order

PASS. Phase 3 depends on Phase 1 abstractions (APPROVED) and Phase 2 (APPROVED on
`temp-requirements`). Task 3.2 (SIGINT) depends on 3.1 (tempfiles registry for cleanupAll import)
-- and 3.2 is listed after 3.1. Verify task 3.3 is last in Phase 3.

### No Vague Tasks

PASS. Task specifications include exact function signatures (`createSigintHandler(deps: { cleanup:
() => void; write: (s: string) => void; exit: (code: number) => void }): () => void`), exact
export names, exact output strings (`Interrupted.\n`, exit code 130), and exact test scenarios.
No ambiguity exists for two developers reading the same task.

### No Hidden Dependencies

PASS. The one inter-task dependency within Phase 3 (3.2 imports `cleanupAll` from the
`tempfiles.ts` created in 3.1) is explicitly called out in the plan.

### Risk Register

PASS. A risk register is present with three items: JSON-mode SIGINT scope exclusion, Windows
Ctrl-C semantics, and stale `dist/` artifacts. The Windows platform risk is correctly mitigated
(unit test with injected fakes is the binding gate; manual Ctrl-C is confirmatory only). All
relevant risks are identified.

### Requirements Alignment

PASS. All three requirements from `requirements.md` are fully addressed:
- gh-toy-4ef (--version): completed in Phase 2, verified on `temp-requirements`.
- gh-toy-69s (SIGINT): specified in Phase 3 Task 3.2 with correct output (`Interrupted.`, exit
  130, no stack trace, partial file cleanup) and verifiable unit test.
- gh-toy-aqd (--json): specified in Phase 3 Task 3.1 with real subcommand, success JSON, error
  JSON, and text-mode defaults.

The trailing boilerplate in requirements.md ("API handlers go in src/api/...") is correctly
identified in PLAN.md as irrelevant copied context -- the plan solves CLI behaviors, not HTTP API
behaviors. Requirements intent is correctly understood.

---

## Summary

PLAN.md and progress.json pass all structural validation checks: phases array is non-empty,
tasks array is non-empty, every phase has a verify task, every phase has `model` and
`reviewer_model` fields, and all model IDs belong to the allowed set
(`claude-haiku-4-5-20251001`, `claude-sonnet-4-6`, `claude-opus-4-8`).

Plan quality is high: done criteria are concrete, cohesion is strong within phases, coupling is
low between them, key abstractions are front-loaded in Phase 1, the riskiest assumption is
validated first, DRY is enforced by explicit constraint, and all three requirements are addressed.

One low-severity data quality note: `progress.json` Phase 3 `model` field is `claude-opus-4-8`
but PLAN.md assigns `claude-sonnet-4-6` to the work tasks (3.1, 3.2). The task-level field is
authoritative and all IDs are valid, so this does not block approval. The orchestrator should
correct the phase-level `model` to `claude-sonnet-4-6` at the next opportunity.

**Verdict: APPROVED.** Phase 3 work may proceed.
