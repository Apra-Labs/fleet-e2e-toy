# NoteAPI — API Enhancements Knowledge Harvest

This document captures the durable architecture decisions, API contracts, and design trade-offs from the sprint that added input validation hardening and two metadata endpoints (`GET /version`, `GET /help`).

---

## Architecture Decisions

### Input Validation: trim-based empty-string rejection

Content and tag-value validation uses `.trim().length === 0` rather than a simple equality check against `""`. This handles both empty strings and whitespace-only strings (e.g. `"   "`) uniformly through a single code path. The check is applied at the validation layer (`src/utils/validation.ts`) before any storage touch, so the in-memory store never holds semantically empty values.

For `PUT` (partial updates), the empty-content check is guarded behind `if (obj.content !== undefined)` — an absent `content` field is valid (no-op update semantics are preserved). A present but empty `content` field is always rejected.

### GET /version: version sourced from package.json, name hardcoded

The `version` field is read from `package.json` at startup via TypeScript's `resolveJsonModule` import (`import pkg from "../package.json"`). This ensures the endpoint value is always in sync with the npm package version without manual duplication.

The `name` field is hardcoded as `"fleet-e2e-toy"` rather than read from `package.json`. The npm package name (`"noteapi"`) differs from the product name — conflating them would expose a build-system artefact in the public API. The product name is stable and intentional; the npm name is an implementation detail.

### GET /help: static route list, no runtime introspection

The route list returned by `GET /help` is a hand-authored static array in `src/app.ts`. Express's internal route registry is not introspected at runtime. This is intentional: runtime introspection would expose implementation-internal route metadata (middleware routes, error handlers) and require fragile reflection. The trade-off is that the list must be updated manually when new routes are added.

---

## API Contracts

### Input validation errors

All validation failures return HTTP 400 with a JSON body containing an `errors` array.

**Error body shape:**
```json
{ "errors": ["<message>", ...] }
```

**Rejection rules:**
| Field | Rejected when |
|-------|--------------|
| `content` (create) | absent, not a string, empty string, or whitespace-only |
| `content` (update) | present and empty string or whitespace-only |
| `tags[*]` (create or update) | any element is an empty string or whitespace-only |

**Error messages (verbatim):**
- `"Content must be a non-empty string"`
- `"Tags must not contain empty or whitespace-only values"`

### GET /version

```
GET /version
→ 200 OK
Content-Type: application/json

{
  "name": "fleet-e2e-toy",
  "version": "1.0.0"
}
```

- `name` is always `"fleet-e2e-toy"` regardless of the npm package name.
- `version` reflects the value of the `version` field in `package.json`.

### GET /help

```
GET /help
→ 200 OK
Content-Type: application/json

{
  "routes": [
    { "method": "GET",    "path": "/health",          "description": "..." },
    { "method": "GET",    "path": "/version",         "description": "..." },
    { "method": "GET",    "path": "/help",            "description": "..." },
    { "method": "GET",    "path": "/api/notes",       "description": "...", "requestBody"?: {...} },
    { "method": "GET",    "path": "/api/notes/:id",   "description": "..." },
    { "method": "POST",   "path": "/api/notes",       "description": "...", "requestBody": {...}, "responseShape": {...} },
    { "method": "PUT",    "path": "/api/notes/:id",   "description": "...", "requestBody": {...} },
    { "method": "DELETE", "path": "/api/notes/:id",   "description": "..." }
  ]
}
```

- Every entry has `method`, `path`, and `description` fields (required).
- `requestBody` and `responseShape` are optional fields present on write endpoints.
- The array always contains exactly 8 entries covering all current routes.

---

## Design Trade-offs

### Validation tightening is a breaking change for existing API consumers

Rejecting empty/whitespace content is a tightening of the API contract — requests that previously succeeded (e.g. `content: "   "`) now return 400. This was accepted because the app uses an in-memory store (no persistence, no migration needed) and the existing test suite confirmed no legitimate usage of empty content. Downstream clients that send whitespace-only content must be updated.

### /version name vs. npm name divergence is intentional

The npm package name (`noteapi`) was set before the product name (`fleet-e2e-toy`) was finalised. Rather than rename the npm package (which would affect build tooling and CI), the endpoint hardcodes the correct product name. If the npm package is ever renamed to match, the hardcoded value would need a corresponding update.

### /help route list requires manual maintenance

The static route list trades correctness-over-time for simplicity. If a route is added or removed without updating `/help`, the endpoint will be inaccurate. Mitigation: treat `/help` changes as part of the definition-of-done for any new route, enforced at code review time.

### package.json import path across rootDir boundary

`src/app.ts` imports `../../package.json` relative to its compiled output location (`dist/app.js` → `../../package.json` resolves to the project root). TypeScript's `resolveJsonModule` handles this at compile time; the compiled JS uses `require` at the resolved path. This is safe as long as the compiled output remains under `dist/` and `package.json` stays at the project root.
