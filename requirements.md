# fleet-e2e-toy — Requirements

## Project context

**Repo:** https://github.com/Apra-Labs/fleet-e2e-toy  
**Base branch:** main  
**Stack:** TypeScript, Express 4, Jest, Supertest  
**Entry points:** `src/app.ts` (Express app), `src/index.ts` (server start)  
**Key files:** `src/utils/validation.ts`, `src/models/note.ts`, `src/api/notes.ts`  
**Test file:** `tests/notes.test.ts`, `tests/validation.test.ts`

The project is an in-memory REST API (NoteAPI) for managing notes with tags and search. Current endpoints live under `/api/notes`. There is a health check at `GET /health`.

---

## Issue 1 — Add --version flag / version endpoint (gh-toy-4ef, P1)

**Type:** feature  
**Source:** gh issue #1

### Full issue text
> The CLI tool should support a --version (or -v) flag that prints the current version string and exits with code 0. Acceptance: running `./tool --version` prints `fleet-e2e-toy v1.0.0`, exit code 0, works alongside other flags.

### Interpretation for REST API
Implement a `GET /version` endpoint on the Express app that returns the version information as JSON. The version must be read from `package.json` (where `"version": "1.0.0"` and `"name": "noteapi"` are defined) rather than hardcoded.

### Acceptance criteria
- `GET /version` returns HTTP 200 with JSON body: `{"name": "fleet-e2e-toy", "version": "1.0.0"}`  
- The name returned is `fleet-e2e-toy` (the product name, not the npm package name `noteapi`)  
- Version value is sourced from `package.json` at runtime — no hardcoded string  
- Unit/integration test covering the endpoint  
- Works without breaking existing endpoints

### Risk
- `package.json` import may need `require` vs `import` handling in TypeScript (`resolveJsonModule` must be enabled in tsconfig)

---

## Issue 2 — Add input validation for empty or blank strings (gh-toy-v6z, P1)

**Type:** bug  
**Source:** gh issue #2

### Full issue text
> When a user passes an empty string or whitespace-only string as an argument, the tool should reject it with a clear error message instead of silently proceeding or crashing. Acceptance: passing empty or whitespace prints user-friendly error, non-zero exit, unit test added.

### Root cause
`validateCreateInput` already rejects empty/whitespace `title`, but `content` is only checked to be a `string` — an empty string `""` or whitespace-only string `"   "` passes validation silently and is stored. `validateUpdateInput` has the same gap for `content`.

Additionally, tag values within the `tags` array are not validated for emptiness — `["", "  "]` passes today.

### Acceptance criteria
- `POST /api/notes` with `content: ""` → 400, error on `content` field  
- `POST /api/notes` with `content: "   "` → 400, error on `content` field  
- `PUT /api/notes/:id` with `content: ""` or `content: "   "` → 400  
- Empty/blank tag values in the `tags` array → 400  
- All error messages are user-friendly (e.g. `"Content must be a non-empty string"`)  
- New unit tests in `tests/validation.test.ts` covering all new rejection cases  
- Existing passing tests must not regress

### Risk
- Some existing tests may send `content: ""` — must audit before changing behavior

---

## Issue 3 — Add help command / API documentation endpoint (gh-toy-kbk, P1)

**Type:** feature  
**Source:** gh issue #3

### Full issue text
> Add a help subcommand (and --help / -h flag) that prints usage information for all available commands and flags. Acceptance: `./tool help` and `./tool --help` both work, lists every subcommand and flag, exit code 0.

### Interpretation for REST API
Implement a `GET /help` endpoint that returns a JSON document describing all available API routes, their methods, parameters, and expected request/response shapes. This is the REST API equivalent of a help command.

### Acceptance criteria
- `GET /help` returns HTTP 200 with Content-Type `application/json`  
- Response lists every route in the API: method, path, description, request body shape (where applicable), response shape  
- Covers at minimum: `GET /health`, `GET /version`, `GET /help`, and all `GET|POST|PUT|DELETE /api/notes*` routes  
- Route list is statically defined (no runtime introspection required)  
- Integration test asserting 200 status and that the response body contains a `routes` array with at least one entry  
- Works without breaking existing endpoints

### Risk
- Route list must be kept in sync manually if new routes are added — document this in the endpoint response or a code comment

---

## Out of scope
- CLI binary / shell script wrapper  
- Database persistence (in-memory store is intentional)  
- Authentication / authorization  
- Pagination, archiving, full-text search (tracked separately in feature_list.json)
