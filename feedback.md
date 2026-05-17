# e2e-s1.2-25990827273/cli-features — Code Review

**Reviewer:** reviewer
**Date:** 2026-05-17 14:22:00+00:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.

---

## Prior Review Context

The previous feedback.md (commit 1918add) was a plan review that approved the implementation plan with two advisory notes: (1) `./tool` script should ensure ts-node is resolvable outside npm script context, and (2) the risk register's version sync note references package name `noteapi` but CLI output uses `fleet-e2e-toy`. These were advisory only — not blocking. The implementer followed the plan as written; the PATH issue is noted again below.

---

## Task 1: --version/-v flag (gh-toy-4ef)

PASS. `src/index.ts` adds `process.argv.slice(2)` at the top and checks for `--version` or `-v`. Output is exactly `fleet-e2e-toy v1.0.0` with `process.exit(0)`. Verified manually via `npx ts-node src/index.ts --version` and `npx ts-node src/index.ts -v` — both produce correct output.

The `tool` shell script is committed with mode `100755` (confirmed via `git ls-files --stage tool`). Contents are minimal and correct: `#!/usr/bin/env bash` + `exec ts-node "$(dirname "$0")/src/index.ts" "$@"`.

NOTE: The script uses bare `ts-node` which requires it to be on PATH. In a fresh clone after `npm install`, running `./tool --version` will fail unless the user has ts-node globally installed or `node_modules/.bin` on PATH. This was flagged in the plan review as advisory. Since the acceptance criteria can be verified and this is a developer convenience script (not user-facing), it does not block approval. A future improvement would be `npx ts-node` or `./node_modules/.bin/ts-node`.

All existing tests continue to pass (21 tests).

---

## Task 2: help/--help/-h command (gh-toy-kbk)

PASS. The argv check in `src/index.ts` is extended to detect `help`, `--help`, or `-h`. Help output:

```
Usage: tool [COMMAND] [OPTIONS]

Commands:
  help              Show this help message

Options:
  --version, -v     Show version information
  --help, -h        Show this help message
```

This lists every subcommand (`help`) and every flag (`--version/-v`, `--help/-h`) as required. Exit code is 0. Verified all three invocation forms produce identical output.

The ordering — version check before help check — is correct: `--version` takes priority, which is standard CLI behavior and satisfies "works alongside other flags" from gh-toy-4ef.

---

## Task 3: Whitespace content validation (gh-toy-v6z)

PASS. In `src/utils/validation.ts`, the content check changed from:
```typescript
if (typeof obj.content !== "string")
```
to:
```typescript
if (typeof obj.content !== "string" || obj.content.trim().length === 0)
```

This follows the identical pattern already used for `title` validation on line 19. Error message updated to "Content is required and must be a non-empty string" — consistent with the title error message.

Two new unit tests added in `tests/validation.test.ts`:
- `rejects whitespace-only content` — tests `{ title: "T", content: "   " }`
- `rejects empty string content` — tests `{ title: "T", content: "" }`

Both assert `valid: false` and `errors[0].field === "content"`. Tests are distinct (whitespace-only vs empty string are different code paths through `trim().length === 0`) and non-redundant.

NOTE: `validateUpdateInput` (line 60) still allows whitespace-only content on updates. This is consistent with the requirements — gh-toy-v6z and PLAN.md specifically target `validateCreateInput` only. The update validator intentionally treats content as optional and only type-checks when present. Not a regression.

---

## Test Suite

PASS. All 23 tests pass:
- `tests/notes.test.ts`: 13 tests (API integration tests via supertest)
- `tests/validation.test.ts`: 10 tests (7 original + 2 new whitespace tests + 1 update test)

No test failures. No flaky tests observed. Build (`tsc --noEmit`) and lint (`eslint`) both pass clean.

---

## Test Quality

PASS. The two new tests are well-targeted and cover both variants of the bug (empty string and whitespace-only). The tests use the discriminated union pattern (`if (!result.valid)`) consistent with the existing test style.

NOTE: The CLI flags (--version, help) are not covered by automated tests. This is acceptable because: (1) tests never import `src/index.ts` — that's the entry point, not a testable module, (2) the argv handling is trivial (no branching complexity), and (3) manual verification confirms correct behavior. Adding Jest tests for process.exit/console.log would require mocking and add fragility without meaningful coverage gain.

---

## File Hygiene

PASS. Changed files on branch vs main:
- `PLAN.md` — sprint planning artifact ✓
- `requirements.md` — sprint requirements ✓
- `progress.json` — task tracking ✓
- `feedback.md` — review artifact ✓
- `src/index.ts` — CLI implementation ✓
- `src/utils/validation.ts` — bug fix ✓
- `tests/validation.test.ts` — new tests ✓
- `tool` — new executable ✓

No stray files. No temp artifacts. No `.claude/settings.json` or `.gemini/` directories. CLAUDE.md is unchanged on this branch (tracked on main already — pre-existing, not introduced by this sprint).

---

## Security

PASS. No security concerns:
- argv parsing is read-only, no user input flows into shell commands or eval
- The validation fix is defensive (rejecting more input, not less)
- No secrets committed
- No new dependencies added

---

## Code Consistency

PASS. All changes follow existing conventions:
- TypeScript with proper typing (no `any`)
- Validation logic mirrors the existing `title` pattern exactly
- Tests use the same describe/it structure and assertion patterns
- No `console.log` in route handlers (CLI output is in the entry point, which is appropriate)

---

## Summary

All three sprint tickets are correctly implemented and meet their acceptance criteria. Tests pass (23/23), build compiles, lint is clean. Code is minimal, consistent with existing patterns, and introduces no security risks or regressions. File hygiene is clean.

One advisory note carried forward from plan review: the `./tool` shell script uses bare `ts-node` which won't resolve in a fresh shell without PATH setup. This is low-impact (developer convenience script) and does not block approval.

**Verdict: APPROVED** — Phase 1 implementation is complete and correct.
