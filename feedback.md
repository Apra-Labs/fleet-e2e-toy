# fleet-e2e-toy — Plan Review

**Reviewer:** pm-lite-plan-reviewer
**Date:** 2026-06-05 00:00:00+00:00
**Verdict:** CHANGES NEEDED

---

## 1. Done Criteria Clarity

**PASS.** Every task (Task 1 through Task 4) and the final VERIFY checkpoint specify clear, testable done criteria, including exact exit codes, stdout/stderr outputs, and test suite verification commands.

---

## 2. Cohesion and Coupling

**PASS.** The tasks in the phase are highly cohesive, building the CLI tool entry point, version flags, blank validation helper, and help subcommand sequentially.

---

## 3. Key Abstractions in Earliest Tasks

**PASS.** Task 1 scaffolds `src/cli.ts` and the `tool` entry point wrapper script, which serve as the foundation for all subsequent tasks.

---

## 4. Riskiest Assumption Validated in Task 1

**PASS.** Task 1 validates that the typescript runtime execution works via the `./tool` wrapper, verifying the CLI invocation mechanism.

---

## 5. Later Tasks Reuse Early Abstractions (DRY)

**PASS.** Tasks 2, 3, and 4 all build on the scaffold created in Task 1. Task 3 properly places validation helpers in `src/utils/validation.ts`.

---

## 6. Phase Boundaries at Cohesion Boundaries

**PASS.** A single cohesive phase is defined for the entire CLI features sprint, ending with a comprehensive manual and automated verification sweep.

---

## 7. Tiers Monotonically Non-Decreasing

**PASS.** The tier sequence is: cheap (Task 1) -> cheap (Task 2) -> standard (Task 3) -> standard (Task 4). This is strictly non-decreasing.

---

## 8. Each Task Completable in One Session

**PASS.** Each task is small and focused, which should easily fit within a single session.

---

## 9. Dependencies Satisfied in Order

**PASS.** The order is logical: scaffolding first, then the simple version flag, followed by input validation, and finally the help command structure.

---

## 10. Vague Tasks

**PASS.** No vague tasks found. Every task specifies exact file paths, expected changes, and concrete done criteria.

---

## 11. Hidden Dependencies

**PASS.** No hidden cross-task dependencies.

---

## 12. Risk Register

**FAIL.** The risk register misses a critical environment-specific risk:
- **CRLF line endings on the root `tool` script:** Since `tool` is a root-level executable script without a `.sh` extension, default Git line-ending normalization rules (like `*.sh text eol=lf`) may not apply. On Windows development environments, this will result in CRLF line endings, causing a "bad interpreter" shebang error when run on Unix/Linux CI. The plan should mitigate this by explicitly adding `tool text eol=lf` to `.gitattributes`.

---

## 13. Alignment with Requirements

**FAIL.** While the plan correctly maps the three target issues to tasks, there are two major alignment and setup issues:
- **`feature_list.json` Mismatch:** The `feature_list.json` file currently in the workspace lists 4 unrelated REST API features ("Tag filtering endpoint", "Full-text search", "Pagination support", "Note archiving") instead of the CLI features. Since the execution loop in `AGENT_PROMPT.md` uses `feature_list.json` to determine which features to implement, the agent will implement the wrong features. The plan must include a task to update `feature_list.json` to align with the sprint's CLI features.
- **Gitignoring `CLAUDE.md`:** Task 1 states "Add `CLAUDE.md` to `.gitignore`." `CLAUDE.md` is a tracked file in the repository that contains conventions, setup commands, and Beads tracker instructions. Gitignoring it is incorrect and unnecessary.

---

## Summary

**Verdict: CHANGES NEEDED.** The plan has a solid foundation but requires changes to address the following:
1. **`feature_list.json` Mismatch (Blocking):** The active `feature_list.json` must be updated to track the CLI features instead of the old REST API features.
2. **Gitignoring `CLAUDE.md`:** Remove the instruction to add `CLAUDE.md` to `.gitignore`.
3. **CRLF Line Endings Risk:** Add mitigation to add `tool text eol=lf` to `.gitattributes` to prevent interpreter errors on Unix systems.
