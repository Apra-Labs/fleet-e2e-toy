# fleet-e2e-toy — Plan Review

**Reviewer:** reviewer
**Date:** 2026-05-12 00:00:00+00:00
**Verdict:** CHANGES NEEDED

> See the recent git history of this file to understand the context of this review.

---

## 1. Clear "Done" Criteria

**PASS.** Every task has a concrete "Done when" clause. Tasks 1 and 2 specify the exact number of new tests and require `npm test` to pass with no regressions. Task 3 specifies TypeScript compilation (`npx tsc --noEmit`) and explicitly notes that runtime failures are expected until Task 4. Task 4 requires all tests green. Task 5 specifies five named test cases and full-suite green. No ambiguity in any of these.

---

## 2. High Cohesion / Low Coupling

**PASS.** Task 1 is purely tag-filter tests, Task 2 is purely search tests, Task 3 is test-shape migration, Task 4 is pagination implementation, Task 5 is pagination-specific tests. Each task touches one concern and one file (except Task 4 which touches the source file only). The coupling that exists (Task 3 updating Task 1/2 tests, Task 5 depending on Task 4) follows naturally from the work and is ordered correctly in the plan.

---

## 3. Key Abstractions in Earliest Tasks

**PASS.** The pagination envelope shape `{ data, total, page, limit }` is the only new shared interface. It is defined in Task 3 (test expectations) before it is implemented in Task 4. Tasks 1 and 2 introduce no abstractions, which is correct since they test already-implemented features.

---

## 4. Riskiest Assumption Validated in Task 1

**FAIL.** The plan identifies the envelope retrofit as the highest-impact risk ("All four existing GET /api/notes test assertions must be updated"). This risk is not validated until Task 3. Task 1 is the safest work in the entire plan — test-only additions for already-working tag filtering with zero chance of regression. The riskiest assumption (that the envelope shape works cleanly with all existing tests and filter paths) sits in Phase 3. To fix: either move a minimal envelope smoke test into Task 1 (validating the shape early), or explicitly acknowledge in the plan narrative that risk validation is deferred to Phase 3 and explain why that ordering is acceptable (e.g., because Phases 1 and 2 are prerequisite test coverage that Task 3 needs to update).

---

## 5. Later Tasks Reuse Early Abstractions (DRY)

**PASS.** Task 3 establishes the envelope assertion pattern (`res.body.data`, `res.body.total`, etc.), and Task 5 reuses it throughout. The tag-filter and search tests from Tasks 1 and 2 are updated in Task 3 to use the same pattern rather than maintaining two assertion styles.

---

## 6. Phase Boundaries at Cohesion Boundaries

**PASS.** Phase 1 (tag-filter tests), Phase 2 (search tests), and Phase 3 (pagination) are coherent units. Each phase produces a reviewable, testable increment: Phases 1 and 2 each end with a green test suite, and Phase 3 ends with the full feature implemented and all tests passing. The VERIFY checkpoints reinforce these boundaries.

---

## 7. Tiers Monotonically Non-Decreasing Within Each Phase

**PASS.** Phase 1: cheap. Phase 2: cheap. Phase 3: cheap (Task 3) then standard (Task 4) then standard (Task 5). Tiers never decrease within a phase.

---

## 8. Each Task Completable in One Session

**PASS.** Task 1 is 3 test cases. Task 2 is 4 test cases. Task 3 is updating 4 + N existing assertions. Task 4 is ~10 lines of pagination logic. Task 5 is 5 test cases. All are small, well-scoped changes to a single file each. None would challenge a single session.

---

## 9. Dependencies Satisfied in Order

**PASS.** The task ordering (1 → 2 → 3 → 4 → 5) satisfies all actual dependencies. Task 4 explicitly lists Task 3 as a blocker. Task 5 explicitly lists Task 4. The phase ordering ensures Tasks 1 and 2 precede Task 3. However, see check #11 for an issue with how blockers are declared.

---

## 10. Vague Tasks

**PASS.** All tasks specify exact file paths, exact test case descriptions, and concrete code changes. Task 4 even includes pseudo-code for the implementation (parse, clamp, compute total, slice, return envelope). Two developers given any of these tasks would produce substantially the same result.

---

## 11. Hidden Dependencies Between Tasks

**FAIL.** Task 3 explicitly states: "Also update the tag-filter and search tests added in Tasks 1 and 2 to use `res.body.data`." This is a hard dependency on Tasks 1 and 2 being completed and committed first — Task 3 cannot update tests that don't exist yet. However, Task 3 declares "Blockers: None." This is incorrect and could cause confusion if tasks are executed out of order or assigned to different developers. Fix: Task 3's blockers should list Tasks 1 and 2.

---

## 12. Risk Register

**NOTE.** The risk register is present and covers five risks including the high-impact envelope breaking change, limit DoS, filter+pagination interaction, the empty `q` regression, and TypeScript strictness. This is solid. Two gaps worth adding:

- **Invalid `page`/`limit` input:** Task 4 mentions clamping and `isNaN` guarding, but Task 5 has no test case for non-numeric input (`?page=abc`) or zero/negative values (`?limit=0`, `?page=-1`). Without tests, this risk is mitigated in code but unverified.
- **Search result ordering stability:** The requirements specify "results are returned in a consistent order" for search. Neither the risk register nor any task addresses ordering guarantees. The in-memory store presumably returns insertion order, but this is an implicit assumption that should be called out.

---

## 13. Alignment with Requirements

**NOTE.** The plan addresses all three issues (gh-toy-bzq, gh-toy-gw1, gh-toy-06i) and the overall structure matches the requirements' intent. Two alignment concerns:

1. **Tag filtering — "absent tag" ambiguity:** The requirements state "an unrecognised or absent tag returns an empty array rather than an error." The plan's Task 1 test case 2 asserts "absent `tag` param returns all notes," which matches the current implementation (`if (tag)` skips filtering when the param is missing). However, the requirements wording could be read as requiring an empty array when the tag param is absent. The plan should explicitly note this interpretation choice and confirm it matches stakeholder intent, rather than silently picking a reading.

2. **Search — consistent order requirement:** The requirements for gh-toy-gw1 specify "results are returned in a consistent order." No task in the plan includes a test asserting result ordering. This acceptance criterion is unaddressed.

---

## Summary

The plan is well-structured with clear task definitions, correct phasing, and a solid risk register. Five of the thirteen checks earned clean PASS marks, three earned PASS with minor observations, and two checks require changes:

**Must fix:**
- **Check #4:** The riskiest assumption (envelope retrofit) is not validated until Phase 3. Either add an early validation step or explicitly justify the deferral in the plan narrative.
- **Check #11:** Task 3 declares "Blockers: None" but depends on Tasks 1 and 2 being completed first. Update Task 3's blockers to list Tasks 1 and 2.

**Should address:**
- **Check #12:** Add test cases for invalid `page`/`limit` input (non-numeric, zero, negative) to Task 5. Note the implicit ordering assumption.
- **Check #13:** Clarify the "absent tag" interpretation against requirements. Add a search-ordering test to address the "consistent order" acceptance criterion.
