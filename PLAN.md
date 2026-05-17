# fleet-e2e-toy — Implementation Plan

> Implement three enhancements: harden input validation to reject empty/whitespace content and tags (Issue 2), add a `GET /version` endpoint sourcing from package.json (Issue 1), and add a `GET /help` endpoint documenting all API routes (Issue 3).

---

## Tasks

### Phase 1: Input Validation Hardening (Issue 2)

Riskiest change goes first — this modifies existing behavior in `validateCreateInput` and `validateUpdateInput`. Verified no existing tests send empty content or empty-string tags, so regression risk is low but non-zero.

#### Task 1: Reject empty/whitespace content and tag values in validation functions
- **Change:** In `src/utils/validation.ts`:
  - `validateCreateInput`: change the content check from `typeof obj.content !== "string"` to also reject `obj.content.trim().length === 0`. Error message: `"Content must be a non-empty string"`.
  - `validateCreateInput`: after confirming tags is an array of strings, add a check that rejects any tag where `tag.trim().length === 0`. Error message: `"Tags must not contain empty or whitespace-only values"`.
  - `validateUpdateInput`: when `obj.content` is provided, add the same empty/whitespace rejection as above.
  - `validateUpdateInput`: when `obj.tags` is provided and passes the array-of-strings check, add the same empty tag rejection.
- **Files:** `src/utils/validation.ts`
- **Tier:** cheap
- **Done when:** `validateCreateInput({title: "T", content: ""})` returns `{valid: false}` with a content error; `validateCreateInput({title: "T", content: "x", tags: [""]})` returns `{valid: false}` with a tags error; same patterns fail in `validateUpdateInput`; existing validation behavior unchanged for valid inputs.
- **Blockers:** None — pure logic change to an existing function.

#### Task 2: Add tests for empty/whitespace content and tag validation
- **Change:** Add test cases to `tests/validation.test.ts`:
  - `validateCreateInput` rejects `content: ""`
  - `validateCreateInput` rejects `content: "   "` (whitespace only)
  - `validateCreateInput` rejects `tags: [""]`
  - `validateCreateInput` rejects `tags: ["valid", "  "]`
  - `validateUpdateInput` rejects `content: ""`
  - `validateUpdateInput` rejects `content: "   "`
  - `validateUpdateInput` rejects `tags: ["", "ok"]`
  - `validateUpdateInput` still accepts `{}` (no-op update)

  Add integration tests to `tests/notes.test.ts`:
  - `POST /api/notes` with `{title: "T", content: ""}` → 400
  - `POST /api/notes` with `{title: "T", content: "   "}` → 400
  - `POST /api/notes` with `{title: "T", content: "ok", tags: [""]}` → 400
  - `PUT /api/notes/:id` with `{content: ""}` → 400
  - `PUT /api/notes/:id` with `{tags: ["  "]}` → 400
- **Files:** `tests/validation.test.ts`, `tests/notes.test.ts`
- **Tier:** standard
- **Done when:** `npm test` passes with all new assertions green; no regressions in existing tests.
- **Blockers:** Depends on Task 1 being complete.

#### VERIFY: Input Validation Hardening
- Run full test suite (`npm test`)
- Confirm all Phase 1 changes work together
- Report: tests passing, any regressions, any issues found

---

### Phase 2: API Metadata Endpoints (Issues 1 & 3)

Additive features — new top-level routes in `src/app.ts`. Grouped because they share the same code location and both serve API metadata purposes.

#### Task 3: Add GET /version endpoint
- **Change:** In `src/app.ts`, add a `GET /version` route that:
  - Imports `version` from `../package.json` (using `resolveJsonModule`, already enabled in tsconfig)
  - Returns HTTP 200 with JSON body `{"name": "fleet-e2e-toy", "version": "<version from package.json>"}`
  - The name is hardcoded as `"fleet-e2e-toy"` (product name, not npm package name `"noteapi"`)
  - The version is read dynamically from package.json — not hardcoded
- **Files:** `src/app.ts`
- **Tier:** cheap
- **Done when:** `GET /version` returns `{"name": "fleet-e2e-toy", "version": "1.0.0"}` with status 200.
- **Blockers:** None — `resolveJsonModule` confirmed enabled.

#### Task 4: Add GET /help endpoint
- **Change:** In `src/app.ts`, add a `GET /help` route that returns a static JSON document with a `routes` array. Each entry has: `method`, `path`, `description`, and optionally `requestBody` and `responseShape`. Routes to document:
  - `GET /health` — Health check
  - `GET /version` — API version info
  - `GET /help` — API documentation (this endpoint)
  - `GET /api/notes` — List all notes (query params: tag, q)
  - `GET /api/notes/:id` — Get a note by ID
  - `POST /api/notes` — Create a new note
  - `PUT /api/notes/:id` — Update an existing note
  - `DELETE /api/notes/:id` — Delete a note
- **Files:** `src/app.ts`
- **Tier:** cheap
- **Done when:** `GET /help` returns 200 with `Content-Type: application/json`, body contains a `routes` array with 8 entries, each with `method`, `path`, and `description` fields.
- **Blockers:** None.

#### Task 5: Add integration tests for /version and /help
- **Change:** Add test cases to `tests/notes.test.ts`:
  - `GET /version` returns 200 with `name: "fleet-e2e-toy"` and `version: "1.0.0"`
  - `GET /version` response version matches package.json version (import and compare)
  - `GET /help` returns 200
  - `GET /help` response has `routes` array
  - `GET /help` routes array contains at least 8 entries
  - `GET /help` each route entry has `method`, `path`, `description` fields
- **Files:** `tests/notes.test.ts`
- **Tier:** standard
- **Done when:** `npm test` passes with all new assertions green; existing tests unaffected.
- **Blockers:** Depends on Tasks 3 and 4 being complete.

#### VERIFY: API Metadata Endpoints
- Run full test suite (`npm test`)
- Confirm all Phase 2 changes work together
- Report: tests passing, any regressions, any issues found

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content validation change breaks downstream consumers expecting empty content to be stored | med | Verified no existing tests send empty content; behavior change is intentional per requirements |
| `package.json` import path breaks in compiled JS (dist/) | low | `resolveJsonModule` is enabled; path resolves relative to compiled output since rootDir is `./src` and outDir is `./dist` — use `require("../../package.json")` pattern or verify import path at build time |
| Help endpoint route list goes stale when new routes are added | low | Route list is static by design (per requirements); documented in code that it must be updated manually |
| Empty tag rejection breaks existing data in production | low | App uses in-memory store (no persistence) — no migration needed; change only affects new requests |
| Whitespace-only content that previously succeeded now returns 400 | med | This is the intended fix per Issue 2; API consumers must update to send non-empty content |

## Notes
- Each task should result in a git commit
- Verify tasks are checkpoints — stop and report after each one
- Base branch: main
- Implementation branch: e2e-s1.2-25981185129/api-enhancements
