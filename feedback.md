# pmlite-e2e-s1 -- Documentation Harvest Review (docs/cli.md)

**Reviewer:** pm-reviewer
**Date:** 2026-06-14 16:30:00+00:00
**Verdict:** CHANGES NEEDED

> See the recent git history of this file to understand the context of this
> review. Prior commits were the Phase 1 code review (APPROVED, 3173fe5) and
> two earlier plan reviews (34f021f -> CHANGES NEEDED, aba78fe -> APPROVED).
> The code itself remains APPROVED from the prior review; this review is
> scoped to the new documentation harvest in `docs/cli.md` (commit 3944b97).

---

## Working tree, gates, and CI

PASS. `git status --porcelain` is empty (clean tree). Re-ran the gates against
the committed state:
- `npm test`: exit 0; 34/34 tests pass across `tests/validation.test.ts`,
  `tests/cli.test.ts`, and `tests/notes.test.ts`. `pretest` rebuilt `dist/`
  automatically.
- `npm run lint`: exit 0; no errors.
- No CI configured (`.github/workflows/` is empty); local suite is the
  authoritative gate. No CI signal to be red.

The harvest commit (3944b97) touches only `docs/cli.md`, so the test/lint
state is unchanged from the prior approved review.

## File hygiene

PASS. `git diff --name-only main..HEAD` shows ten files since base, all
justified: `PLAN.md`, `progress.json`, `requirements.md`, `feedback.md`
(sprint tracking); `src/cli.ts`, `src/utils/validation.ts`, `package.json`,
`tests/cli.test.ts`, `tests/validation.test.ts` (source/tests); `docs/cli.md`
(this harvest). No temp/scratch files, no tool config, no editor/shell
leftovers.

## Criterion 1 -- Captures durable architectural knowledge

PASS. The document covers entrypoint location and build wiring, argument
precedence order, the validation contract (signature, predicate, error
shape), help text content, testing strategy, and the design decisions that
shaped the CLI (no external framework, synchronous-only, hardcoded version,
Node built-ins only). Each section answers a "what is the invariant here?"
question rather than "what did we do during this sprint?". Future readers
extending the CLI will be able to use this as a reference without sprint
context.

## Criterion 2 -- No task lists, code-line references, sprint scaffolding, or debug notes

FAIL. One stray sprint-scaffolding token leaked through.

- `docs/cli.md:10` -- "Flags are resolved in strict order with immediate exit
  on first match **(D3)**:" -- the `(D3)` parenthetical is a direct
  cross-reference into `PLAN.md`'s "Decisions resolved up-front" numbering.
  A reader who does not have PLAN.md open cannot resolve "D3". This is the
  textbook definition of sprint scaffolding leaking into a durable doc.
  Strip the `(D3)` parenthetical; the surrounding sentence reads cleanly
  without it.

Beyond that one token: there are no task IDs (T1.x), no phase markers, no
TODO/FIXME notes, no debug breadcrumbs, and no line-number references into
source files. The rest of the doc is clean.

NOTE (not blocking): `docs/cli.md:7` -- "Shebang: `#!/usr/bin/env node` for
future shell script compatibility" -- mildly speculative wording, but it
explains an artifact actually present in `src/cli.ts:1`, so I'd let it stand.
The doer may tighten it to "for direct shell invocation" if they wish, but
this is not a CHANGES-NEEDED blocker.

## Criterion 3 -- Accurate against the actual implementation

PASS on every claim I cross-checked.

- Entrypoint `src/cli.ts` -> `dist/cli.js`: matches `tsconfig.json` (outDir
  `./dist`, rootDir `./src`) and the shebang on `src/cli.ts:1`.
- Argument precedence (version -> help -> positional validation -> no-arg
  fallback to help): matches `src/cli.ts:16-40` step for step.
- Version string `fleet-e2e-toy v1.0.0`: matches `src/cli.ts:4` and
  `tests/cli.test.ts:14`.
- `validateNonBlank(value: string, argName: string): void`: matches
  `src/utils/validation.ts:80-84` exactly, including the predicate
  (`typeof value !== "string" || value.trim().length === 0`) and the error
  message `Error: <argName> must not be empty or blank`.
- CLI catches at top level, writes to `process.stderr`, exits 1: matches
  `src/cli.ts:33-37`.
- Help text content (Usage line, Commands/Flags blocks): matches
  `src/cli.ts:5-14` verbatim.
- Testing strategy (`spawnSync(process.execPath, [CLI, ...args], { encoding:
  "utf8" })`): matches `tests/cli.test.ts:6-8`.
- `pretest` rebuilds `dist/cli.js`: matches `package.json:10`.
- "No external CLI framework": confirmed by `package.json` -- no commander,
  yargs, or minimist in dependencies/devDependencies.
- "Node built-ins only" / "version hardcoded / no package.json lookup":
  confirmed by reading `src/cli.ts` end-to-end.

## Criterion 4 -- Nothing transient slipped in

FAIL on the same item as criterion 2: the `(D3)` token is transient (it is
meaningful only while PLAN.md remains the live sprint plan). Everything else
in the doc is durable. No dates, no sprint IDs, no commit SHAs, no progress
indicators, no "TODO once X lands" notes.

---

## Summary

The harvest is substantively correct and useful: every architectural claim
matches the committed source, and the document is structured around
invariants rather than sprint events. Test gates remain green (34/34) and
file hygiene is clean.

One blocker: the `(D3)` parenthetical on `docs/cli.md:10` is a direct
reference into PLAN.md's decision numbering and is meaningless outside
sprint context. Strip the parenthetical (the surrounding sentence stands on
its own) and re-request review.

Optional polish (non-blocking): consider softening the speculative "for
future shell script compatibility" phrasing on line 7.

Verdict: CHANGES NEEDED.
