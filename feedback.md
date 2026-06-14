# pmlite-e2e-s1 -- Plan Review

**Reviewer:** pm-plan-reviewer
**Date:** 2026-06-14 14:00:00+00:00
**Verdict:** CHANGES NEEDED

> See the recent git history of this file to understand the context of this review.

---

## 1. Done criteria per task

PASS with one caveat. Every task has an explicit "Done when" block with concrete, observable criteria (commands that must exit 0, files that must exist, specific output strings). T1.1 requires the validation test to pass and lint to pass; T1.2 requires `npm run build` to succeed and `dist/cli.js` to exist plus a smoke check for `--version`; T1.3 requires `npx jest tests/cli.test.ts` to pass; T1.4 requires `npm test` to succeed from a state with `dist/` deleted; T1.5 is itself the global VERIFY step. The caveat is that T1.2's "Done when" only smoke-checks `--version` even though that task implements all three features (help, validation, version) — the per-feature checks are deferred to T1.3. That is acceptable because T1.3 will catch regressions, but it slightly weakens T1.2's atomic acceptance.

## 2. Cohesion within tasks / coupling between tasks

PASS. T1.1 owns the helper + its unit test (single concern: validation primitive). T1.2 owns the CLI surface (single file, single feature group). T1.3 owns the CLI integration tests. T1.4 owns the npm-script wiring. T1.5 owns verification. Coupling between tasks is one-directional and explicit via the `Blockers` field: T1.2 -> T1.1, T1.3 -> T1.2, T1.5 -> all. No hidden bidirectional coupling.

## 3. Key abstractions in earliest tasks

PASS. `validateNonBlank` (the shared helper consumed by the CLI) lands in T1.1. D2 fixes its signature, error message format, and throwing contract up-front so T1.2 can rely on it without re-litigation. Help text content (D4) and version string (D5) are also frozen in decisions and are not re-derived inside tasks.

## 4. Riskiest assumption validated in Task 1

**FAIL.** This is the headline issue. The plan's own R1 names the riskiest assumption as "TypeScript compiles `src/cli.ts` to `dist/cli.js` cleanly" — and `requirements.md` Section "Risk / Priority Order" is explicit:

> "Make the `--version` flag Task 1 to prove the end-to-end CLI pipeline first (smallest scope, binary acceptance criteria). Validation helper and help command follow."

The plan inverts that ordering: T1.1 is the validation helper (no CLI compile risk exercised), and the CLI compile risk is not exercised until T1.2 — which also bundles all three features into one sonnet task. The rationale offered (T1.2 imports `validateNonBlank`) is real but resolvable: T1.1 could be a stub `src/cli.ts` that handles only `--version`/`-v` (proving the TS-compile + Jest-spawn pipeline end-to-end in the smallest scope), with `validateNonBlank` and help added in subsequent tasks. As written, the plan defers the riskiest assumption past Task 1, contradicting requirements.md guidance that was explicitly meant to drive sequencing.

Additionally, R1 in the risk register says "Confirmed at T1.1 VERIFY (the build step)" — but T1.1 does not run `npm run build` and does not touch `src/cli.ts`. This is a factual error in the risk register; the TS-compile risk is first exercised by T1.2's `npm run build`. Either fix the reference or restructure the tasks so T1.1 really does exercise that risk.

## 5. Reuse of early abstractions (DRY)

PASS. T1.2 imports `validateNonBlank` from T1.1. The frozen help text (D4) and version string (D5) appear only in `src/cli.ts` and are asserted against in T1.3's tests. No duplicated definitions of the constants across source and tests (tests assert on substring markers like `Usage:`, `--version`, `--help`, not on the full block) — good DRY discipline.

## 6. Phase boundaries at cohesion boundaries

PASS. A single phase is defensible here: every task contributes to one reviewable increment (a working CLI gated by build + lint + test). The sprint is small enough that splitting into multiple phases would be artificial. The VERIFY task closes the phase with the full DoD gate.

## 7. Models assigned, sized, and clustered

PASS. T1.2 (the only task requiring judgment about argv parsing and precedence) gets sonnet; T1.1, T1.3, T1.4, T1.5 (mechanical work guided by frozen decisions) get haiku. Streaks are explicit at the end: Streak A (haiku T1.1), Streak B (sonnet T1.2), Streak C (haiku T1.3+T1.4+T1.5) — three dispatches, with the haiku tail contiguous so one fresh context handles tests + script wiring + VERIFY. Each task fits comfortably inside its model's context budget. Note: if the restructure under check 4 splits T1.2 into per-feature tasks, the model assignments should be re-evaluated (the per-feature work would likely be haiku once each obeys a single frozen decision).

## 8. Each task completable in one dispatch

PASS. T1.1 touches two files with a tight code block specified. T1.2 creates one file with the full skeleton provided. T1.3 creates one test file with the full case list enumerated. T1.4 is a one-line addition to `package.json`. T1.5 runs three commands. None requires interactive iteration beyond what a single dispatch can absorb.

## 9. Dependencies satisfied in order

PASS. T1.1 (no blockers) -> T1.2 (blocked by T1.1) -> T1.3 (blocked by T1.2) -> T1.4 (independent, can be done anywhere before T1.5) -> T1.5 (blocked by all). T1.4 is correctly marked as mechanically independent but logically required for VERIFY. The graph is linear and resolvable.

## 10. Vague tasks

PASS. Decisions D1–D7 eliminate the common ambiguity vectors: error message wording, stderr vs stdout routing, exit codes, precedence between conflicting flags (D3 even handles `--version` + `--help`), behaviour on no-args (D3 step 4 prints help, an explicit choice not in requirements but documented), and dependency policy (D7 forbids `commander`/`yargs`). Two implementers following this plan would produce functionally equivalent CLIs. One small ambiguity: the test under T1.3 says "empty-string argument `\"\"`" without specifying how the test author should spawn the process with an empty argv element on Windows — `spawnSync` with an args array `["dist/cli.js", ""]` works on both platforms, but a note would help.

## 11. Hidden dependencies

PASS with one note. The only non-obvious dependency is that `npm test` invokes `pretest` (T1.4) which runs `tsc` over `src/cli.ts` (T1.2) — so deleting `dist/` then running `npm test` exercises the whole chain. This is implicit but the plan calls it out in T1.4's Done-when. One hidden concern: ts-jest is already configured and will compile `tests/cli.test.ts` independently — that path does not require `dist/`. But the CLI under test does require `dist/cli.js`, which `pretest` provides. The plan handles this correctly; just confirming there is no skipped dependency.

## 12. Risk register

PARTIAL PASS / FAIL on accuracy. The plan does include a risk register (R1, R2), which is the structural requirement. However:

- R1 mis-attributes the confirmation point to T1.1 (see check 4). It should say T1.2.
- A risk worth adding: **R3 — `tsconfig.json` has `"declaration": true`, so `tsc` emits `.d.ts` files alongside `.js`.** This is benign but worth noting because the CLI gets a `dist/cli.d.ts` it does not need; it does not break anything but if any future task adds a `files` allowlist to `package.json`, the CLI declaration emit will be a surprise.
- A risk worth adding: **R4 — eslint `@typescript-eslint/no-unused-vars` is set to `error`.** The T1.2 skeleton uses `err instanceof Error` and discards a non-Error branch with `String(err)`, so it should lint cleanly, but the plan should remind the implementer that any unused import or `_` parameter convention is enforced.
- A risk worth adding: **R5 — `process.exit` inside `main(argv)` vs. at the bottom of the file.** The skeleton calls `process.exit(main(...))`. That is fine, but if any future code awaits a promise inside `main`, the synchronous `process.exit` will cut it off. Not a blocker for this sprint but worth a one-line warning.

## 13. Alignment with requirements.md intent

PARTIAL PASS. The plan correctly identifies the three features, freezes the right artifacts (version string, file locations, error message shape), and adopts the DoD verbatim. The deviation from the explicit "make `--version` Task 1" guidance (check 4) is the one place where the plan optimises for code-locality rather than for the requirement author's stated intent to prove the riskiest assumption first. Otherwise, every acceptance criterion in requirements.md maps to a Done-when bullet in the plan (`--version` exact output and exit, `-v` alias, precedence over other flags, validation error to stderr with exit 1, help on `help`/`--help`/`-h` with exit 0, help mentions every flag and subcommand).

---

## Summary

The plan is structurally strong: tasks are atomic, decisions are frozen, models are sized correctly, and the DoD is mapped. Two issues prevent approval:

1. **Sequencing inverts the requirements-stated risk order.** `requirements.md` explicitly says `--version` should be Task 1 to prove the end-to-end CLI pipeline first. The plan instead makes the validation helper Task 1 and bundles all three CLI features into T1.2. Either restructure (suggested: T1.1 = stub `src/cli.ts` with `--version` only + one smoke test; T1.2 = validation helper + wire into CLI; T1.3 = help; T1.4 = full tests; T1.5 = pretest; T1.6 = VERIFY) or, if you keep the current order, document in R1 why you chose code-locality over requirements-stated risk-first ordering and acknowledge the deferred risk.

2. **R1 in the risk register references the wrong task.** It says "Confirmed at T1.1 VERIFY (the build step)" but T1.1 does not run `npm run build` or touch the CLI. Fix to "Confirmed at T1.2 Done-when (`npm run build` succeeds; `dist/cli.js` exists)" or restructure per (1) so the reference becomes correct.

Also recommended (not blocking):
- Add R3/R4/R5 from check 12 to the risk register.
- Add a sentence to T1.3 noting that `spawnSync` should be invoked with `args: ["dist/cli.js", ""]` (array form) to pass an empty string argv element portably on Windows.
- Consider splitting T1.2's Done-when into per-feature smoke checks so it is not entirely dependent on T1.3 for per-feature verification.
