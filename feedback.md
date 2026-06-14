# pmlite-e2e-s1 -- Plan Review (revision 2)

**Reviewer:** pm-plan-reviewer
**Date:** 2026-06-14 15:30:00+00:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.
> Prior review (commit 34f021f) flagged two blocking issues plus three recommended
> additions. This revision (PLAN.md commit 6c23638) addresses all of them.

---

## How the revision addressed prior feedback

**Prior blocker 1 — Sequencing inverted the requirements-stated risk order.** Fixed. The planner restructured the task list so T1.1 now creates `src/cli.ts` with `--version`/`-v` only, runs `npm run build`, and runs a three-case smoke test that spawns `node dist/cli.js`. That is the smallest scope that exercises both R1 (TS compile of the new entrypoint) and R2 (Jest spawn into `dist/`), exactly as `requirements.md` Section "Risk / Priority Order" directs ("Make the `--version` flag Task 1 to prove the end-to-end CLI pipeline first"). The validation helper moves to T1.2, the help+validation extension to T1.3, the broader CLI test suite to T1.4, `pretest` wiring to T1.5, and VERIFY to T1.6. Ordering rationale is now spelled out at the top of Phase 1 and explicitly cites the requirements-stated risk-first reasoning.

**Prior blocker 2 — R1 in the risk register referenced the wrong task.** Fixed. R1 now reads "First empirically confirmed at T1.1 Done-when (`npm run build` succeeds and `dist/cli.js` exists)." That matches the new T1.1 which actually runs the build. R2 was likewise updated to "First confirmed at T1.1 (smoke spawn for `--version`) and broadened at T1.4 (full CLI test suite)."

**Prior non-blocking 1 — Add R3/R4/R5 to the risk register.** Fixed. R3 (`declaration: true` emits `dist/cli.d.ts`), R4 (ESLint `@typescript-eslint/no-unused-vars` is enforced — with a specific instruction not to "simplify" the `catch (err)` branch in T1.3), and R5 (synchronous `process.exit(main(argv))` is only safe because `main` is sync) are all present and well-scoped.

**Prior non-blocking 2 — Portability note for `spawnSync` with empty-string argv.** Fixed. T1.4 explicitly says: "invoke `spawnSync` with the array form `spawnSync(process.execPath, [CLI, ""], { encoding: "utf8" })` so an empty string element is passed verbatim as argv on both Windows and Linux. Do NOT use a shell string form."

**Prior non-blocking 3 — Per-feature smoke checks on the full-implementation task.** Fixed. T1.3's Done-when now enumerates four discrete smoke checks (version, `help`, `--help`, empty-string `""`), each with the exact expected stdout/stderr substring and exit code. That gives T1.3 atomic acceptance independent of T1.4's broader test sweep.

---

## 1. Done criteria per task

PASS. Every task carries a `Done when` block with binary, observable criteria: exit-code expectations, exact stdout strings or substring markers, files that must exist after the step, and named lint/test commands. T1.1's Done-when ties straight back to R1 and R2 (first empirical confirmation), T1.3's Done-when now lists four per-feature smoke checks (resolving the prior caveat), and T1.6 closes the phase on the full DoD gate (`npm run build`, `npm run lint`, `npm test` all exit 0 with no skipped tests). No "should work" or "looks reasonable" criteria remain.

## 2. Cohesion within tasks / coupling between tasks

PASS. T1.1 owns the CLI skeleton + smoke proof. T1.2 owns the validation helper + its unit tests. T1.3 owns the full CLI surface (precedence under D3, help text under D4). T1.4 owns the integration-test broadening. T1.5 owns the `pretest` wiring. T1.6 owns VERIFY. Each task touches a tightly scoped file set and the `Blockers` field explicitly tracks the cross-task dependencies (T1.3 -> T1.1 + T1.2; T1.4 -> T1.3; T1.6 -> everyone). No bidirectional coupling, no shared mutable scratch space between tasks.

## 3. Key abstractions in earliest tasks

PASS. The shared abstractions land early: T1.1 establishes the CLI entrypoint conventions (shebang, `main(argv): number`, `process.exit(main(...))`) which T1.3 must preserve verbatim, and T1.2 lands `validateNonBlank` before T1.3 imports it. The frozen decisions (D2 signature/error shape, D3 precedence, D4 help text, D5 version string, D6 file paths, D7 no-deps) are bakery-stamped before any task starts, so no task has to invent these.

## 4. Riskiest assumption validated in Task 1

PASS. This was the headline issue in the prior review and is now resolved. T1.1 collapses to exactly the scope the requirements asked for: a `--version`-only `src/cli.ts` whose Done-when requires `npm run build` to succeed, `dist/cli.js` to exist, and `npx jest tests/cli.test.ts` to pass three smoke cases. Both R1 (TS compile) and R2 (Jest spawn portability) are empirically exercised before any other CLI work starts. The plan also documents the rationale at the top of Phase 1 so the requirements-stated risk-first reasoning is no longer implicit.

## 5. Reuse of early abstractions (DRY)

PASS. T1.3 reuses the T1.1 entrypoint structure (replaces only the body) and imports `validateNonBlank` from T1.2 rather than redefining its message format. The version string and help text live exactly once in `src/cli.ts`; tests in T1.1 and T1.4 assert against the literal string or substring markers, not against duplicate copies of the help block.

## 6. Phase boundaries at cohesion boundaries

PASS. A single phase remains the right cut for this sprint. Every task contributes to one reviewable increment (a working CLI gated by build+lint+test), and the phase closes with VERIFY (T1.6). The sprint is small enough that an extra phase boundary would be ceremonial.

## 7. Models assigned, sized, and clustered

PASS. T1.3 (argv precedence, the only judgment-bearing task) gets sonnet; everything else (T1.1, T1.2, T1.4, T1.5, T1.6) gets haiku. Streaks are explicit and contiguous: Streak A (haiku T1.1 + T1.2), Streak B (sonnet T1.3 alone), Streak C (haiku T1.4 + T1.5 + T1.6). Three dispatches total, with the haiku tail handling tests + script wiring + VERIFY in one fresh context. Each streak fits comfortably inside its model's context budget.

## 8. Each task completable in one dispatch

PASS. T1.1 specifies two file contents verbatim. T1.2 is an append to one source file and one test file. T1.3 specifies the full final file contents. T1.4 enumerates the test cases and the portable `spawnSync` form. T1.5 is a one-key edit to `package.json`. T1.6 is three command invocations. None of these require iterative discovery beyond what a single dispatch absorbs.

## 9. Dependencies satisfied in order

PASS. T1.1 (no blockers) -> T1.2 (no blockers; purely additive helper) -> T1.3 (needs T1.1 file + T1.2 helper) -> T1.4 (needs T1.3 CLI behaviour to assert against) -> T1.5 (mechanically independent, scheduled here for VERIFY) -> T1.6 (gates everything). The graph is a linear path with one safe shortcut (T1.2 can run in parallel with T1.1; the plan groups them in Streak A which is fine).

## 10. Vague tasks

PASS. The D1–D7 frozen decisions remove the standard ambiguity vectors (stderr vs stdout, exit codes, precedence between `--version` and `--help`, no-arg behaviour, dependency policy, file locations). The lone remaining ambiguity from the prior review — how to pass an empty-string argv element portably — is now resolved by the explicit `spawnSync(process.execPath, [CLI, ""], { encoding: "utf8" })` instruction in T1.4. Two implementers following this plan will produce functionally identical CLIs.

## 11. Hidden dependencies

PASS. The only non-obvious dependency is the `npm test` -> `pretest` -> `tsc` chain; T1.5's Done-when surfaces it explicitly (run with `dist/` deleted). One subtlety: T1.1 runs `npx jest tests/cli.test.ts` before `pretest` exists, so the task instruction explicitly says "Run `npm run build` once during this task and confirm `dist/cli.js` exists before running the smoke test." That avoids the trap of the smoke test failing because nothing has compiled `dist/cli.js` yet.

## 12. Risk register

PASS. All five risks (R1–R5) are present, scoped, and linked to the task where they are first exercised. R1 (TS compile) and R2 (Jest spawn) now correctly point at T1.1 as their first empirical confirmation. R3 (declaration emit), R4 (eslint no-unused-vars constraints on T1.3), and R5 (sync `process.exit`) are each accompanied by a clear "what to do about it" — including the specific instruction not to "simplify" the `catch (err)` branch by dropping the `String(err)` arm, which is the precise way R4 would bite an implementer.

## 13. Alignment with requirements.md intent

PASS. All three acceptance criteria sets from requirements.md map onto Done-when bullets (`--version` exact output + exit 0 + `-v` alias + precedence; validation error to stderr with exit 1 for `""` and `"   "`; help via `help`/`--help`/`-h` with usage text listing every flag and subcommand). DoD is adopted verbatim. The requirements-stated "Risk / Priority Order" is now honoured: `--version` is genuinely Task 1, with the smallest scope that exercises the riskiest assumption end-to-end. File locations match requirements (CLI at `src/cli.ts`, validation in `src/utils/validation.ts`, tests in `tests/cli.test.ts` and `tests/validation.test.ts`).

---

## Summary

Both prior blockers are resolved and all three prior non-blocking recommendations are incorporated:

- T1.1 now creates `src/cli.ts` with `--version` only, runs `npm run build`, and spawns the binary in a three-case smoke test — directly honouring `requirements.md` "Risk / Priority Order" and giving R1/R2 their first empirical confirmation in Task 1.
- R1 and R2 in the risk register now point at T1.1 as the first confirmation site, which matches the restructured task list.
- R3, R4, R5 are added with actionable guidance, including a specific R4 instruction tied to the T1.3 skeleton.
- T1.4 specifies the portable `spawnSync(process.execPath, [CLI, ""], ...)` form for empty-string argv.
- T1.3's Done-when carries four per-feature smoke checks so it has atomic acceptance.

Decisions D1–D7 remain bakery-stamped, models are sized to task complexity (one sonnet, five haiku) and clustered into three contiguous streaks (three dispatches). The plan is now ready to dispatch.

Verdict: APPROVED.
