# pmlite-e2e-s1 -- Documentation Harvest Re-Review (docs/cli.md)

**Reviewer:** pm-reviewer
**Date:** 2026-06-14 14:25:00-04:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this
> review. Prior commits on feedback.md: 34f021f (plan review CHANGES NEEDED),
> aba78fe (plan re-review APPROVED), 3173fe5 (Phase 1 code review APPROVED),
> 3a2cb9b (harvest review CHANGES NEEDED), 45c54e7 (doer annotation pointing
> at fix commit 63823d9). This re-review confirms the two items called out
> in the 3a2cb9b review (one blocker, one non-blocking polish) are resolved.

---

## Verification of prior blockers

PASS. Both items called out in the 3a2cb9b review are addressed in commit
63823d9:

- **`(D3)` parenthetical (was the CHANGES-NEEDED blocker).** Removed from
  `docs/cli.md:10`. The line now reads "Flags are resolved in strict order
  with immediate exit on first match:" -- the surrounding sentence stands
  on its own without the cross-reference into PLAN.md's decision numbering.
  A `grep -i "D3|T1\.|TODO|FIXME|sprint|phase"` over `docs/cli.md` returns
  zero matches; no other sprint scaffolding leaked in.
- **Speculative shell-script wording (was non-blocking polish).** Tightened
  on `docs/cli.md:7` from "for future shell script compatibility" to "for
  direct shell invocation". The new phrasing describes a property of the
  shebang artifact actually present in `src/cli.ts:1` instead of speculating
  about future use.

The doer's annotation in the previous feedback.md (45c54e7) correctly cites
commit 63823d9, and the diff in 63823d9 is exactly the two edits described
above -- no scope creep into the rest of the doc.

## Working tree, gates, and CI

PASS. `git status --porcelain` is empty. Re-ran the gates against the
committed state:
- `npm test`: exit 0; 34/34 tests pass across `tests/validation.test.ts`,
  `tests/cli.test.ts`, and `tests/notes.test.ts`. `pretest` rebuilt `dist/`
  automatically. No skipped tests.
- `npm run lint`: exit 0; no errors.
- No CI is configured for this repo (`.github/workflows/` is empty); the
  local suite is the authoritative gate. The remote (`origin` at
  `github.com/Apra-Labs/fleet-e2e-toy.git`) has no workflows to be red.

The fix commit (63823d9) only touches `docs/cli.md` and `feedback.md`, so
the source/test state is unchanged from the prior APPROVED code review
(3173fe5).

## File hygiene

PASS. `git diff --name-only main..HEAD` shows the same ten files justified
in the prior review: `PLAN.md`, `progress.json`, `requirements.md`,
`feedback.md` (sprint tracking); `src/cli.ts`, `src/utils/validation.ts`,
`package.json`, `tests/cli.test.ts`, `tests/validation.test.ts`
(source/tests); `docs/cli.md` (the harvest). No new temp/scratch files,
no tool/harness config, no editor leftovers introduced by the fix commit.

## Re-check of harvest criteria

All four criteria from the prior review now PASS:

- **Captures durable architectural knowledge** -- unchanged from prior PASS.
- **No sprint scaffolding** -- previously FAIL on the `(D3)` token; now PASS
  after its removal. No task IDs, phase markers, TODO/FIXME notes, or
  source-line references remain.
- **Accurate against the implementation** -- unchanged from prior PASS; the
  fix did not alter any factual claim (the precedence list itself is
  untouched, only the parenthetical was stripped).
- **Nothing transient slipped in** -- previously FAIL on the same `(D3)`
  token; now PASS.

## Regressions in earlier work

PASS. No regressions. Source, tests, and `package.json` are byte-identical
to the state APPROVED in 3173fe5. The harvest fix is documentation-only.

---

## Summary

The two items flagged in the prior review (3a2cb9b) are resolved cleanly
in commit 63823d9: the `(D3)` cross-reference is removed and the
speculative shell-script wording is tightened. The doc now stands on its
own without sprint context. Tests remain green (34/34), lint is clean,
working tree is clean, file hygiene is clean, and no regressions were
introduced.

Verdict: APPROVED.
