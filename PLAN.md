# PLAN — Sprint pmlite-e2e/s1.1-1780465073891

Implements three P1 backlog issues from `requirements.md`, adapted for this REST API project:

- **gh-toy-4ef** (Add `--version` flag) -> `GET /version` endpoint returning version info.
- **gh-toy-v6z** (Empty/blank input validation) -> extend `src/utils/validation.ts` so all note endpoints reject whitespace-only strings, plus blank query params.
- **gh-toy-kbk** (Help command/flag) -> `GET /help` endpoint returning API usage documentation.

Conventions enforced (from `CLAUDE.md` and `.claude/rules/api-conventions.md`):
- All error responses use `{ error: "..." }` or `{ errors: [...] }`.
- Always set explicit HTTP status codes.
- Inline validation is forbidden — must live in `src/utils/validation.ts`.
- No `console.log` or `any`; use `res.status(code).json(...)`.
- Tests use supertest against `src/app.ts` (not a running server).

Repo facts confirmed during exploration:
- `package.json` version is `1.0.0`.
- Existing endpoints: `GET/POST/PUT/DELETE /api/notes`, `GET /health`.
- `validateCreateInput` already rejects empty/whitespace `title`; `validateUpdateInput` rejects empty `title` if provided.
- No existing validation for `q`, `tag`, or path-param `:id` blanks; no rejection of whitespace-only `content` or whitespace-only entries inside the `tags` array.
- `src/app.ts` is the express app under test; tests already import it directly.
- `tsconfig.json` already has `resolveJsonModule: true` and `esModuleInterop: true`, but `rootDir` is `./src` and `include` is `src/**/*`. Importing `../../package.json` would therefore violate `rootDir` (TS6059). Hardcoding the version string in `src/api/meta.ts` is the chosen approach to avoid touching the build config.

---

## Phase 1 — Foundations: shared validation helpers

Goal: introduce small primitives that every later task reuses. This avoids duplicated string-emptiness checks across tasks.

### Task 1.1 — Add `isBlankString` and `validateNonBlankString` helpers
- **Files:** `src/utils/validation.ts` (modify)
- **Description:**
  - Export `export function isBlankString(value: unknown): boolean` — returns `true` when `value` is not a string, or `typeof value === "string"` and `value.trim().length === 0`.
  - Export `export function validateNonBlankString(value: unknown, field: string): ValidationError | null` — returns `{ field, message: "<field> must be a non-empty, non-whitespace string" }` when blank (with `<field>` substituted from the argument), otherwise `null`.
  - Do not change existing function signatures or behavior in this task.
- **Acceptance criteria:**
  - Both helpers are exported.
  - `npm run build` succeeds.
  - Existing tests in `tests/validation.test.ts` still pass.
- **Blockers:** none.
- **Model:** claude-haiku-4-5-20251001

### Task 1.2 — Unit tests for the new validation helpers
- **Files:** `tests/validation.test.ts` (modify)
- **Description:** Add a `describe("isBlankString")` block and a `describe("validateNonBlankString")` block covering:
  - `""`, `"   "`, `"\t\n"` -> blank.
  - `"hello"`, `" hello "` -> not blank.
  - non-string inputs (`null`, `undefined`, `123`, `{}`) -> treated as blank.
  - `validateNonBlankString` returns `null` for valid input and a `ValidationError` whose `field` matches the supplied field name otherwise.
- **Acceptance criteria:** New tests pass under `npm test`.
- **Blockers:** Task 1.1.
- **Model:** claude-haiku-4-5-20251001

---

## Phase 2 — Strengthen note input validation (gh-toy-v6z)

Goal: every note endpoint rejects blank or whitespace-only strings on every relevant field. Implementation lives entirely in `src/utils/validation.ts` and is consumed by `src/api/notes.ts` without inline checks.

### Task 2.1 — Extend `validateCreateInput` and `validateUpdateInput` for blank content and blank tag entries
- **Files:** `src/utils/validation.ts` (modify)
- **Description:**
  - In `validateCreateInput`:
    - Reject when `content` is a string but `content.trim().length === 0` with `{ field: "content", message: "Content must be a non-empty, non-whitespace string" }`. (Title is already covered.)
    - When `tags` is an array of strings, reject if any entry is blank (whitespace-only or empty) with `{ field: "tags", message: "Tags must not contain empty or whitespace-only strings" }`.
    - Trim each tag in the returned `data.tags` array.
  - In `validateUpdateInput`:
    - If `content` is provided, apply the same non-blank rule (whitespace-only rejected).
    - If `tags` is provided, apply the same per-entry non-blank rule and trim entries in the returned data.
  - Use the helpers from Task 1.1 internally — no inline `trim().length === 0` duplication.
  - Preserve all existing error fields and the `valid: true | false` discriminated-union shape.
- **Acceptance criteria:**
  - `validateCreateInput({ title: "x", content: "   " })` returns `{ valid: false, errors: [...] }` with a `content` error.
  - `validateCreateInput({ title: "x", content: "y", tags: ["ok", "  "] })` returns `valid: false` with a `tags` error.
  - `validateCreateInput({ title: "x", content: "y", tags: [" trim-me "] })` returns `valid: true` and `data.tags === ["trim-me"]`.
  - `validateUpdateInput({ content: "" })` and `validateUpdateInput({ content: "   " })` both return `valid: false`.
  - `validateUpdateInput({ tags: ["a", ""] })` returns `valid: false`.
  - Existing unit tests still pass.
- **Blockers:** Task 1.1.
- **Model:** claude-sonnet-4-6

### Task 2.2 — Add list/search query-string and path-param validation helpers
- **Files:** `src/utils/validation.ts` (modify)
- **Description:**
  - Export `validateListQuery(query: Record<string, unknown>): { valid: true; data: { tag?: string; q?: string } } | { valid: false; errors: ValidationError[] }`.
    - If `tag` is present but blank, error `{ field: "tag", message: "tag query parameter must be a non-empty, non-whitespace string" }`.
    - If `q` is present but blank, error `{ field: "q", message: "q query parameter must be a non-empty, non-whitespace string" }`.
    - If present and valid, return trimmed values.
    - If present but not a string (e.g., an array from duplicate keys), error with the same field name.
    - Ignores extra unrelated query params (forward-compatible with future `page`/`limit`).
  - Export `validateIdParam(id: unknown): ValidationError | null`. Returns `{ field: "id", message: "id path parameter must be a non-empty, non-whitespace string" }` when `id` is blank, otherwise `null`. (Note: Express path matching means `/api/notes/` won't reach the handler, but explicit handling keeps the contract clear and protects future routes.)
- **Acceptance criteria:**
  - `validateListQuery({})` -> valid, empty `data`.
  - `validateListQuery({ q: "  " })` -> invalid with `q` error.
  - `validateListQuery({ tag: " work " })` -> valid with `data.tag === "work"`.
  - `validateIdParam("")` and `validateIdParam("   ")` -> returns an error.
  - `npm run build` succeeds.
- **Blockers:** Task 1.1.
- **Model:** claude-sonnet-4-6

### Task 2.3 — Unit tests for the extended validators
- **Files:** `tests/validation.test.ts` (modify)
- **Description:** Add tests covering all new behavior from Tasks 2.1 and 2.2:
  - Blank `content` rejected on create and update.
  - Blank tag entry rejected on create and update.
  - Tag trimming on create and update.
  - `validateListQuery` accepts empty, accepts trimmed values, rejects blank `tag` and `q`, rejects non-string `tag`/`q`.
  - `validateIdParam` accepts a valid id, rejects blank.
- **Acceptance criteria:** All new tests pass; existing tests remain green.
- **Blockers:** Tasks 2.1, 2.2.
- **Model:** claude-sonnet-4-6

### Task 2.4 — Wire `validateListQuery` into `GET /api/notes`
- **Files:** `src/api/notes.ts` (modify)
- **Description:**
  - In the `GET /` handler, call `validateListQuery(req.query as Record<string, unknown>)` first.
  - On invalid, respond `res.status(400).json({ errors: result.errors })` and return.
  - On valid, use `result.data.tag` and `result.data.q` (already trimmed) for filtering. Behavior when neither is present is unchanged.
  - Do not inline any `.trim()` or blank checks in the handler.
- **Acceptance criteria:**
  - `GET /api/notes?q=` returns 400 with an `errors` array containing a `q` error.
  - `GET /api/notes?tag=%20%20` returns 400 with a `tag` error.
  - `GET /api/notes?q=meeting` still filters correctly.
  - `GET /api/notes` (no params) still returns the full list.
- **Blockers:** Task 2.2.
- **Model:** claude-sonnet-4-6

### Task 2.5 — Integration tests for blank-string rejection across note endpoints
- **Files:** `tests/notes.test.ts` (modify)
- **Description:** Add cases:
  - `POST /api/notes` with `{ title: "   ", content: "x" }` -> 400, body has `errors` with a `title` field.
  - `POST /api/notes` with `{ title: "x", content: "   " }` -> 400 with `content` error.
  - `POST /api/notes` with `{ title: "x", content: "y", tags: ["ok", "  "] }` -> 400 with `tags` error.
  - `POST /api/notes` with `{ title: "x", content: "y", tags: [" trim "] }` -> 201 and stored tag equals `"trim"`.
  - `PUT /api/notes/:id` with `{ title: "   " }` -> 400.
  - `PUT /api/notes/:id` with `{ content: "   " }` -> 400.
  - `GET /api/notes?q=` -> 400 with `q` error.
  - `GET /api/notes?tag=%20` -> 400 with `tag` error.
  - All error responses follow the `{ errors: [...] }` shape.
- **Acceptance criteria:** All new tests pass; previous tests in `tests/notes.test.ts` still pass.
- **Blockers:** Tasks 2.1, 2.4.
- **Model:** claude-sonnet-4-6

### VERIFY 2 — `npm test` and `npm run build` both succeed; the new error paths return 400 with the documented JSON shape.

---

## Phase 3 — `/version` and `/help` endpoints (gh-toy-4ef and gh-toy-kbk)

Goal: deliver the two read-only informational endpoints in one cohesive phase. Both live at the app root, both are pure functions of static metadata, both are exercised the same way in tests.

Important constraint resolved during exploration: although `tsconfig.json` has `resolveJsonModule: true`, the `rootDir: "./src"` and `include: ["src/**/*"]` mean importing `../../package.json` from `src/api/meta.ts` violates `rootDir` (TS6059). To avoid a global build-config change, the version string is hardcoded in `src/api/meta.ts` as a top-level `const VERSION = "1.0.0"`. If the package version ever changes, update this constant. (A future improvement could expose the version via a generated file under `src/`, but that is out of scope for this sprint.)

### Task 3.1 — Create `src/api/meta.ts` exporting a router for `/version` and `/help`
- **Files:** `src/api/meta.ts` (create)
- **Description:**
  - At the top of the file: `const NAME = "fleet-e2e-toy";` and `const VERSION = "1.0.0";`.
  - Export a default Express `Router`.
  - `GET /version` -> `res.status(200).json({ name: NAME, version: VERSION, display: ` `${NAME} v${VERSION}` ` })`.
  - `GET /help` -> `res.status(200).json({ ... })` with this exact shape:
    ```
    {
      name: NAME,
      version: VERSION,
      description: "REST API for managing notes with tags and search",
      endpoints: [
        { method: "GET",    path: "/health",         description: "Health check" },
        { method: "GET",    path: "/version",        description: "Print version info" },
        { method: "GET",    path: "/help",           description: "Print this help message" },
        { method: "GET",    path: "/api/notes",      description: "List notes; optional ?tag=&q=" },
        { method: "GET",    path: "/api/notes/:id",  description: "Get one note by id" },
        { method: "POST",   path: "/api/notes",      description: "Create a note; body { title, content, tags? }" },
        { method: "PUT",    path: "/api/notes/:id",  description: "Update a note (partial)" },
        { method: "DELETE", path: "/api/notes/:id",  description: "Delete a note" }
      ]
    }
    ```
  - No `any` types. Handlers use `res.status(...).json(...)`. Do not read `package.json` at runtime or compile-time — the constant is the single source of truth in this file.
- **Acceptance criteria:**
  - `npm run build` succeeds.
  - Router exports default; both handlers return 200 with the documented shapes when exercised.
- **Blockers:** none.
- **Model:** claude-sonnet-4-6

### Task 3.2 — Mount the meta router in `src/app.ts` and add integration tests
- **Files:** `src/app.ts` (modify), `tests/meta.test.ts` (create)
- **Description:**
  - In `src/app.ts`: `import metaRouter from "./api/meta";` and mount it at the app root with `app.use("/", metaRouter)`. Place the `app.use` immediately after the `/api/notes` mount and before the existing `/health` route. (Order does not matter functionally — paths are disjoint — this minimizes diff.)
  - In `tests/meta.test.ts` (new file), using supertest against `src/app.ts`:
    - `GET /version` -> status 200; body has `name === "fleet-e2e-toy"`, `version === "1.0.0"`, `display === "fleet-e2e-toy v1.0.0"`.
    - `GET /help` -> status 200; body has `name === "fleet-e2e-toy"`, `version === "1.0.0"`, and `endpoints` is an array of length `>= 8`.
    - `GET /help` `endpoints` MUST include the following `(method, path)` pairs (assert via `.some(...)` or by mapping to a set): `(GET, /health)`, `(GET, /version)`, `(GET, /help)`, `(GET, /api/notes)`, `(POST, /api/notes)`, `(GET, /api/notes/:id)`, `(PUT, /api/notes/:id)`, `(DELETE, /api/notes/:id)`.
- **Acceptance criteria:**
  - `npm test` passes including the new `tests/meta.test.ts`.
  - All previously passing tests still pass.
- **Blockers:** Task 3.1.
- **Model:** claude-sonnet-4-6

### VERIFY 3 — Both new endpoints respond 200 with the documented JSON. `npm test` is green.

---

## Phase 4 — Final verification

### Task 4.1 — Run the full test suite, build, and lint
- **Files:** none (verification only)
- **Description:**
  - Run `npm run build` — must succeed with no errors.
  - Run `npm test` — must succeed with zero failing tests.
  - Run `npm run lint` — must succeed (or report and fix any lint errors introduced).
  - If anything fails, fix in place rather than working around it. Re-run until clean.
- **Acceptance criteria:**
  - `npm run build` exit code 0.
  - `npm test` exit code 0, all suites pass.
  - `npm run lint` exit code 0.
- **Blockers:** All previous tasks.
- **Model:** claude-sonnet-4-6

---

## Streak / dispatch summary

To help the orchestrator: model assignment is structured into three streaks.

1. **Haiku streak:** Tasks 1.1, 1.2 (foundation helpers + tests).
2. **Sonnet streak:** Tasks 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 4.1 (all implementation, integration, and verification).

Result: 2 dispatches total, ordered by dependency. Phase boundaries fall at cohesive completion points (foundations done; validation hardening done; meta endpoints done; final verify).

---

## Risks and notes
- The requirements name a CLI tool (`fleet-e2e-toy`). We adapt it to REST endpoints per the sprint instructions but preserve the literal version string `fleet-e2e-toy v1.0.0` in the `/version` response so any human acceptance check against the original wording still matches.
- `validateListQuery` is added in Phase 2 to centralize query validation; if a future task introduces `?page=&limit=` for pagination (called out as a TODO in `src/api/notes.ts`), it should extend this helper rather than inline checks.
- Version string is hardcoded in `src/api/meta.ts` (`const VERSION = "1.0.0"`) because the existing `tsconfig.json` configuration prevents importing `package.json` from inside `src/`. Document this in the file so future maintainers update both `package.json` and the constant in lockstep.
- No new runtime dependencies are introduced. No build-config changes.
- Out of scope (intentionally not addressed in this sprint): pagination, max length validation, duplicate-tag rejection, `updatedAt` on PUT — all called out as TODOs in `src/api/notes.ts` but not part of the three P1 issues.
