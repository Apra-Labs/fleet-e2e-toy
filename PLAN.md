# PLAN — Sprint s1.1: Three P1 Issues (NoteAPI)

Implements the three P1 issues in `requirements.md`:

- **gh-toy-4ef** — `GET /version` endpoint
- **gh-toy-v6z** — blank-string input validation hardening
- **gh-toy-kbk** — `GET /api/help` endpoint listing all routes

## Cross-cutting constraints (apply to every task)

- Use Jest via `./node_modules/.bin/jest --verbose` (NEVER `npm test`).
- Tests use `supertest` against the Express app exported from `src/app.ts` (do not start a server).
- Error responses follow the project convention: `{ error: "..." }` for single errors, `{ errors: [...] }` for validation. Always set explicit HTTP status codes.
- All validation must live in `src/utils/validation.ts`; never inline in route handlers.
- TypeScript `rootDir` is `./src`. Do NOT import `package.json` directly (it would escape rootDir). Read it at runtime with `fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8")` then `JSON.parse`. This works in both `ts-node` (where `__dirname` resolves to the `src/...` directory) and compiled `dist/` (where `dist/...` -> `..` -> `..` -> project root). Cache the parsed result at module load.
- Endpoint mount decisions (locked):
  - `/version` mounted directly on the app in `src/app.ts` (next to `/health`), NOT under `/api`.
  - `/api/help` mounted under `/api` (matches the existing `/api/notes` family).
- Every work task ends by running `./node_modules/.bin/jest --verbose` locally and confirming all tests pass before commit.
- Each task produces exactly one commit (except Task 1.1 which produces none — see below).

## Phases

---

### Phase 1 — Setup

Single task to install dependencies so `./node_modules/.bin/jest` exists for every subsequent task.

#### Task 1.1: Install npm dependencies

- **Model:** claude-haiku-4-5-20251001
- **Files:** none committed (creates `node_modules/` only; `package-lock.json` already present).
- **Action:** Run `npm install` in the repo root.
- **Done when:**
  - `./node_modules/.bin/jest` exists.
  - `./node_modules/.bin/jest --verbose` runs the existing suite green (baseline ~21 tests, all pass).
- **Commit:** none — `node_modules/` is gitignored. If `package-lock.json` changes unexpectedly, do NOT commit it; report it in the dispatch summary.
- **Blockers:** network access to npm registry.

---

### Phase 2 — Validation hardening (gh-toy-v6z)

One cohesive change to `src/utils/validation.ts` plus matching test additions. Done first because it is the highest-risk task (modifies existing logic that the existing test suite depends on) — front-loading it surfaces breakage before new endpoints are layered on.

#### Task 2.1: Reject blank `content`, blank `tags[]` entries in create and update validators; add unit tests

- **Model:** claude-sonnet-4-6
- **Files:**
  - Edit `src/utils/validation.ts`
  - Edit `tests/validation.test.ts`
- **Behaviour to implement (exact spec):**
  1. In `validateCreateInput`:
     - When `obj.content` is a string but `obj.content.trim().length === 0`, push an error: `{ field: "content", message: "Content must be a non-empty string" }`. This check runs AFTER the existing `typeof obj.content !== "string"` check (so type errors still win and the existing wording is preserved).
     - When `obj.tags` is a valid array of strings, additionally reject if any element satisfies `t.trim().length === 0`. Push: `{ field: "tags", message: "Tags must not contain empty or whitespace-only strings" }`. This check runs AFTER the existing `Array.isArray && every(typeof === "string")` check (so the existing test `tags: [1,2]` still surfaces the same type error first, preserving `result.errors[0].field === "tags"`).
  2. In `validateUpdateInput`:
     - Apply the same blank-content rule, but only when `obj.content !== undefined`. Same error object as above.
     - Apply the same blank-tag rule, but only when `obj.tags !== undefined`.
     - The existing title check already rejects whitespace-only titles — leave it unchanged.
  3. Do NOT change error ordering for inputs that already fail an existing check. Specifically: input `{title:"Note", content:"Body", tags:[1,2]}` must still produce `errors[0].field === "tags"` with the existing "must be an array of strings" message (verified against `tests/validation.test.ts` line 41-44).
- **New test cases to add in `tests/validation.test.ts`** (append to the existing `describe` blocks; do not delete or modify existing tests):
  - Under `describe("validateCreateInput")`:
    - `it("rejects whitespace-only title")` — input `{title:"   ", content:"Body"}`, expects `valid:false` and a `title`-field error.
    - `it("rejects whitespace-only content")` — input `{title:"Note", content:"   "}`, expects `valid:false` and a `content`-field error.
    - `it("rejects tag that is whitespace-only")` — input `{title:"Note", content:"Body", tags:["ok", "  "]}`, expects `valid:false` and a `tags`-field error.
  - Under `describe("validateUpdateInput")`:
    - `it("rejects whitespace-only content on update")` — input `{content:"   "}`, expects `valid:false`.
    - `it("rejects whitespace-only tag on update")` — input `{tags:["  "]}`, expects `valid:false`.
- **Done when:**
  - `./node_modules/.bin/jest --verbose tests/validation.test.ts` is green (all original validation tests + 5 new tests pass).
  - `./node_modules/.bin/jest --verbose` (full suite) is green — confirms `tests/notes.test.ts` did not regress. In particular, the existing `POST /api/notes` test on line 86 of `tests/notes.test.ts` (input `{content:"No title"}`) must still produce HTTP 400 — it will, because missing-title still fires before any new content check.
  - Commit: `fix(validation): reject blank content and blank tag entries (gh-toy-v6z)`.
- **Blockers:** Task 1.1 (needs `./node_modules/.bin/jest`).

---

### Phase 3 — New endpoints (gh-toy-4ef, gh-toy-kbk)

Two endpoint additions in a single doer dispatch (sonnet streak). `/version` must land before `/api/help` because the help response enumerates every route and must include `/version`. Both are reviewable together as one "discoverability" increment.

#### Task 3.1: Add `GET /version` endpoint with test (gh-toy-4ef)

- **Model:** claude-sonnet-4-6
- **Files:**
  - Create `src/api/version.ts` (new) — exports an Express `Router` with a single `GET /` handler.
  - Edit `src/app.ts` — `import versionRouter from "./api/version";` and mount with `app.use("/version", versionRouter);` placed next to the existing `/health` handler. Routing order does not matter for non-overlapping paths.
  - Create `tests/version.test.ts` (new).
- **Implementation details (exact spec):**
  - `src/api/version.ts` reads `package.json` once at module load via:
    ```ts
    import * as fs from "fs";
    import * as path from "path";
    const pkgPath = path.join(__dirname, "..", "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { version: string };
    ```
    Handler returns `res.status(200).json({ version: pkg.version })`.
  - Response shape (locked): `{ "version": "1.0.0" }`. Status 200. Content-Type JSON.
- **Test cases in `tests/version.test.ts`:**
  - `describe("GET /version")` with:
    - `it("returns 200 and the package version")` — assert `res.status === 200`, `res.body.version === "1.0.0"`, and `typeof res.body.version === "string"`.
- **Done when:**
  - `./node_modules/.bin/jest --verbose tests/version.test.ts` is green.
  - `./node_modules/.bin/jest --verbose` full suite still green.
  - Commit: `feat(api): add GET /version endpoint (gh-toy-4ef)`.
- **Blockers:** Task 1.1. The `rootDir` constraint is already handled by reading the file at runtime instead of importing.

#### Task 3.2: Add `GET /api/help` endpoint with test (gh-toy-kbk)

- **Model:** claude-sonnet-4-6
- **Files:**
  - Create `src/api/help.ts` (new) — exports an Express `Router` with a single `GET /` handler.
  - Edit `src/app.ts` — mount with `app.use("/api/help", helpRouter);` next to the existing `/api/notes` mount.
  - Create `tests/help.test.ts` (new).
- **Response shape (locked):** A JSON object `{ endpoints: [...] }` whose `endpoints` array contains one entry per route. Each entry has the shape:
  ```ts
  { method: string; path: string; description: string }
  ```
  Hand-maintained list (no Express introspection — keeps the contract explicit and the test deterministic). The handler returns `res.status(200).json({ endpoints: [...] })` containing EXACTLY these 8 entries:
  - `{ method: "GET", path: "/version", description: "Return the API version string." }`
  - `{ method: "GET", path: "/health", description: "Health check; returns { status: 'ok' }." }`
  - `{ method: "GET", path: "/api/help", description: "List all available endpoints." }`
  - `{ method: "GET", path: "/api/notes", description: "List notes; supports ?tag= and ?q= filters." }`
  - `{ method: "GET", path: "/api/notes/:id", description: "Get a single note by ID." }`
  - `{ method: "POST", path: "/api/notes", description: "Create a note. Body: { title, content, tags? }." }`
  - `{ method: "PUT", path: "/api/notes/:id", description: "Update a note. Body: partial { title?, content?, tags? }." }`
  - `{ method: "DELETE", path: "/api/notes/:id", description: "Delete a note by ID." }`
- **Test cases in `tests/help.test.ts`:**
  - `describe("GET /api/help")` with:
    - `it("returns 200 with an endpoints array of length 8")` — assert `res.status === 200`, `Array.isArray(res.body.endpoints)`, `res.body.endpoints.length === 8`.
    - `it("includes every existing route")` — iterate the expected `{method, path}` pairs (the 8 above) and for each assert `res.body.endpoints.some(e => e.method === M && e.path === P)`. Use a single `it` with a loop or `test.each`, NOT eight separate `it` blocks.
    - `it("every entry has non-empty method, path, and description strings")` — for every entry, all three fields must be strings of length > 0.
- **Done when:**
  - `./node_modules/.bin/jest --verbose tests/help.test.ts` is green.
  - `./node_modules/.bin/jest --verbose` full suite still green.
  - Commit: `feat(api): add GET /api/help endpoint (gh-toy-kbk)`.
- **Blockers:** Task 1.1; Task 3.1 (the help list advertises `/version` — if 3.1 is skipped the help test still passes in isolation but the published contract becomes a lie).

---

### Phase 4 — VERIFY

#### Task 4.1: Full test suite verification

- **Model:** claude-haiku-4-5-20251001
- **Action:** Run `./node_modules/.bin/jest --verbose` from the repo root.
- **Done when:**
  - Exit code 0.
  - Test count is the original 21 baseline plus 5 (Phase 2) + 1 (Phase 3.1) + 3 (Phase 3.2) = 30 tests, all passing.
  - All three issue tags (`gh-toy-4ef`, `gh-toy-v6z`, `gh-toy-kbk`) have at least one corresponding commit on this branch (`pmlite-e2e/s1.1-1780467215566`). Verify with `git log --oneline pmlite-e2e/s1.1-1780467215566`.
- **Commit:** none — verification only.
- **Blockers:** Tasks 1.1, 2.1, 3.1, 3.2.

---

## Dispatch streaks (orchestrator hint)

Ordered for minimum dispatches given dependencies:

1. **Dispatch A (haiku):** Task 1.1
2. **Dispatch B (sonnet):** Task 2.1
3. **Dispatch C (sonnet):** Task 3.1, then Task 3.2 (same model, dependency-adjacent — batched into one dispatch)
4. **Dispatch D (haiku):** Task 4.1

Four dispatches total. Each dispatch's context is bounded to the few files listed in its task(s); the sonnet dispatch C reads at most `src/app.ts`, the two new source files it creates, and the two new test files — well within budget.

## Risk register

- **R1:** `package.json` runtime path resolution under `ts-jest`. Mitigation: tested in Task 3.1's jest run, which executes via `ts-jest` (resolves `__dirname` to `src/api/`, parent-parent to repo root, file present). If this breaks, fallback is `fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8")` — but stick with `__dirname` first; `process.cwd()` is brittle under different test launchers.
- **R2:** Existing validation test ordering. Mitigation: spelled out in Task 2.1 — append new checks after existing ones, so the existing `tags: [1,2]` assertion still passes.
- **R3:** Network unavailable for `npm install`. Mitigation: if Task 1.1 fails, the entire plan is blocked; the doer should report and stop rather than proceed.

## Out of scope (explicit)

- The four `// TODO:` comments at the top of `src/api/notes.ts` (pagination, length validation, duplicate-tag check, `updatedAt` on PUT) are NOT addressed — they are not in `requirements.md` for this sprint.
- No changes to `package.json`, `tsconfig.json`, `jest.config.ts`, or `.gitattributes`.
- No new dependencies.
- No README or other documentation updates.
