# fleet-e2e-toy — Plan Review

**Reviewer:** reviewer
**Date:** 2026-05-17 12:00:00+00:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.

---

## 1. Clear "Done" Criteria

**PASS.** Every task specifies concrete, testable conditions. Task 1 states exact input/output pairs (`validateCreateInput({title: "T", content: ""})` returns `{valid: false}`). Task 2 enumerates every test assertion and ends with "npm test passes with all new assertions green." Tasks 3 and 4 specify HTTP status codes and exact JSON shapes. Task 5 lists six discrete assertions. The VERIFY steps add a final gate. No task leaves ambiguity about what "done" means.

---

## 2. Cohesion Within Tasks / Coupling Between Tasks

**PASS.** Task 1 is a single logical change (add emptiness checks to two functions in one file). Task 2 is purely additive test code. Tasks 3 and 4 are each a single endpoint added to `src/app.ts`. Task 5 is their test coverage. Cross-task coupling is minimal and explicit: Task 2 depends on Task 1, Task 5 depends on Tasks 3-4. No hidden entanglement.

---

## 3. Key Abstractions and Shared Interfaces in Earliest Tasks

**PASS.** The plan correctly places the validation logic change (Task 1) — the foundational behavioral contract — in the first task. The API metadata endpoints (Phase 2) are purely additive and don't introduce shared abstractions. This is appropriate given the scope: there are no new shared interfaces to extract. The existing `ValidationError` interface and validation function signatures are the only shared contracts, and they aren't being changed — only their internal logic is tightened.

---

## 4. Riskiest Assumption Validated in Task 1

**PASS.** The plan explicitly identifies that modifying existing validation behavior is the riskiest change (it could break consumers that depend on empty content being accepted). Task 1 targets this head-on. The plan also notes: "Verified no existing tests send empty content or empty-string tags, so regression risk is low but non-zero." I verified this claim by reading `tests/validation.test.ts` and `tests/notes.test.ts` — confirmed: no test sends `content: ""` or empty tags. The additive endpoints in Phase 2 carry minimal risk by comparison.

---

## 5. Later Tasks Reuse Early Abstractions (DRY)

**PASS.** Task 2 directly exercises the validation changes from Task 1 (both unit and integration level). Phase 2 tasks are independent additive routes and don't duplicate logic from Phase 1. There's no copy-paste between tasks. The plan doesn't introduce unnecessary abstractions either — it correctly avoids extracting a "shared endpoint registrar" or similar premature abstraction for two simple routes.

---

## 6. Phase Boundaries at Cohesion Boundaries

**PASS.** Phase 1 (input validation hardening) is a coherent unit: a behavior change plus its tests, producing a reviewable/testable increment. Phase 2 (API metadata endpoints) is another coherent unit: two related feature endpoints plus their tests. Each phase ends with a VERIFY checkpoint. The split is natural — a reviewer could merge Phase 1 independently and the app would be in a consistent, improved state.

---

## 7. Tiers Monotonically Non-Decreasing Within Each Phase

**PASS.** Phase 1: Task 1 is cheap, Task 2 is standard. Phase 2: Task 3 is cheap, Task 4 is cheap, Task 5 is standard. Both phases go cheap → standard. No downgrade occurs within either phase.

---

## 8. Each Task Completable in One Session

**PASS.** Task 1 is a four-line logic change in one file. Task 2 is adding ~15 test cases across two files with clear patterns from existing tests. Tasks 3 and 4 are each adding a single route handler (5-15 lines). Task 5 is ~10 test cases. None of these would take more than a focused session. The risk of scope creep is low because each task's scope is tightly bounded.

---

## 9. Dependencies Satisfied in Order

**PASS.** The dependency graph is: Task 1 → Task 2 → VERIFY-1 → Task 3 (no deps) → Task 4 (no deps) → Task 5 (depends on 3 & 4) → VERIFY-2. Tasks 3 and 4 are independent of each other and of Phase 1. The ordering is valid and the plan explicitly states blockers for each task.

---

## 10. Vague Tasks That Two Developers Would Interpret Differently

**PASS.** The plan is unusually specific. Task 1 quotes exact conditions (`obj.content.trim().length === 0`) and exact error messages. Task 3 specifies the JSON shape and that the name is hardcoded while version is dynamic. Task 4 lists all 8 routes to document. The only minor ambiguity is in Task 4's "optionally `requestBody` and `responseShape`" — but since it's explicitly optional and the done-criteria only require `method`, `path`, and `description`, this won't cause divergent implementations.

---

## 11. Hidden Dependencies Between Tasks

**PASS.** I checked for subtle coupling:
- Tasks 3 and 4 both modify `src/app.ts` but add independent route handlers — no merge conflict risk since they append to different locations.
- Task 4's `/help` endpoint lists `/version`, so if Task 3 were dropped, the help output would reference a nonexistent route. However, the plan structures them in the same phase with Task 4 explicitly following Task 3, so this is a sequencing choice, not a hidden dependency.
- The `resolveJsonModule` setting needed for Task 3 is already confirmed enabled in `tsconfig.json` (verified: line 12 shows `"resolveJsonModule": true`).

No hidden dependencies found.

---

## 12. Risk Register

**PASS.** The plan includes a risk register with five identified risks, impact levels, and mitigations. The risks are relevant and non-trivial:
1. Content validation breaking downstream consumers — mitigated by test audit (verified correct).
2. `package.json` import path in compiled JS — mitigated by noting `resolveJsonModule` is enabled.
3. Help endpoint going stale — acknowledged as by-design per requirements.
4. Empty tag rejection vs existing data — mitigated by noting in-memory store (no persistence).
5. Whitespace content now returning 400 — acknowledged as intentional per Issue 2.

**NOTE:** One additional risk worth calling out: the `tsconfig.json` has `"rootDir": "./src"` and `"include": ["src/**/*"]`. Importing `../package.json` from `src/app.ts` may cause a TypeScript compilation error because `package.json` is outside `rootDir`. The plan mentions this in risk #2 but the mitigation ("use `require` pattern or verify import path at build time") is vague. A concrete mitigation would be: use `const pkg = require("../../package.json")` with a type annotation, or adjust `rootDir` to `.` (which has broader implications). This is a minor concern — the implementer will discover it immediately at build time and it has an obvious fix.

---

## 13. Alignment with requirements.md Intent

**PASS.** The plan directly addresses all three issues from requirements.md:
- Issue 1 (version endpoint): Task 3 implements `GET /version` with exact acceptance criteria match — JSON body `{"name": "fleet-e2e-toy", "version": "1.0.0"}`, version from package.json, not hardcoded.
- Issue 2 (input validation): Tasks 1-2 implement the validation hardening for content and tags with all acceptance criteria covered (400 responses, error messages, unit tests, no regressions).
- Issue 3 (help endpoint): Task 4 implements `GET /help` with routes array covering all required endpoints, static definition, JSON response.

The plan correctly interprets CLI-oriented issue language into REST API equivalents, matching the "Interpretation for REST API" sections in requirements.md.

---

## Summary

All 13 review criteria pass. The plan is well-structured, specific, correctly ordered, and aligned with requirements. The only observation worth noting is the minor ambiguity in the `package.json` import path resolution (risk #2) — the mitigation could be more concrete, but the implementer will hit this at build time with an obvious fix path, so it does not rise to CHANGES NEEDED.

**Verdict: APPROVED** — proceed to implementation.
