# fleet-e2e-toy — Plan Review

**Reviewer:** reviewer
**Date:** 2026-05-12 01:00:00+00:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.

---

## 1. Clear "Done" Criteria

**PASS.** Every task has a concrete "Done when" clause with specific test counts and pass conditions. Task 3 correctly notes that runtime test failures are expected until Task 4 lands and uses `npx tsc --noEmit` as its gate instead.

---

## 2. High Cohesion / Low Coupling

**PASS.** Each task touches one concern and one file. Coupling between tasks (Task 3 updating Task 1/2 tests, Task 5 depending on Task 4) follows naturally from the work and is now explicitly declared in blockers.

---

## 3. Key Abstractions in Earliest Tasks

**PASS.** The pagination envelope shape `{ data, total, page, limit }` is defined in Task 3 (test expectations) before implementation in Task 4. Tasks 1 and 2 correctly introduce no new abstractions.

---

## 4. Riskiest Assumption Validated in Task 1

**PASS (previously FAIL).** The doer added a Phase 3 narrative paragraph explaining why envelope validation cannot move earlier than Task 3: it must update tag-filter and search tests from Tasks 1 and 2, which don't exist yet in Phase 1. Moving validation earlier would either split Task 3 into two passes or create tests for code that doesn't exist. The justification is sound — the risk is addressed at the earliest feasible point (first task of Phase 3), not arbitrarily deferred.

---

## 5. Later Tasks Reuse Early Abstractions (DRY)

**PASS.** Task 3 establishes the envelope assertion pattern; Task 5 reuses it throughout. No duplication of assertion styles.

---

## 6. Phase Boundaries at Cohesion Boundaries

**PASS.** Each phase is a coherent, reviewable, testable increment. The VERIFY checkpoints reinforce these boundaries.

---

## 7. Tiers Monotonically Non-Decreasing Within Each Phase

**PASS.** Phase 1: cheap. Phase 2: cheap. Phase 3: cheap → standard → standard. No tier decreases within any phase.

---

## 8. Each Task Completable in One Session

**PASS.** All tasks are small and well-scoped. Task 5 grew from 5 to 8 test cases but remains straightforward single-session work.

---

## 9. Dependencies Satisfied in Order

**PASS.** Task ordering (1 → 2 → 3 → 4 → 5) satisfies all dependencies. All blockers are now correctly declared.

---

## 10. Vague Tasks

**PASS.** All tasks specify exact file paths, test case descriptions, and concrete code changes. No ambiguity.

---

## 11. Hidden Dependencies Between Tasks

**PASS (previously FAIL).** Task 3 now explicitly declares: "Blockers: Tasks 1 and 2 must be committed first — Task 3 updates the tag-filter and search tests they introduce. Task 3 cannot modify tests that do not yet exist." The hidden dependency is now visible.

---

## 12. Risk Register

**PASS (previously NOTE).** The doer addressed both gaps:

- Task 5 now includes three invalid-input test cases: non-numeric `?page=abc` (test 6), `?limit=0` (test 7), and `?page=-1` (test 8).
- Risk register gains a new entry for Map insertion-order reliance, noting the JavaScript guarantee and the caveat that a database replacement would need explicit `ORDER BY`.

**Minor inconsistency:** The Phase 3 VERIFY checkpoint still says "Confirm all five new pagination tests pass" but Task 5 now specifies eight tests. This should be updated to "eight" to match.

---

## 13. Alignment with Requirements

**PASS (previously NOTE).** Both concerns addressed:

1. **Absent-tag interpretation:** Task 1 now includes an interpretation note explaining that "absent tag" in the requirements refers to a tag value matching no notes, not to omitting the query parameter. The reading is consistent with the implementation and REST conventions, and the test case verifies it explicitly.

2. **Search ordering:** Task 2 now includes test case (5) asserting insertion-order consistency across requests, directly addressing the "consistent order" acceptance criterion.

**Minor inconsistency:** The Phase 2 VERIFY checkpoint says "Confirm all four new search tests pass" but Task 2 now specifies five tests. This should be updated to "five" to match.

---

## Summary

All four previously flagged items have been properly addressed. The two FAIL items (checks #4 and #11) are now PASS with clear fixes. The two NOTE items (checks #12 and #13) are now PASS with the requested test cases, risk entries, and interpretation clarifications added.

**Remaining nits (non-blocking):** Two VERIFY checkpoints have stale test counts — Phase 2 says "four" (should be "five") and Phase 3 says "five" (should be "eight"). These are cosmetic but could cause confusion during execution.

**Verdict: APPROVED.** The plan is ready for implementation.
