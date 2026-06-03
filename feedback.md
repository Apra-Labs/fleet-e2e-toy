# s1.1 -- Plan Review

**Reviewer:** Opus 4.7 (plan-reviewer)
**Date:** 2026-06-03 (review pass 1)
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.

---

## 1. Done criteria per task

PASS. Every task has explicit, executable "Done when" criteria:

- Task 1.1: `./node_modules/.bin/jest` exists and baseline ~21 tests pass.
- Task 2.1: Specific jest invocations (`tests/validation.test.ts` and full suite) must be green, with a named commit message.
- Tasks 3.1 / 3.2: Same pattern -- targeted jest run plus full suite, with named commit messages.
- Task 4.1: Exit code 0 from full suite, exact test count (30 = 21 + 5 + 1 + 3), and presence of all three issue-tag commits on the branch.

The Phase 4 verification even spells out the arithmetic, which makes the verification objectively checkable rather than vibes-based.

## 2. Cohesion within tasks, coupling between tasks

PASS. Each task touches a narrowly scoped set of files:

- Task 2.1 is one logical change (blank-string hardening) spanning validator + tests -- this is correctly cohesive.
- Task 3.1 is `/version` end-to-end (handler, mount, test).
- Task 3.2 is `/api/help` end-to-end.

Coupling between tasks is limited to file overlap on `src/app.ts` (Tasks 3.1 and 3.2 both edit it), which is unavoidable and small. The plan batches them into a single sonnet dispatch so the second task sees the first task's edit -- correct mitigation.

## 3. Shared interfaces / abstractions in earliest tasks

PASS. There is no new abstraction needed -- both endpoints are independent routers added next to the existing `/api/notes` router. The cross-cutting policy decisions that ARE shared (jest invocation form, error response shape, mount points, package.json read strategy) are correctly captured in the "Cross-cutting constraints" preamble before any task, so every doer dispatch sees the same rules.

## 4. Riskiest assumption validated in Task 1

PARTIAL PASS / NOTE. The reviewer prompt asked whether "validation changes before new endpoints" is front-loaded -- it is: Phase 2 (gh-toy-v6z) comes before Phase 3 (the new endpoints). The plan's own justification ("highest-risk task ... modifies existing logic that the existing test suite depends on") is sound.

The TRULY riskiest assumption in the plan, however, is R1 (the `package.json` runtime path resolution under `ts-jest`), and that is only validated indirectly in Task 3.1, not in Task 1.1. This is acceptable because (a) the test cost of validating it earlier is the same as Task 3.1 itself, (b) the fallback (`process.cwd()`) is documented in the risk register, and (c) `__dirname` under ts-jest preserves the source-file path so the resolution will succeed. NOTE only, not a blocker.

## 5. Later tasks reuse early abstractions (DRY)

PASS. The validation hardening in Task 2.1 is implicitly reused by Task 3.2's help endpoint description (which advertises POST/PUT field semantics), and the cross-cutting jest invocation, error shape, and mount conventions are reused verbatim by every later task. No duplicated logic appears across tasks.

## 6. Phase boundaries at cohesion boundaries

PASS. Phase 1 = environment setup, Phase 2 = validation change (one file pair), Phase 3 = additive endpoints (no behavior change to existing routes), Phase 4 = verification. Each phase is independently reviewable; rolling back any single phase leaves the previous phases in a coherent state. Phase 3 contains two tasks that share a code path (`src/app.ts` mount block) and a "discoverability" theme -- a reasonable single-phase grouping.

## 7. Model assignments and dispatch streaks

PASS. Haiku is used for the two mechanical tasks (`npm install` and "run the suite, assert exit 0"); sonnet is used for the three tasks that require reading existing code, preserving error ordering, and crafting test cases. The dispatch streak hint correctly clusters the two sonnet endpoint tasks (3.1 -> 3.2) into one dispatch C and keeps haiku tasks separate. Context budget for dispatch C is bounded (`src/app.ts` + 2 new src files + 2 new test files) -- well within sonnet's budget.

## 8. One-dispatch completability

PASS. Each task's file list is small (max 2-3 files per task), and the test commands are precisely specified. No task asks the doer to make architectural decisions or read large portions of the codebase.

## 9. Dependency ordering

PASS. Stated dependencies are: 1.1 -> 2.1, 1.1 -> 3.1, 1.1 + 3.1 -> 3.2, and all -> 4.1. The 3.1 -> 3.2 link is explicitly justified ("the help list advertises `/version`"). The dispatch streak order (A, B, C [3.1 then 3.2], D) respects every dependency edge.

## 10. Vague tasks

PASS. Every task has the test cases enumerated, the exact error message strings quoted, and even the exact 8 entries for the help endpoint are hand-listed. Two independent doers given Task 3.2 would produce byte-identical handler bodies modulo whitespace. Task 2.1 even pre-emptively addresses an ordering subtlety (input `{title:"Note", content:"Body", tags:[1,2]}` must still surface tags-field-error first) by quoting the existing test line number that would break.

## 11. Hidden dependencies

PASS / NOTE. One subtle dependency the plan handles correctly: the new `it("rejects whitespace-only title")` test under `validateCreateInput` is actually a NO-OP against the new code (the existing validator already rejects whitespace-only titles at line 19 of `src/utils/validation.ts` via `obj.title.trim().length === 0`). It's a redundant test, not a missing implementation -- the plan doesn't ask the doer to add new title-blank logic, only to add a confirming test. Worth a comment in the implementation but not a blocker; the test is harmless and matches the requirements.md acceptance phrasing.

A second hidden dependency: Task 3.1 mounts `/version` on the app, which means the existing `GET /api/notes` and `GET /health` tests must continue to pass. They will, since the new mount is a non-overlapping path. The plan explicitly calls out "Routing order does not matter for non-overlapping paths" -- good defensive note.

## 12. Risk register

PASS. R1 (path resolution), R2 (validation test ordering), R3 (npm install network failure) cover the three real risks. Adding to the register from a reviewer perspective:

- **R4 (additional, not blocking):** The help endpoint's hand-maintained list will drift from reality the next time a route is added or removed. The plan correctly defers this to "out of scope" but the next sprint should consider either a registry pattern or an Express introspection helper. NOTE only.
- **R5 (additional, not blocking):** ts-jest module-load-time `fs.readFileSync` happens once per test file -- if jest's worker model spawns multiple workers, each will read the file. Not a correctness issue, just an observation. NOTE only.

## 13. Alignment with requirements.md intent

PASS. The three issues from requirements.md map 1:1 to Phase 2 / Phase 3 tasks:

- gh-toy-4ef: response shape `{"version": "1.0.0"}`, version sourced from `package.json`, integration test -- matches Task 3.1.
- gh-toy-v6z: blank `content` rejected, blank tag entries rejected, `validateUpdateInput` also enforces it, new test in `tests/validation.test.ts` -- matches Task 2.1.
- gh-toy-kbk: `GET /api/help` returns machine-readable JSON listing all routes, integration test verifies all routes present -- matches Task 3.2.

The plan does not over-reach: the four `// TODO:` comments in `src/api/notes.ts` are explicitly noted as out of scope, which is correct.

## TypeScript rootDir constraint

PASS. The plan correctly identifies that `import pkg from "../../package.json"` would escape `rootDir: "./src"` (see `tsconfig.json` line 7) and instead reads `package.json` at runtime via `fs.readFileSync`. The `__dirname`-based path is correct under both ts-jest (source-file resolution) and compiled `dist/` (one level under repo root). `resolveJsonModule` is `true` in tsconfig but that only enables JSON imports, not rootDir exemption, so the runtime-read approach is the right call.

---

## Summary

The plan is precise, dependency-correct, and risk-aware. Every task has objective done criteria, exact code-level specs (error strings, mount paths, test names, expected counts), and a sensible model assignment. The cross-cutting constraints preamble correctly hoists the few shared decisions (jest invocation, error shape, rootDir-safe package.json read) above the task list so every dispatch inherits them.

Notable strengths:
- Front-loads the riskier validation change (Phase 2) before additive endpoints (Phase 3), so regression risk surfaces before new contracts are layered on.
- Phase 4 specifies the exact expected test count (30), making verification objective.
- Risk register is present and reasonable; the rootDir trap is explicitly identified and the runtime-read mitigation is correctly documented.
- Dispatch streaks minimize dispatches (4 total) and keep sonnet context budgets small.

Notes (non-blocking):
- The new "rejects whitespace-only title" test is redundant against existing behavior -- harmless, just a documentation/coverage assertion rather than new logic.
- R1 (`__dirname` resolution under ts-jest) is validated only at Task 3.1, not earlier; acceptable given the cheap fallback.
- The hand-maintained help list will drift; out-of-scope this sprint but should be on a future backlog.

Verdict: APPROVED. The doer can proceed with Dispatch A through D as specified.
