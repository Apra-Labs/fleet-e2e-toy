# fleet-e2e-toy — Code Review

**Reviewer:** reviewer
**Date:** 2026-05-17 15:45:00+00:00
**Verdict:** APPROVED

> See the recent git history of this file to understand the context of this review.

---

## 1. Cumulative Scope

This review covers all changes from `main` to HEAD (`79827e7`) across both phases:

- **Phase 1** (Issue 2): Input validation hardening — reject empty/whitespace content and tags
- **Phase 2** (Issues 1 & 3): API metadata endpoints — `GET /version` and `GET /help`

All tasks (T1.1, T1.2, T2.1, T2.2, T2.3) plus verification checkpoints (T1.V, T2.V) are marked complete in `progress.json`.

---

## 2. Phase 1 — Input Validation Hardening (Issue 2)

### Validation Logic (src/utils/validation.ts)

**PASS.** Implementation matches PLAN.md Task 1 specification exactly:

- `validateCreateInput`: content check changed from type-only to `typeof obj.content !== "string" || obj.content.trim().length === 0`. Error message: `"Content must be a non-empty string"`.
- `validateCreateInput`: tag emptiness check added as `else if` after the array-of-strings guard — `obj.tags.some((t) => t.trim().length === 0)`. Error: `"Tags must not contain empty or whitespace-only values"`.
- `validateUpdateInput`: content check wrapped in `if (obj.content !== undefined)` guard preserving no-op update semantics, with the same trim rejection inside.
- `validateUpdateInput`: identical tag emptiness check added.

The `else if` structure is correct — avoids calling `trim()` on non-string values. Error messages are user-friendly and field-specific.

### Phase 1 Tests

**PASS.** 7 new unit tests in `tests/validation.test.ts`:
- `validateCreateInput` rejects: empty content, whitespace content, empty tag, whitespace tag mixed with valid
- `validateUpdateInput` rejects: empty content, whitespace content, empty tag mixed with valid

5 new integration tests in `tests/notes.test.ts`:
- POST: empty content (400), whitespace content (400), empty tag (400)
- PUT: empty content (400), whitespace tag (400)

No redundancy. Integration tests correctly create notes before testing PUT. The existing `"accepts empty object (no-op update)"` test continues to pass, confirming the guard logic works.

### Requirements.md Issue 2 Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| POST `content: ""` → 400 | **PASS** |
| POST `content: "   "` → 400 | **PASS** |
| PUT `content: ""/whitespace` → 400 | **PASS** |
| Empty/blank tags → 400 | **PASS** |
| User-friendly error messages | **PASS** |
| Unit tests covering new cases | **PASS** (7 tests) |
| No regressions | **PASS** (all original tests unchanged and passing) |

---

## 3. Phase 2 — API Metadata Endpoints (Issues 1 & 3)

### GET /version (src/app.ts)

**PASS.** Implementation matches PLAN.md Task 3:

- Imports `pkg` from `../package.json` using ES module import (enabled by `resolveJsonModule: true` in tsconfig).
- Returns `{ name: "fleet-e2e-toy", version: pkg.version }` — name is hardcoded product name, version is dynamic from package.json.
- HTTP 200 with `application/json` content type (Express default for `.json()`).

### GET /help (src/app.ts)

**PASS.** Implementation matches PLAN.md Task 4:

- Returns `{ routes: [...] }` with exactly 8 entries.
- All entries have `method`, `path`, `description` fields.
- POST and PUT entries include optional `requestBody` and `responseShape` fields.
- Covers all required routes: `/health`, `/version`, `/help`, `GET|POST /api/notes`, `GET|PUT|DELETE /api/notes/:id`.
- Route list is statically defined per requirements.

### Phase 2 Tests

**PASS.** 7 new integration tests in `tests/notes.test.ts`:

GET /version (3 tests):
- Returns 200
- Body has `name: "fleet-e2e-toy"` and `version: "1.0.0"`
- Version matches package.json (dynamic cross-check via `require("../package.json")`)

GET /help (4 tests):
- Returns 200
- Body has `routes` array
- Routes array has >= 8 entries
- Each route entry has `method`, `path`, `description` fields

No redundancy. The package.json cross-check is a valuable test — ensures the endpoint stays in sync with the actual version.

### Requirements.md Issue 1 Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| GET /version returns 200 | **PASS** |
| JSON body `{"name": "fleet-e2e-toy", "version": "1.0.0"}` | **PASS** |
| Name is product name, not npm name | **PASS** — hardcoded `"fleet-e2e-toy"`, not `"noteapi"` |
| Version sourced from package.json, not hardcoded | **PASS** — uses `pkg.version` |
| Integration test covering endpoint | **PASS** (3 tests) |
| No breakage to existing endpoints | **PASS** |

### Requirements.md Issue 3 Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| GET /help returns 200 with application/json | **PASS** |
| Lists all routes: method, path, description, body shapes | **PASS** |
| Covers /health, /version, /help, all /api/notes routes | **PASS** (8 routes) |
| Statically defined | **PASS** |
| Integration test for 200 + routes array | **PASS** (4 tests) |
| No breakage to existing endpoints | **PASS** |

---

## 4. Build and Tests

**PASS.**

- `tsc --noEmit`: compiles with zero errors.
- `npm test` (Jest): **40/40 tests passed**, 2 suites, 0 failures.
- No regressions in the 21 pre-existing tests (original suite before any sprint changes).

---

## 5. File Hygiene

**PASS.** Eight files changed on the branch:

| File | Justification |
|------|---------------|
| `PLAN.md` | Sprint plan — required |
| `requirements.md` | Sprint requirements — required |
| `progress.json` | Task tracking — required |
| `feedback.md` | Review document — required |
| `src/app.ts` | /version and /help endpoints (Issues 1 & 3) |
| `src/utils/validation.ts` | Validation hardening (Issue 2) |
| `tests/notes.test.ts` | Integration tests for all phases |
| `tests/validation.test.ts` | Unit tests for Issue 2 |

No unexpected files. No build artifacts, no config changes, no unrelated modifications.

---

## 6. Code Quality and Security

**PASS.** No issues found:

- No `any` types introduced.
- No `console.log` in handlers.
- All responses use `res.json()` — no `res.send()`.
- Validation changes are defensive (tighten constraints) — security improvement.
- `trim()` approach is safe and idiomatic.
- The `pkg` import pattern is standard for `resolveJsonModule`-enabled projects.
- Static route list in `/help` avoids runtime introspection complexity.

---

## 7. Regressions Check

**PASS.** Phase 1 code (validation.ts) reviewed again in this cumulative pass — no regressions introduced by Phase 2 changes. Phase 2 adds new routes in `app.ts` without modifying any existing handlers or middleware. The original 21 tests all pass unmodified.

---

## Summary

Both phases are complete and correct. All five implementation tasks meet their PLAN.md done criteria. All three requirements.md issues (1, 2, 3) are fully addressed with appropriate test coverage. The codebase compiles cleanly, all 40 tests pass, file hygiene is clean, and no security concerns exist.

**Verdict: APPROVED** — Sprint complete. All issues resolved.

---
---

# Documentation Harvest Review — docs/api-enhancements.md

**Reviewer:** reviewer
**Date:** 2026-05-17 16:10:00+00:00
**Verdict:** CHANGES NEEDED

---

## Durable Knowledge Check

### Architecture decisions with rationale

**PASS.** Three decisions are documented with clear rationale:
- Trim-based validation (why `.trim().length === 0` over `=== ""`)
- Version from package.json / name hardcoded (npm name vs product name divergence)
- Static route list over runtime introspection (stability over auto-discovery)

All three are durable design choices that a future maintainer would benefit from understanding.

### API contracts (exact shapes)

**FAIL.** The error body shape is incorrect.

The document states:
```json
{ "errors": ["<message>", ...] }
```

The actual response (per `src/api/notes.ts:47`) is:
```json
{ "errors": [{"field": "content", "message": "Content must be a non-empty string"}, ...] }
```

`errors` is an array of `{field: string, message: string}` objects, not an array of plain strings. This is a significant inaccuracy for an API contract document — a consumer relying on this doc would parse the response incorrectly.

Additionally, the GET /help example on line 78 shows `"requestBody"?: {...}` on the `GET /api/notes` entry. The actual code does not include a `requestBody` field on that route entry. The `?` notation is used as a documentation convention for optionality, but placing it on a specific GET endpoint is misleading — it implies that endpoint might carry a request body.

### Key trade-offs

**PASS.** Four trade-offs documented:
- Breaking change for existing consumers (accepted because in-memory store, no migration)
- Name divergence is intentional (avoids npm rename churn)
- Manual route-list maintenance (simplicity over auto-sync)
- package.json import across rootDir boundary (safe given current layout)

All are genuine, well-reasoned, and relevant long-term.

---

## Transient Content Check

| Check | Status |
|-------|--------|
| No task IDs (T1.1, T2.V etc.) | **PASS** |
| No code-line references | **PASS** |
| No implementation steps or "how to" | **PASS** |
| No debug notes or PR references | **PASS** |

The document references file paths (`src/utils/validation.ts`, `src/app.ts`) which is appropriate — these are architectural locations, not line-level references.

---

## Required Changes

1. **Fix error body shape** — Change the documented shape from `{ "errors": ["<message>", ...] }` to `{ "errors": [{"field": "<field>", "message": "<message>"}, ...] }`. This matches the actual `ValidationError` interface and the response serialization in `src/api/notes.ts`.

2. **Remove `requestBody?` from GET /api/notes line** — The `GET /api/notes` entry in the help example should not show a `requestBody` field (even as optional). Only POST and PUT entries carry that field in the actual response.

---

## Summary

The document excels at capturing durable architecture decisions and trade-offs — the rationale sections are clear and valuable for future maintainers. However, the API contract section has a factual error in the error response shape that would mislead consumers. This must be corrected before the doc can be considered accurate.

**Verdict: CHANGES NEEDED** — Fix the error body shape and the GET /api/notes example, then re-submit.
