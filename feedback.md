APPROVED

# pmlite-e2e/s1.1-1780465073891 -- Plan Review

**Reviewer:** plan-reviewer (claude-opus-4-7)
**Date:** 2026-06-03 00:00:00+00:00
**Verdict:** APPROVED

> No prior `feedback.md` history exists on this branch — this is the first review.

---

## 1. Done criteria per task

PASS. Every task in PLAN.md carries an explicit "Acceptance criteria" block with verifiable, mostly observable conditions:

- Task 1.1 names the exact exported symbols (`isBlankString`, `validateNonBlankString`), specifies a build-passes gate, and demands existing tests remain green.
- Task 2.1 lists six concrete input/output cases (e.g., `validateCreateInput({ title: "x", content: "   " })` -> 400 with a `content` error; `tags: [" trim-me "]` -> `data.tags === ["trim-me"]`).
- Task 2.4 specifies exact HTTP behaviors for `GET /api/notes?q=` and `?tag=%20%20`.
- Task 3.2 lists the exact `(method, path)` pairs that `/help.endpoints` must contain and requires `length >= 8`.
- Task 4.1 ties completion to exit code 0 on build, test, and lint.

No task ends on subjective criteria like "looks good" or "is clean".

---

## 2. Cohesion within tasks / coupling between tasks

PASS. Each task touches a tight scope:

- Tasks 1.1/1.2 -- pure helper functions and their tests in `src/utils/validation.ts` and `tests/validation.test.ts`. No router or app changes.
- Tasks 2.1/2.2 -- extend existing validators and add list/path validators, still confined to `src/utils/validation.ts`.
- Task 2.4 -- the only handler change for Phase 2 (`src/api/notes.ts`), and it consumes Task 2.2's helpers without duplicating logic.
- Tasks 3.1/3.2 -- create `src/api/meta.ts` and mount it in `src/app.ts`. Separation of "create router" vs. "mount + integration test" is appropriate for a clean diff.

Cross-task coupling is explicit via the `Blockers` field and runs in a single direction (1.1 -> 1.2/2.x; 2.2 -> 2.4; 2.1+2.4 -> 2.5; 3.1 -> 3.2). No hidden back-references.

---

## 3. Key abstractions in earliest tasks

PASS. The shared primitives (`isBlankString`, `validateNonBlankString`) are introduced in Task 1.1, ahead of all consumers (Tasks 2.1, 2.2). This is the right ordering — without these helpers, downstream tasks would either duplicate the `typeof === "string" && trim().length === 0` check or end up coupling to inline expressions.

The `ValidationError` interface and the `{ valid: true | false; ... }` discriminated-union pattern already exist in `src/utils/validation.ts`; the plan correctly extends rather than reshaping these.

---

## 4. Riskiest assumption validated in Task 1

PASS, with a caveat noted below. The plan explicitly calls out the highest-risk technical landmine in the prose (lines 22 and 152): importing `package.json` from `src/` would violate `tsconfig.json`'s `rootDir: "./src"` (TS6059). I confirmed this by reading the `tsconfig.json` directly — `rootDir` is `./src`, `include` is `["src/**/*"]`, `exclude` includes `tests`. The plan resolves this by hardcoding `const VERSION = "1.0.0"` in `src/api/meta.ts` and documenting the dual-update requirement.

Technically the "riskiest assumption" (the JSON-import path) is validated during planning rather than in Task 1.1, but Task 1.1 is the conventional "smallest-vertical-slice" task (small helper + build-passes gate). Given the JSON-import risk is settled in plan prose and confirmed by reading `tsconfig.json`, this is acceptable.

NOTE: One small residual risk -- if the orchestrator's reviewer prefers a single source of truth, the hardcoded version could drift from `package.json`. The plan acknowledges this in Task 3.1 commentary and the Risks section. Acceptable for the sprint scope.

---

## 5. DRY / reuse of early abstractions

PASS. Task 2.1's "Description" explicitly states "Use the helpers from Task 1.1 internally — no inline `trim().length === 0` duplication." Task 2.2 also leans on the same helpers. Task 2.4 consumes Task 2.2's `validateListQuery` without inlining. Task 3.1's two handlers share the `NAME`/`VERSION` constants. No duplication of validation logic across handlers.

---

## 6. Phase boundaries at cohesion boundaries

PASS.

- Phase 1 -- pure helpers + their unit tests. Reviewable in isolation; produces working library code.
- Phase 2 -- the entire "harden note input validation" story (gh-toy-v6z). Closes with `VERIFY 2` that asserts the documented JSON shape and a passing test suite. This is a coherent, reviewable increment that maps 1:1 to one issue.
- Phase 3 -- the two informational endpoints (gh-toy-4ef + gh-toy-kbk) grouped together because they share an implementation file (`src/api/meta.ts`), a mounting strategy, and a test file (`tests/meta.test.ts`). Grouping these is justified in the phase prose.
- Phase 4 -- final whole-system gate.

Each phase produces something a reviewer can examine and run.

---

## 7. Model assignment

PASS. Models are sized to complexity:

- Tasks 1.1, 1.2 -- pure helpers and their tests, assigned to `claude-haiku-4-5-20251001`. Appropriate.
- Tasks 2.1-2.5, 3.1, 3.2, 4.1 -- multi-file changes, integration-test additions, careful handler wiring, all assigned to `claude-sonnet-4-6`. Appropriate.

The "Streak / dispatch summary" section explicitly clusters same-model tasks: a Haiku streak (1.1, 1.2) followed by a Sonnet streak (2.1 through 4.1), which is dependency-feasible and minimizes context churn. No task is over- or under-modeled — Task 2.5 in particular (8 integration tests against an existing supertest harness) is correctly Sonnet-sized.

Each streak fits comfortably within its model's context: the Sonnet streak's largest single file is `src/utils/validation.ts` (~80 lines) and `tests/notes.test.ts` (~140 lines); accumulated state across the streak stays well under budget.

---

## 8. One-dispatch completability

PASS. No task spans multiple unrelated files or interleaves disparate concerns. The most file-touching task is 3.2 (modifies `src/app.ts`, creates `tests/meta.test.ts`), which is still a single small mount + a single new test file. Task 4.1 is verification-only with no file edits.

---

## 9. Dependency order

PASS. Walking the `Blockers` field forward:

- 1.1 has no blockers.
- 1.2 blocked on 1.1 (consumes the helpers).
- 2.1 blocked on 1.1 (uses helpers).
- 2.2 blocked on 1.1.
- 2.3 blocked on 2.1 and 2.2.
- 2.4 blocked on 2.2 (needs `validateListQuery`).
- 2.5 blocked on 2.1 and 2.4 (integration tests need both new server-side behaviors).
- 3.1 has no blockers (orthogonal to Phase 2).
- 3.2 blocked on 3.1.
- 4.1 blocked on all previous.

The order is consistent and walkable. Note: 3.1 and 3.2 could in principle be dispatched in parallel with Phase 2 since they share no files. The "Streak / dispatch summary" serializes them, which is a fine simplifying choice; not a flaw.

---

## 10. Ambiguity check

PASS, with one minor observation:

- Task 2.1's error messages are spelled out verbatim ("Content must be a non-empty, non-whitespace string", "Tags must not contain empty or whitespace-only strings"). Two developers should produce identical output.
- Task 2.2 specifies exact field names and messages for query/path validators.
- Task 3.1 includes the exact JSON shape for `/help`, including every endpoint entry. Task 3.2 lists the exact `(method, path)` tuples to assert.

Minor observation -- Task 2.1 says "Reject when `content` is a string but `content.trim().length === 0`". It does not explicitly state what should happen when `content` is omitted entirely from a CREATE body. The current code in `src/utils/validation.ts` (line 23-25) errors with `"Content must be a string"` because `typeof undefined !== "string"`, so an omitted `content` is already rejected — the existing behavior is preserved and the plan's "Preserve all existing error fields and discriminated-union shape" instruction covers this. Not a blocker.

Task 2.2's `validateListQuery` says "If present but not a string (e.g., an array from duplicate keys), error with the same field name." Two developers could reasonably choose different message text here, but the test acceptance criteria only checks the error's `field`, so the ambiguity is bounded and doesn't affect test outcomes.

---

## 11. Hidden dependencies

PASS. I checked for the following hidden couplings and found none:

- The existing `tests/notes.test.ts` has a test "rejects empty title string" using `{ title: "" }` -- already passing behavior, still passing after Task 2.1.
- The plan's Task 2.5 test for `POST /api/notes` with `{ title: "   ", content: "x" }` expecting 400 is consistent with existing behavior (line 19 in `validation.ts` already trims and rejects). No regression risk.
- The note store's `noteStore.update` in `src/models/note.ts` does NOT update `updatedAt` (a known TODO). Task 2.5's tests for PUT do not assert on `updatedAt`, so no spurious failure.
- Task 2.4 reads `req.query as Record<string, unknown>`. Express types `req.query` as `ParsedQs`. The cast is safe at the validation boundary, but the doer should be aware that Express may produce string-or-array-or-object values for repeated/bracketed query keys -- the plan addresses this in Task 2.2 ("If present but not a string ... error with the same field name"). No hidden dependency.
- Task 3.2 mounts the meta router at `/`. The existing `app.use("/api/notes", notesRouter)` and `app.get("/health", ...)` are on disjoint paths, so order does not matter — the plan explicitly notes this.

No hidden dependencies found.

---

## 12. Risk register

PASS. The plan has an explicit "Risks and notes" section at lines 232-237 covering:

- Adaptation of CLI requirements to REST endpoints, with preservation of the literal `fleet-e2e-toy v1.0.0` string for human acceptance.
- The `validateListQuery` centralization vs. future pagination.
- The hardcoded `VERSION` constant and its sync requirement with `package.json`.
- No new dependencies, no build-config changes.
- Explicit out-of-scope list (pagination, max-length, duplicate-tag rejection, `updatedAt` on PUT).

I'd add one risk that isn't explicitly called out but is implicit in the design: existing tests in `tests/validation.test.ts` (lines 38-44) verify that `tags: [1, 2]` is rejected with the message currently in `src/utils/validation.ts` line 29 ("Tags must be an array of strings"). Task 2.1 introduces a new tags-related error ("Tags must not contain empty or whitespace-only strings"). The order of checks matters: if the doer accidentally collapses these into a single branch, the existing test's `errors[0].field === "tags"` would still pass, but the message text might change. This is low risk because the existing tests don't assert on message text. Worth flagging in execution but not a blocker on the plan.

---

## 13. Alignment with requirements.md intent

PASS. The three P1 issues are addressed:

- gh-toy-4ef (`--version` flag) -> `GET /version` returning `{ name, version, display: "fleet-e2e-toy v1.0.0" }`. The literal acceptance string from requirements ("`fleet-e2e-toy v1.0.0`") is preserved in the `display` field, which a human-acceptance grep would still find. Exit-code-0 is mapped to HTTP 200. This is the correct adaptation given the explicit guidance in requirements.md line 64: "The help and version issues may map to an Express route (`GET /help`, `GET /version`)".

- gh-toy-v6z (empty/blank string validation) -> Tasks 2.1 through 2.5 extend validation across all relevant fields (title, content, tags entries, q, tag, id) on all relevant endpoints (POST, PUT, GET, GET-by-id). Returns 400 with `{ errors: [...] }`. Unit and integration tests added. This is the deepest coverage of the three issues and matches requirements.md's hint at line 61 ("extend it and add tests covering empty/blank string inputs to the API endpoints").

- gh-toy-kbk (help command) -> `GET /help` returning a structured listing of every endpoint with method and description. HTTP 200. Lists every endpoint and (implicitly) every flag -- there are no CLI flags in this REST adaptation, only endpoints, which the plan correctly enumerates including the two new ones. Note that requirements.md mentions "and `--help` / `-h` flag" -- in the REST adaptation, these become a single `GET /help` endpoint, which is the right call.

The plan solves the right problem: the three concrete P1 issues, adapted to the REST API context, with no over-engineering (pagination, etc.) and no scope creep.

---

## Summary

The plan is well-structured, correctly scoped, and ready to execute.

Strengths:
- Risky tsconfig/JSON-import landmine identified and worked around in plan prose with a clear rationale.
- Validation primitives factored into Phase 1 and reused; no inline duplication.
- Phase boundaries map cleanly to single P1 issues (Phase 2 = gh-toy-v6z; Phase 3 = gh-toy-4ef + gh-toy-kbk).
- Acceptance criteria are testable and specific; error message strings are spelled out verbatim.
- Model sizing and streak clustering are dependency-feasible and context-budget-appropriate.
- Honors all conventions from `CLAUDE.md` and `.claude/rules/api-conventions.md` (no inline validation, `{ error }` / `{ errors }` shape, explicit status codes, supertest against `src/app.ts`, no `any`, no `console.log`).
- Explicit out-of-scope list prevents scope creep.

Minor observations (not blocking):
- Task 2.1 ordering of tags-related checks could in theory shuffle existing test expectations, but no existing test asserts on message text. Low risk.
- Task 2.2's "If present but not a string ... error with the same field name" allows two doers to write slightly different error messages, but tests only assert on `field`. Bounded ambiguity.
- The hardcoded `VERSION = "1.0.0"` in `src/api/meta.ts` is a known dual-update risk, explicitly accepted in the Risks section.

Nothing requires change before execution. Verdict: APPROVED.
