# CLI Features P1 -- Plan Review

**Reviewer:** pm-lite-plan-reviewer
**Date:** 2026-06-03 16:45:00-04:00
**Verdict:** APPROVED

> Prior review (commit 6b328ec) flagged five issues: rootDir/JSON import blocker, import path typo, Windows CRLF in stdout comparison, help text format ambiguity, and spawnSync command resolution. All five have been addressed in the current PLAN.md. This review verifies each fix and checks for new issues.

---

## Prior Findings Resolution

**Finding 1 (rootDir/JSON import blocker) — RESOLVED.** The plan now uses `const pkg = require("../package.json") as { name: string; version: string }` in Task 1 and adds a Verified Assumption (item 2) explicitly stating that `rootDir: "./src"` blocks a static `import` and that `require` bypasses tsc's rootDir static analysis. The risk register now contains a HIGH-severity entry documenting this constraint and its mitigation. Verified against `tsconfig.json`: `rootDir` is `"./src"`, `module` is `"commonjs"`, so `require` is the correct runtime approach.

**Finding 2 (import path typo `../../package.json`) — RESOLVED.** All occurrences in the plan now correctly show `"../package.json"` (one level up from `src/cli.ts` to the repo root). No remaining `../../` references.

**Finding 3 (Windows CRLF in stdout comparison) — RESOLVED.** Task 3 now specifies `.toString().trim()` for equality comparisons and `.includes()` / regex for multi-line content assertions. The risk register includes a MEDIUM-severity entry for Windows CRLF in stdout comparison with this prescribed mitigation.

**Finding 4 (help text format ambiguity) — RESOLVED.** Task 1 now appends an explicit prose note clarifying column layout: "Usage:", "Options:", and "Environment:" headers sit at column 0; `ts-node src/index.ts [options]` has exactly 2 leading spaces; each option and environment entry has exactly 2 leading spaces. Two developers reading this will produce identical output.

**Finding 5 (spawnSync command resolution) — RESOLVED.** Task 3 now specifies `node_modules/.bin/ts-node` as the executable with the rationale that `ts-node` is a devDependency and is always present at that path after `npm install`. The risk register includes a MEDIUM-severity entry for the global-install scenario and documents this mitigation.

---

## 1. Done criteria clarity

PASS. Every task has specific, verifiable done criteria. Task 1 lists exact return values for six `runCli` invocations. Tasks 4 and 5 list concrete input/output pairs for the modified functions. Task 3 distinguishes unit tests (synthetic argv) from smoke tests (spawnSync) and requires no test rely on the default 5-second Jest timeout. Phase verify steps at the end of each phase are concrete and actionable.

---

## 2. Cohesion and coupling

PASS. Phase 1 (CLI flag handling) and Phase 2 (input validation) are fully decoupled. They modify different files (`src/cli.ts`, `src/index.ts` vs. `src/utils/validation.ts`, `src/api/notes.ts`) and share no data model or code path. Within Phase 1, Tasks 1, 2, and 3 are sequentially dependent and tightly focused on the single `runCli` abstraction. Within Phase 2, Tasks 4 and 5 are independent and Task 6 consumes both.

---

## 3. Key abstractions in early tasks

PASS. `runCli(argv: string[]): { handled: boolean; exitCode: number }` is defined in Task 1 and serves as the interface for Task 2 (integration) and Task 3 (testing). The `validateCreateInput` / `validateUpdateInput` extension in Task 4 precedes the tests in Task 6. No consumer task introduces an abstraction it should have inherited.

---

## 4. Riskiest assumption validated in Task 1

PASS. Requirements identify the riskiest assumption as: "No third-party CLI parsing library is present; `process.argv` parsing must be done inline." Task 1 is designed around this constraint — the `runCli` function uses `argv.slice(2)` scanning with no library dependency. The plan also proactively validates the `rootDir` constraint (previously a blocker) in the Verified Assumptions section and resolves it before Task 1 is written.

---

## 5. DRY / reuse of early abstractions

PASS. `runCli` from Task 1 is imported in both Task 2 (`src/index.ts`) and Task 3 (`tests/cli.test.ts`). No logic is duplicated. The validation helper modifications in Task 4 are in a single location (`validateCreateInput` / `validateUpdateInput`) consumed by both the API handler (already wired) and the Task 6 tests. No parallel validation paths are introduced.

---

## 6. Phase boundaries at cohesion boundaries

PASS. Phase 1 addresses startup behavior (before server bind). Phase 2 addresses request-time validation. These are distinct code paths with distinct test strategies. Each phase concludes with a verify step that independently confirms the phase's outputs without relying on the other phase.

---

## 7. Model assignments and context budget

PASS. `claude-sonnet-4-6` is assigned to the two structurally complex tasks: Task 1 (new abstraction with runtime JSON loading, argv scanning, exact output specification) and Task 3 (new test file with dual test strategy: unit + spawnSync). `claude-haiku-4-5-20251001` handles simpler modification tasks (2, 4, 5, 6). Same-model tasks are clustered: Tasks 4, 5, 6 are consecutive haiku tasks. Each task modifies at most two files and fits within a single dispatch.

---

## 8. Each task completable in one dispatch

PASS. No task coordinates with another concurrent agent. Each task has at most two target files. Before/after code fragments are provided for all modification tasks, so the implementer does not need to infer intent. Done criteria are verifiable by running `npm test` or inspecting function return values.

---

## 9. Dependencies satisfied in order

PASS. Task ordering: 1 -> 2 -> 3; Tasks 4 and 5 independent; 6 depends on 4 and 5. The task summary table and the "Blockers" field in each task accurately reflect these relationships. No circular dependencies.

---

## 10. Vague tasks

PASS. The previously vague help text format has been clarified with explicit column-0 specifications (see Prior Finding 4 above). All before/after code fragments in Tasks 4 and 5 are exact TypeScript, not paraphrases. Task 6 specifies which `describe` block in each test file to extend, removing ambiguity about placement.

---

## 11. Hidden dependencies

PASS. The previously unspecified spawnSync command has been resolved (see Prior Finding 5 above). NOTE: Task 3 smoke tests set `cwd` to "the repo root" but do not specify how to compute this path dynamically in the test file (e.g., `path.resolve(__dirname, "..")` from `tests/cli.test.ts`). This is implementation-level detail that a competent implementer will resolve correctly; it does not rise to the level of a blocking hidden dependency.

---

## 12. Risk register

PASS. The risk register now contains five entries covering all previously missing risks: ts-node cold start (MEDIUM), JSON version field inference (LOW), rootDir blocking static import (HIGH), Windows CRLF in stdout (MEDIUM), and ts-node not globally installed (MEDIUM). The previously mis-stated `testMatch` glob coverage risk has been removed. The register accurately characterizes severity and documents concrete mitigations for each entry.

---

## 13. Alignment with requirements intent

PASS. All three source issues are addressed: gh-toy-4ef (`--version` flag), gh-toy-v6z (blank string validation), gh-toy-kbk (help command). The acceptance criteria from requirements.md are mapped to task done criteria. Out-of-scope items (interactive subcommands, config files, new npm dependencies) are not present in the plan. The constraint that `package.json` version is read at runtime (DRY) is satisfied.

---

## Summary

All five findings from the prior review (6b328ec) have been addressed with appropriate specificity. The plan is structurally sound: phases are cohesive, dependencies are explicit, abstractions are defined before consumers, riskiest assumptions are validated, and every task has actionable done criteria. The `require("../package.json")` mitigation for the rootDir constraint is technically correct given `module: "commonjs"` in tsconfig.json. Model assignments are well-matched to task complexity. No new issues were identified.

The plan is ready for implementation.
