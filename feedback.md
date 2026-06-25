# Phase 1-3 Review Feedback

**Verdict: APPROVED**

## Build / Lint / Test

- `npm run build`: PASS (no TypeScript errors)
- `npm run lint`: PASS (no ESLint errors)
- `npm test`: PASS (21 tests, 0 failures — all pre-existing notes and validation tests green; cli.test.ts is Phase 4, not yet present)
- Working tree: clean (git status --porcelain empty)

## Prior Feedback History

- `b0435af` — plan review feedback (plan-level, no code yet)
- `a357575` — Phase 1 review: APPROVED (parser + entry-point skeleton)
- `3e3b56e` — Phase 1+2 review: APPROVED (CRUD commands); noted D7 unknown-command missing root-help as non-blocking, deferred to Phase 3

## Phase 3 Acceptance Criteria Checklist

### Check 1 — `--version` / `-V` reads package.json at runtime (D2 pattern)

`src/cli.ts` line 2: `import { readFileSync } from "node:fs";`
`src/cli.ts` line 3: `import { join } from "node:path";`
`src/cli.ts` line 225: `JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf8")) as { version: string }`

Both `--version` and `-V` short form trigger `parsed.versionRequested` (lines 57-60 and 108-111), which is handled at line 223-228, before command dispatch.

Output: `noteapi/1.0.0\n` — PASS
Exit code: 0 — PASS

### Check 2 — Root `--help` prints Usage text with all 5 commands and Global flags section

`src/cli.ts` lines 206-221: root help text matches D9 exactly, listing all 5 commands (create, list, get, update, delete) with one-line descriptions, plus the Global flags section with `-h, --help` and `-V, --version`.

Also duplicated at lines 366-379 for the no-command default case — consistent.

Output verified by smoke test: PASS
Exit code: 0 — PASS

### Check 3 — Subcommand `--help` shows per-command flags with required/optional markers for all 5 commands

`src/cli.ts` lines 163-202: `helpTexts` map covers all 5 subcommands:
- `create` (lines 165-171): `--title (required)`, `--content (required)`, `--tags (optional)` — PASS
- `list` (lines 172-177): `--tag (optional)`, `--search (optional)` — PASS
- `get` (lines 178-182): `<id> (required positional)` — PASS
- `update` (lines 183-194): `<id> (required positional)`, `--title/--content/--tags (optional)` — PASS
- `delete` (lines 195-200): `<id> (required positional)` — PASS

All exit code 0 — PASS

### Check 4 — No `process.exit` inside `run` function

`process.exit` appears exactly once in `src/cli.ts` at line 388, inside the `require.main === module` entry-point wrapper only. The `run` function itself (lines 145-385) contains no `process.exit` calls — PASS

### Check 5 — `npm run build`, `npm run lint`, `npm test` all pass

All three pass cleanly as reported above — PASS

## File Hygiene

All modified/added files are justifiable against sprint tasks:
- `src/cli.ts`: Phase 1-3 CLI implementation (parser, CRUD commands, help system, --version)
- `package.json`: Added `cli` script (T1.3), no other changes
- `PLAN.md`, `requirements.md`, `progress.json`: Sprint planning/tracking artifacts
- `feedback.md`: Review output (this file)

No temp files, unrelated scripts, or tool config slipped in.

## Awareness Notes (non-blocking)

**D7 unknown-command root-help omission (carry-forward from Phase 2 review):**
D7 specifies that an unknown command should print root help on stdout in addition to the stderr error. Current code (`src/cli.ts` line 382-383) only emits `Error: Unknown command: <name>\n` to stderr. T3.2's explicit scope was "no command OR --help/-h with no command" — the unknown-command path was not in scope for Phase 3. This remains a gap against D7 and should be addressed in Phase 4 or a follow-up task. Not blocking for Phases 1-3.

**`noteStore.update` does not bump `updatedAt`:** Known existing issue, explicitly out-of-scope per PLAN.md D3.

## Phase 3 Summary

All five Phase 3 acceptance criteria are met. The `--version`/`-V` flag correctly reads `package.json` at runtime using the D2 pattern. Root `--help` prints the exact D9 text with all 5 commands and global flags. All 5 subcommand `--help` outputs include required/optional markers. No `process.exit` inside `run`. Build, lint, and 21 pre-existing tests all pass with no regressions.
