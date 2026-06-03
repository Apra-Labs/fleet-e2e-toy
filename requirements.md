# Sprint Requirements — fleet-e2e-toy P1 Issues

Three ready P1 issues from the beads backlog. All are labeled `e2e-testing`.

---

## Issue gh-toy-4ef — Add --version flag to CLI

**Type:** feature | **Priority:** P1 | **External ref:** gh-1

**Description:**
The CLI tool should support a `--version` (or `-v`) flag that prints the current version string and exits with code 0.

**Acceptance criteria:**
- Running `./tool --version` prints `fleet-e2e-toy v1.0.0`, exit code 0.
- Works alongside other flags.

**Context for NoteAPI:**
This is a REST API project (Node.js + Express + TypeScript). The equivalent implementation is a `GET /version` endpoint that returns the version string as JSON: `{ "version": "1.0.0" }`. The version should be read from `package.json`. A unit/integration test must be added confirming the endpoint returns 200 with the correct body.

---

## Issue gh-toy-v6z — Add input validation for empty or blank strings

**Type:** bug | **Priority:** P1 | **External ref:** gh-2

**Description:**
When a user passes an empty string or whitespace-only string as an argument, the tool should reject it with a clear error message instead of silently proceeding or crashing.

**Acceptance criteria:**
- Passing empty or whitespace-only values prints a user-friendly error.
- Non-zero exit (HTTP 400 for the REST API).
- Unit test added.

**Context for NoteAPI:**
The existing `validateCreateInput` in `src/utils/validation.ts` already rejects an empty `title`. However:
- The `content` field currently accepts whitespace-only strings — it must also be rejected with a clear error when blank (`content.trim().length === 0`).
- Tags within the `tags` array that are empty or whitespace-only strings should also be rejected.
- The `validateUpdateInput` function must apply the same blank-string guards when `content` is provided.
- A new test case must be added to `tests/validation.test.ts` covering: whitespace-only title, whitespace-only content, and a tag that is whitespace only.

---

## Issue gh-toy-kbk — Implement a help command

**Type:** feature | **Priority:** P1 | **External ref:** gh-3

**Description:**
Add a help subcommand (and `--help` / `-h` flag) that prints usage information for all available commands and flags.

**Acceptance criteria:**
- `./tool help` and `./tool --help` both work, list every subcommand and flag, exit code 0.

**Context for NoteAPI:**
The equivalent for this REST API is a `GET /api/help` (or `GET /help`) endpoint that returns a machine-readable JSON description of all available API endpoints, their HTTP methods, required/optional fields, and brief descriptions. This provides discoverability for API consumers the same way `--help` does for CLI users. A unit/integration test must be added verifying the endpoint returns 200 and includes entries for all existing routes.

---

## No design doc needed

All three tasks have a clear, single implementation path given the REST API context above. No architectural decision with multiple reasonable answers — skip the design phase and go straight to planning.
