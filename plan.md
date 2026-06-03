# Implementation Plan: CLI Features P1

## Source Issues
- gh-toy-4ef: Add --version flag to CLI
- gh-toy-v6z: Add input validation for empty or blank strings
- gh-toy-kbk: Implement a help command

---

## Verified Assumptions

1. **resolveJsonModule** — `tsconfig.json` has `"resolveJsonModule": true` and `"esModuleInterop": true`. Importing `package.json` directly is safe.
2. **No CLI parsing library** — `package.json` lists no commander/yargs/meow. `process.argv` parsing inline is the correct approach.
3. **`validateCreateInput` does not reject blank content** — confirmed in `src/utils/validation.ts` line 23: only checks `typeof obj.content !== "string"`, not `.trim().length`. Extension is additive.
4. **Query params `tag` and `q` are passed through unchecked** — confirmed in `src/api/notes.ts` lines 17-28; truthy check on raw string value does not strip whitespace.
5. **Test file paths** — `tests/notes.test.ts` and `tests/validation.test.ts` already exist. New tests go into these exact files.

## Decisions Resolved from Requirements

- **Flag priority:** If both `--help` and `--version` are passed, `--help` wins (runs first in argv scan).
- **`help` positional subcommand:** `argv[2] === "help"` treated identically to `--help`.
- **Blank vs empty content:** Both `""` and `"   "` fail validation because `"".trim().length === 0`. A single `content.trim().length === 0` check covers both; no separate "empty" path needed.
- **Test strategy for CLI:** Unit-test `runCli()` with synthetic argv arrays (fast). One `spawnSync` smoke test per acceptance criterion with `jest.setTimeout(20000)` to handle ts-node cold-start on Windows.
- **`validateUpdateInput` blank content:** Also tightened symmetrically — if `content` is provided it must not be blank, consistent with create.

---

## Phase 1 — CLI Flag Handling (--version and --help)

### Task 1 — Create `src/cli.ts` with CLI flag logic

**File:** `src/cli.ts` (new file)

**What it does:**
- Exports `runCli(argv: string[]): { handled: boolean; exitCode: number }`.
- Imports `name` and `version` from `../../package.json` (resolveJsonModule is confirmed enabled).
- Argv scan (checks `argv.slice(2)`):
  - If any element is `"--help"` or `"-h"`, OR if `argv[2] === "help"` (positional subcommand) → print help text to stdout, return `{ handled: true, exitCode: 0 }`.
  - Else if any element is `"--version"` or `"-v"` → print `noteapi v<version>` to stdout (version from package.json), return `{ handled: true, exitCode: 0 }`.
  - Otherwise → return `{ handled: false, exitCode: 0 }`.
- Help text printed is exactly:
  ```
  noteapi — REST API for managing notes with tags and search

  Usage:
    ts-node src/index.ts [options]

  Options:
    --help, -h       Show this help message and exit
    --version, -v    Print version and exit

  Environment:
    PORT             Port to listen on (default: 3000)
  ```

**Done criteria:**
- File compiles without TypeScript errors (`tsc --noEmit` passes).
- `runCli(["node", "index.ts", "--help"]).handled === true`.
- `runCli(["node", "index.ts", "-h"]).handled === true`.
- `runCli(["node", "index.ts", "help"]).handled === true`.
- `runCli(["node", "index.ts", "--version"]).handled === true`.
- `runCli(["node", "index.ts", "-v"]).handled === true`.
- `runCli(["node", "index.ts"]).handled === false`.

**Blockers:** None. This is the foundation task.

**Model:** claude-sonnet-4-6

---

### Task 2 — Wire `src/index.ts` to call `runCli` before server start

**File:** `src/index.ts` (modify)

**What it does:**
- Import `runCli` from `./cli`.
- Before `app.listen(...)`, call `const cli = runCli(process.argv)`.
- If `cli.handled` is true, call `process.exit(cli.exitCode)`.
- Server bind only happens when no CLI flag was matched.
- Final `src/index.ts` structure:
  ```ts
  import app from "./app";
  import { runCli } from "./cli";

  const cli = runCli(process.argv);
  if (cli.handled) {
    process.exit(cli.exitCode);
  }

  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    console.log(`NoteAPI running on http://localhost:${PORT}`);
  });
  ```

**Done criteria:**
- `src/index.ts` compiles without errors.
- The `app.listen(...)` line is only reached when `runCli` returns `handled: false`.
- No new npm dependencies introduced.

**Blockers:** Task 1 (provides `runCli`).

**Model:** claude-haiku-4-5-20251001

---

### Task 3 — Add CLI tests in `tests/cli.test.ts`

**File:** `tests/cli.test.ts` (new file)

**What it does:**

Unit tests for `runCli` (fast, synthetic argv, no process spawn):
- `runCli(["node","s","--help"]).handled` is `true` and `exitCode` is 0.
- `runCli(["node","s","-h"]).handled` is `true` and `exitCode` is 0.
- `runCli(["node","s","help"]).handled` is `true` and `exitCode` is 0 (positional subcommand).
- `runCli(["node","s","--version"]).handled` is `true` and `exitCode` is 0.
- `runCli(["node","s","-v"]).handled` is `true` and `exitCode` is 0.
- `runCli(["node","s"]).handled` is `false`.
- When both `--help` and `--version` present, `handled` is `true` (help wins; no assertion on which message).

Stdout content tests (spy on `process.stdout.write` or `console.log`):
- `--version` output includes `noteapi v1.0.0`.
- `--help` output includes `--help`, `--version`, and `PORT`.

Smoke tests (spawnSync, each in a describe block with `jest.setTimeout(20000)`):
- `ts-node src/index.ts --version` exits code 0 and stdout equals `noteapi v1.0.0\n`.
- `ts-node src/index.ts -v` exits code 0 and stdout equals `noteapi v1.0.0\n`.
- `ts-node src/index.ts --help` exits code 0 and stdout includes `noteapi`, `--help`, `--version`, `PORT`.
- `ts-node src/index.ts -h` exits code 0 and stdout includes `noteapi`, `--help`, `--version`, `PORT`.
- spawnSync called with `cwd` set to the repo root so `src/index.ts` resolves correctly.

**Done criteria:**
- `npm test` passes with all new tests green.
- No test relies on the default 5s Jest timeout (smoke tests use explicit `20000` ms).

**Blockers:** Task 1 (imports `runCli`), Task 2 (required for spawnSync smoke tests to exit without hanging).

**Model:** claude-sonnet-4-6

---

**VERIFY Phase 1:** `npm test` passes all CLI tests. `ts-node src/index.ts --version` prints `noteapi v1.0.0` and exits 0. `ts-node src/index.ts --help` prints usage block and exits 0. Server still starts normally with no flags.

---

## Phase 2 — Input Validation for Blank Strings

### Task 4 — Extend `src/utils/validation.ts` to reject blank content

**File:** `src/utils/validation.ts` (modify)

**What it does:**

In `validateCreateInput`, change the content check from:
```ts
if (typeof obj.content !== "string") {
  errors.push({ field: "content", message: "Content must be a string" });
}
```
To:
```ts
if (typeof obj.content !== "string" || obj.content.trim().length === 0) {
  errors.push({ field: "content", message: "Content must not be blank" });
}
```

In `validateUpdateInput`, change the content check from:
```ts
if (obj.content !== undefined && typeof obj.content !== "string") {
  errors.push({ field: "content", message: "Content must be a string" });
}
```
To:
```ts
if (obj.content !== undefined && (typeof obj.content !== "string" || obj.content.trim().length === 0)) {
  errors.push({ field: "content", message: "Content must not be blank" });
}
```

Note: The `data.content` assignment in `validateUpdateInput` is already gated by `obj.content !== undefined` so it remains unchanged.

**Done criteria:**
- `validateCreateInput({ title: "t", content: "   " })` returns `{ valid: false, errors: [{ field: "content", message: "Content must not be blank" }] }`.
- `validateCreateInput({ title: "t", content: "" })` returns invalid with `field: "content"`.
- `validateCreateInput({ title: "t", content: "real text" })` returns valid.
- `validateUpdateInput({ content: "   " })` returns invalid.
- `validateUpdateInput({ content: "ok" })` returns valid.
- `validateUpdateInput({})` returns valid (no-op update unchanged).

**Blockers:** None.

**Model:** claude-haiku-4-5-20251001

---

### Task 5 — Trim blank query params in `src/api/notes.ts`

**File:** `src/api/notes.ts` (modify)

**What it does:**
In the `GET /` handler, replace the raw query param reads with trimmed versions:
```ts
// Before:
const tag = req.query.tag as string | undefined;
const q = req.query.q as string | undefined;

// After:
const tag = ((req.query.tag as string | undefined) ?? "").trim() || undefined;
const q = ((req.query.q as string | undefined) ?? "").trim() || undefined;
```
This ensures `tag=%20%20` and `q=%20%20` evaluate to `undefined` (no filtering applied), exactly as if the params were not passed. The existing `if (tag)` and `if (q)` filtering logic below remains unchanged.

**Done criteria:**
- `GET /api/notes?tag=%20` returns all notes (no tag filter applied).
- `GET /api/notes?q=%20%20` returns all notes (no search filter applied).
- `GET /api/notes?tag=work` still filters by tag correctly.
- `GET /api/notes?q=meeting` still filters by search correctly.

**Blockers:** None.

**Model:** claude-haiku-4-5-20251001

---

### Task 6 — Add blank-input tests to `tests/validation.test.ts` and `tests/notes.test.ts`

**Files:** `tests/validation.test.ts` (extend), `tests/notes.test.ts` (extend)

**What it does:**

In `tests/validation.test.ts`, add to the existing `validateCreateInput` describe block:
- `it("rejects whitespace-only content")` — input `{ title: "t", content: "   " }`, expects `valid: false`, `errors[0].field === "content"`, `errors[0].message === "Content must not be blank"`.
- `it("rejects empty-string content")` — input `{ title: "t", content: "" }`, expects `valid: false`, `errors[0].field === "content"`.

Add to the existing `validateUpdateInput` describe block:
- `it("rejects whitespace-only content on update")` — input `{ content: "   " }`, expects `valid: false`.
- `it("accepts update with non-blank content")` — input `{ content: "valid" }`, expects `valid: true`.

In `tests/notes.test.ts`, add to the existing `POST /api/notes` describe block:
- `it("returns 400 for whitespace-only content")` — POST `{ title: "t", content: "   " }`, expect status 400, `body.errors[0].field === "content"`.

Add a new `GET /api/notes — blank query params` describe block:
- `it("returns all notes when q is whitespace-only")` — create 2 notes, GET `/api/notes?q=%20%20`, expect `res.body` has length 2.
- `it("returns all notes when tag is whitespace-only")` — create 2 notes (each with different tags), GET `/api/notes?tag=%20`, expect `res.body` has length 2.

**Done criteria:**
- `npm test` passes all tests (new and existing).
- No existing tests are broken.

**Blockers:** Task 4 (blank content validation in `validateCreateInput`/`validateUpdateInput`), Task 5 (blank query param trimming in `notes.ts`).

**Model:** claude-haiku-4-5-20251001

---

**VERIFY Phase 2:** `npm test` passes all tests. POST with whitespace-only content returns 400 with `field: "content"`. Blank `q` and `tag` query params return the full note list.

---

## Risk Register

| Risk | Mitigation |
|------|-----------|
| ts-node slow cold start makes spawnSync tests flaky on Windows | Explicit 20000ms timeout on all spawnSync smoke tests |
| TypeScript may infer `any` for JSON import field `version` | Cast explicitly: `(pkg as { name: string; version: string }).version` |
| Jest `testMatch` glob may not pick up `tests/cli.test.ts` | Existing config picks up `tests/notes.test.ts` and `tests/validation.test.ts` via same pattern; `tests/cli.test.ts` follows the same convention |

---

## Task Summary Table

| # | Task | File(s) | Phase | Blockers | Model |
|---|------|---------|-------|----------|-------|
| 1 | Create `src/cli.ts` with `runCli` | `src/cli.ts` (new) | 1 | — | claude-sonnet-4-6 |
| 2 | Wire index.ts to call runCli | `src/index.ts` | 1 | Task 1 | claude-haiku-4-5-20251001 |
| 3 | Add CLI tests | `tests/cli.test.ts` (new) | 1 | Tasks 1, 2 | claude-sonnet-4-6 |
| 4 | Extend validation.ts for blank content | `src/utils/validation.ts` | 2 | — | claude-haiku-4-5-20251001 |
| 5 | Trim blank query params in notes.ts | `src/api/notes.ts` | 2 | — | claude-haiku-4-5-20251001 |
| 6 | Add blank-input tests | `tests/validation.test.ts`, `tests/notes.test.ts` | 2 | Tasks 4, 5 | claude-haiku-4-5-20251001 |
