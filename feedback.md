# e2e-s1.2-25990827273/cli-features — Plan Review

**Reviewer:** reviewer
**Date:** 2026-05-17 12:00:00+00:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.

---

## 1. Clear "Done" Criteria

PASS. Every task specifies concrete, verifiable acceptance conditions. Task 1 requires exact output (`fleet-e2e-toy v1.0.0`) from exact commands (`./tool --version`, `./tool -v`) with exit code 0 and a green test suite. Task 2 specifies the three trigger forms (`help`, `--help`, `-h`) and what the output must contain (all subcommands and flags). Task 3 specifies the two new test cases, the expected validation result shape (`{ valid: false }` with `field: "content"`), and that all 8 existing validation tests must continue to pass. No ambiguity in what "done" means for any task.

---

## 2. Cohesion and Coupling

PASS. Tasks 1 and 2 share a code path (`src/index.ts` argv handling) and form a natural pair — Task 1 introduces the scaffolding, Task 2 extends it. Task 3 operates on entirely different files (`src/utils/validation.ts`, `tests/validation.test.ts`) with zero coupling to the CLI work. The plan explicitly notes Task 3 is "fully independent of Tasks 1 and 2." High cohesion within each task, minimal coupling between them.

---

## 3. Key Abstractions in Earliest Tasks

PASS. Task 1 creates both shared artifacts that later work depends on: the `./tool` executable (needed for manual testing of all three tickets' acceptance criteria) and the `process.argv` parsing scaffolding in `src/index.ts` (extended by Task 2). Task 3 needs neither of these, so no early abstraction is missing.

---

## 4. Riskiest Assumption Validated in Task 1

PASS. The plan identifies the riskiest assumption as "Modifying `src/index.ts` is safe for tests" and validates it during Phase 0 exploration by confirming both test files import from `src/app` and `src/utils/validation`, never from `src/index`. Task 1 is the first to modify `src/index.ts`, so any violation of this assumption would surface immediately. The verification was done correctly — I confirmed that `notes.test.ts` imports `../src/app` and `validation.test.ts` imports `../src/utils/validation`.

---

## 5. Later Tasks Reuse Early Abstractions (DRY)

PASS. Task 2 explicitly extends the argv-checking block introduced in Task 1 rather than creating a parallel mechanism. Task 3 reuses the existing `validateCreateInput` function and the existing test file structure. No duplication is introduced.

---

## 6. Phase Boundaries at Cohesion Boundaries

PASS. All three tasks are grouped into a single phase with a single VERIFY checkpoint. The plan justifies this: all are small, belong to the same sprint, and together produce one reviewable increment. While Task 3 is independent enough to warrant its own phase, keeping it in Phase 1 is defensible — the total scope is small (three files modified, one file created, two tests added), and splitting would add overhead without meaningful benefit. The VERIFY step at the end comprehensively covers all three tasks' acceptance criteria.

---

## 7. Monotonically Non-Decreasing Tiers

PASS. The tier sequence is cheap (Task 1) → standard (Task 2) → standard (Task 3). This satisfies the plan's own ordering rule: `cheap → standard → standard → VERIFY [VALID]`. No tier downgrade occurs within the phase.

---

## 8. Each Task Completable in One Session

PASS. All three tasks are small, well-scoped changes. Task 1: add ~5 lines of argv checking to `index.ts` and create a 2-line shell script. Task 2: extend the argv check with a help branch and a usage string. Task 3: add one condition to an existing `if` statement and write two unit tests. None of these would challenge a single-session time budget.

---

## 9. Dependencies Satisfied in Order

PASS. Task 1 has no blockers. Task 2 depends on Task 1's `tool` script and argv scaffolding — correctly sequenced after Task 1. Task 3 has no blockers and is explicitly marked independent. The dependency graph is a simple chain (1 → 2) plus an isolated node (3), and execution order respects it.

---

## 10. Vague Tasks

PASS. NOTE: The exact formatting of the help text in Task 2 is unspecified — two developers could produce different layouts (e.g., columnar vs. prose, with or without a header line). However, the functional requirements ("lists every subcommand and flag") are clear, and help text formatting is a cosmetic detail that does not affect correctness. The plan specifies enough: "print a formatted usage block listing all subcommands (`help`) and all flags (`--version`/`-v`, `--help`/`-h`)." This is sufficient for implementation without ambiguity on what content must appear.

---

## 11. Hidden Dependencies

PASS. The only inter-task dependency (Task 2 → Task 1) is explicitly declared. Task 3 is genuinely independent — it touches different files, tests different behavior, and has no interaction with the argv handling code. I verified that no test file imports from `src/index`, confirming there is no hidden test-level coupling between the CLI changes and the validation fix.

---

## 12. Risk Register

PASS. The risk register covers five risks with appropriate impact ratings and mitigations. The `process.argv` test isolation risk was verified in Phase 0. The executable permission risk has a concrete mitigation (`chmod +x`, `.gitattributes`, verify with `git ls-files --stage`). The version string drift risk is noted with a reviewer checklist item.

NOTE: One minor risk is absent — the `./tool` shell script invokes `ts-node` directly (`exec ts-node ...`), which assumes `ts-node` is in `PATH`. Since `ts-node` is a devDependency, it lives in `node_modules/.bin/` and is only on `PATH` inside `npm` scripts. Running `./tool` from a bare shell after `npm install` may fail unless the script uses `npx ts-node` or the full `node_modules/.bin/ts-node` path. This is low-impact (developers typically know to adjust), but worth noting as the acceptance criteria specifically call for `./tool --version` to work.

NOTE: The risk register mentions the version string mitigation as "Hardcode matches current `'version': '1.0.0'` and `'name': 'noteapi'`" — but the CLI output name is `fleet-e2e-toy`, not `noteapi` (the package.json name). The hardcoded string is correct per the requirements, but the risk note is slightly misleading about what stays in sync.

---

## 13. Alignment with Requirements

PASS. Each requirement is addressed:

- **gh-toy-4ef (--version flag):** Task 1 implements `--version` and `-v` with the exact output string `fleet-e2e-toy v1.0.0` and exit code 0, matching the acceptance criteria. The requirement "works alongside other flags" is implicitly handled by the ordered argv check — version takes priority when combined with other flags, which is standard CLI behavior.

- **gh-toy-v6z (input validation bug):** Task 3 fixes the content validation gap identified in Phase 0 exploration. The requirement says "empty or whitespace-only string" — the plan addresses both with `obj.content.trim().length === 0` (catches both empty and whitespace-only) and adds two test cases covering each variant. The requirement's mention of "exit with non-zero exit code" maps to HTTP 400 responses in the API context, which is the correct interpretation for a REST API.

- **gh-toy-kbk (help command):** Task 2 implements `help`, `--help`, and `-h` (the last being a bonus beyond the explicit requirements) with usage output listing all subcommands and flags. Exit code 0 is specified.

The plan solves the right problems without scope creep.

---

## Summary

All 13 review checks pass. The plan is well-structured: Phase 0 exploration is thorough and verified against the actual codebase, tasks are correctly ordered by dependency and tier, done criteria are concrete and testable, and the plan faithfully addresses all three sprint tickets. The risk register is present and covers the primary risks.

Two minor notes for the implementer: (1) the `./tool` script should ensure `ts-node` is resolvable outside of `npm` script context (e.g., use `npx ts-node` or `./node_modules/.bin/ts-node`), and (2) the risk register's version sync note references the package name `noteapi` but the CLI output uses `fleet-e2e-toy` — these are intentionally different, and the risk note could be clearer about that.

**Verdict: APPROVED** — no blocking changes required. The noted items are advisory for the implementer.
