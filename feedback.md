# Phase 1 + 2 Review Feedback

**Verdict: APPROVED**

## Build / Lint / Test

- `npm run build`: PASS (no TypeScript errors)
- `npm run lint`: PASS (no ESLint errors)
- `npm test`: PASS (21 tests, 0 failures — all pre-existing notes and validation tests green; no cli.test.ts yet, Phase 4 pending)

## Phase 1 Findings Addressed

The Phase 1 review flagged no blocking issues and returned APPROVED. Phase 2 builds correctly on top of it:

- The `void out` lint suppression noted in Phase 1 is now gone — `out` is actively used in Phase 2 command handlers, so no workaround is needed.
- All Phase 1 structural contracts (exported `run`, `parseArgs`, `CliIO`, `CliError`, entry-point wrapper) remain intact and are correctly extended by Phase 2.

## Phase 2 Acceptance Criteria Checklist

### T2.1 — `create` command (src/cli.ts lines 172–212)

- Reads `--title`, `--content`, `--tags` from `parsed.flags`: PASS
- Tag parsing: `tagsRaw.split(",").map(s => s.trim()).filter(Boolean)` per D4: PASS
- CLI-side guard for `--content` present but empty string (per PLAN self-critique note): PASS (lines 181–184)
- Passes `{ title, content, tags }` to `validateCreateInput`: PASS
- On validation failure: each error printed as `Error: <field>: <message>\n` to stderr, returns 1: PASS
- On success: builds Note with `uuidv4()` id, `createdAt = updatedAt = new Date().toISOString()`, calls `noteStore.create`, prints indented JSON to stdout, returns 0: PASS

### T2.2 — `list` command (src/cli.ts lines 214–232)

- Starts with `noteStore.getAll()`: PASS
- `--tag` filter: exact match via `n.tags.includes(tag)`: PASS
- `--search` filter: case-insensitive substring on title and content (implemented locally, not via Express handler): PASS
- Prints indented JSON array to stdout, returns 0: PASS

### T2.3 — `get`, `update`, `delete` commands (src/cli.ts lines 234–311)

**get:**
- Missing positional id → `Error: Missing required argument: id\n` to stderr, exit 1: PASS
- `noteStore.getById(id)` returns undefined → `Error: Note not found: <id>\n` to stderr, exit 1: PASS
- Found → indented JSON to stdout, exit 0: PASS

**update:**
- Missing positional id → error to stderr, exit 1: PASS
- Partial-update payload built using `"key" in parsed.flags` (only flags explicitly provided are included): PASS — this correctly preserves partial-update semantics
- `validateUpdateInput(payload)` called; on failure errors to stderr, exit 1: PASS
- `noteStore.update(id, data)` returns undefined → not-found error to stderr, exit 1: PASS
- On success → updated note JSON to stdout, exit 0: PASS

**delete:**
- Missing positional id → error to stderr, exit 1: PASS
- `noteStore.delete(id)` returns false → not-found error to stderr, exit 1: PASS
- On success → `{"deleted":true}\n` to stdout, exit 0: PASS (compact form, no indent — matches D8)

### Cross-cutting Concerns

- All errors go to `err()` (stderr path), never to `out()` (stdout): PASS
- Exit code 1 on all error paths, 0 on success: PASS
- No `any` types in `src/cli.ts`: PASS (`grep "any"` returns no matches; `Record<string, unknown>` used correctly for update payload)
- No new npm dependencies: PASS (`package.json` diff adds only the `cli` script line)
- `run()` does not call `process.exit`: PASS

## File Hygiene

All modified/added files are justifiable against sprint tasks:
- `src/cli.ts`: Phase 1 + 2 CLI implementation
- `package.json`: Added `cli` script (T1.3)
- `PLAN.md`, `requirements.md`, `progress.json`: Sprint planning/tracking artifacts
- `feedback.md`: Review output (this file)

## Awareness Notes (non-blocking)

- D7 specifies that "Unknown command" should print root help on stdout in addition to the stderr error. Current code (line 309) only emits the stderr error. This is expected incomplete work — the help text is a Phase 3 deliverable. Not a Phase 2 defect.
- `noteStore.update` does not bump `updatedAt`. This is a known existing issue, explicitly noted as out-of-scope in PLAN.md (D3). Not flagged.

## Phase 2 Summary

All five CRUD commands are correctly wired to `noteStore`, validate inputs per the plan, route errors to stderr, and exit with the correct codes. The partial-update semantics for `update` are correctly implemented. No regressions in pre-existing tests. Phase 3 (help + version) and Phase 4 (test suite) remain pending as expected.
