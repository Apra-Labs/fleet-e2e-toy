# CLI Features P1 -- Plan Review

**Reviewer:** pm-lite-plan-reviewer
**Date:** 2026-06-03 00:00:00+00:00
**Verdict:** CHANGES NEEDED

> First review. No prior feedback.md history on this branch.

---

## 1. Done criteria clarity

PASS for most tasks. Each task has specific, testable assertions listed as done criteria (function return values, HTTP status codes, exit codes). Phase boundary verify steps are present and concrete. One ambiguity is noted under item 10 below.

---

## 2. Cohesion and coupling

PASS. Phase 1 (CLI flag handling) and Phase 2 (input validation) are well-separated. Within each phase tasks are tightly related. Task 1 creates the abstraction (`runCli`), Task 2 wires it, Task 3 tests it — a clean progression. Phase 2 mirrors that: Tasks 4 and 5 implement independently (no coupling to each other), Task 6 tests both.

---

## 3. Key abstractions in early tasks

PASS. `runCli` is created in Task 1 and all downstream tasks (2, 3) depend on it. `validateCreateInput`/`validateUpdateInput` modifications in Task 4 precede Task 6's tests. Abstractions are defined before consumers.

---

## 4. Riskiest assumption validated in Task 1

FAIL. The requirements explicitly name the riskiest assumption: "No third-party CLI parsing library is present." The plan correctly states in its "Verified Assumptions" section that no CLI library is present and that `process.argv` inline parsing is the approach. However, a more dangerous and overlooked assumption -- whether `import pkg from "../package.json"` will actually compile given `tsconfig.json`'s `rootDir: "./src"` constraint -- is treated as already resolved in the Verified Assumptions block but is NOT resolved. See item 12 (risk register) for the full analysis.

---

## 5. DRY / reuse of early abstractions

PASS. The `runCli` function from Task 1 is reused in both Task 2 (integration into `index.ts`) and Task 3 (unit testing). Validation helpers from `src/utils/validation.ts` extended in Task 4 are consumed by Task 6 tests without duplication.

---

## 6. Phase boundaries at cohesion boundaries

PASS. Phase 1 is entirely about CLI startup behavior. Phase 2 is entirely about request-time input validation. They share no code paths or data models, so placing them in separate phases is correct. Each phase ends with a concrete verify step.

---

## 7. Model assignments and context budget

PASS. `claude-sonnet-4-6` is used for the two structurally complex tasks (Task 1: new abstraction creation; Task 3: new test file with both unit and spawnSync tests). `claude-haiku-4-5-20251001` handles the simpler modification tasks (2, 4, 5, 6). Same-model tasks are clustered: Tasks 4, 5, 6 are all haiku and are in sequence. Sizing is appropriate to task complexity.

---

## 8. Each task completable in one dispatch

PASS. Each task modifies at most two files, has explicit before/after code shown, and has clear done criteria a single agent can verify. No task requires coordination with an external system or another concurrent task.

---

## 9. Dependencies satisfied in order

PASS. The dependency graph is: Task 1 -> Task 2 -> Task 3; Tasks 4 and 5 are independent; Task 6 depends on Tasks 4 and 5. All dependencies are satisfied by earlier tasks in the task summary table and blockers are correctly listed.

---

## 10. Vague tasks

FAIL (minor). Task 1 specifies that help text is printed "exactly" and then shows a markdown block. The indentation shown in the plan (two-space indent before `ts-node src/index.ts [options]`, four-space before option entries) is rendered as markdown indentation in the plan document. It is ambiguous whether those leading spaces are part of the literal output string or are markdown formatting artifacts. Two developers reading this plan would likely produce different column layouts. The plan should specify the exact column-0 string, or reference the requirements.md format block unambiguously (requirements.md lines 95-107 show the same text with the same ambiguity). The help text format should be specified as a raw string with explicit column markers or a note clarifying that markdown indentation is NOT part of the output.

---

## 11. Hidden dependencies

FAIL. There is one hidden dependency that is not listed: Task 3's spawnSync smoke tests depend on `ts-node` being resolvable from the PATH or the project's `node_modules/.bin`. The plan mentions setting `cwd` in the spawnSync call but does not specify that the command should use `npx ts-node` or `node_modules/.bin/ts-node` rather than a bare `ts-node` invocation. On CI environments where `ts-node` is not globally installed, the smoke tests will fail with a command-not-found error. This is not listed as a blocker or a risk.

---

## 12. Risk register

FAIL. The risk register has three entries but is missing critical risks:

**Risk 1 (missing, HIGH severity): `rootDir` constraint blocks JSON import.**
`tsconfig.json` sets `"rootDir": "./src"`. TypeScript enforces that all imported source files must be under `rootDir`. Importing `../package.json` from `src/cli.ts` references a path outside `rootDir` and TypeScript will emit error TS6059 ("File is not under 'rootDir'"). The plan's Verified Assumptions section says "Importing `package.json` directly is safe" and cites only `resolveJsonModule: true` and `esModuleInterop: true` as evidence. Those flags are necessary but not sufficient -- `rootDir` is the blocking constraint. The doer needs to choose one of: (a) widen `rootDir` or remove it, (b) use `require("../package.json")` at runtime (bypasses tsc's rootDir check since it's not a static import), (c) use `fs.readFileSync` + `JSON.parse` at runtime, or (d) inline the version string and accept the DRY violation. None of these options are discussed. This is a likely task-blocking defect if the doer follows the plan literally.

**Risk 2 (missing, MEDIUM severity): Import path typo in plan.**
Plan line 36 states: "Imports `name` and `version` from `../../package.json`". From `src/cli.ts`, the repository root is `..` (one level up), not `../..` (two levels up). The correct relative path is `../package.json`. If the doer copies the path literally from the plan, the import will fail at compile time. This is a documentation defect that should be corrected.

**Risk 3 (missing, MEDIUM severity): Windows CRLF in exact stdout comparison.**
Task 3 done-criteria states: `stdout equals "noteapi v1.0.0\n"`. On Windows, `spawnSync` commonly yields `\r\n` line endings. The risk register notes ts-node cold-start flakiness but not newline normalization. The test should use `.toString().trim()` or a `includes()` / regex match rather than strict equality with `\n`, or the risk register should document this and prescribe `.trim()` in the test implementation note.

**Risk 4 (mis-stated, LOW severity): `testMatch` glob coverage.**
The plan's risk register entry about Jest `testMatch` not picking up `tests/cli.test.ts` is not actually a risk. `jest.config.ts` sets `roots: ["<rootDir>/tests"]` and `testMatch: ["**/*.test.ts"]` -- any `.test.ts` file under `tests/` is picked up automatically. The risk entry can be removed or downgraded to a note.

---

## 13. Alignment with requirements intent

PASS. The plan addresses all three source issues (gh-toy-4ef, gh-toy-v6z, gh-toy-kbk). The acceptance criteria in the requirements are mapped to concrete done criteria in each task. No out-of-scope features are planned. The constraint of no new npm dependencies is respected throughout. The decision to place `runCli` in a separate `src/cli.ts` file (rather than inlining in `index.ts`) is architecturally sound and enables the unit-test approach without spawning a process.

---

## Summary

**What passed:** Phase structure, cohesion/coupling, model assignments, task ordering, dependency graph, scope alignment with requirements, and reuse of abstractions all look solid. The plan is well-structured overall.

**Must change before implementation:**

1. **`rootDir` / JSON import blocker (Risk 1):** The plan must either choose an implementation strategy for reading `package.json` that does not violate `rootDir: "./src"`, or document that `tsconfig.json`'s `rootDir` must be widened. The Verified Assumptions section incorrectly claims this is resolved.

2. **Import path typo in Task 1 (Risk 2):** Line 36 says `../../package.json`. The correct path from `src/cli.ts` is `../package.json`. Fix the literal path in the plan.

3. **Windows newline in stdout equality check (Risk 3):** Task 3 smoke-test done-criteria should use `.trim()` comparison or `includes()` rather than exact `\n`-terminated equality, or the risk register must document this and prescribe the mitigation.

4. **Help text exact format (item 10):** Clarify whether the markdown indentation in the "Help text printed is exactly" block is part of the literal output or markdown formatting. Specify the column-0 string or add an explicit note.

5. **spawnSync command resolution (item 11):** Document whether the smoke test should invoke `npx ts-node` or `node_modules/.bin/ts-node` to ensure portability across environments where `ts-node` is not globally installed.

**Deferred / low priority:** Remove or downgrade the mis-stated `testMatch` risk register entry (Risk 4).
