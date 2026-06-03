# Requirements

Three P1 issues selected from the backlog for this sprint.

---

## Issue gh-toy-4ef — Add --version flag to CLI

**Type:** feature  
**Priority:** P1  

**Description:**  
The CLI tool should support a `--version` (or `-v`) flag that prints the current version string and exits with code 0.

**Acceptance Criteria:**
- Running `./tool --version` prints `fleet-e2e-toy v1.0.0`
- Exit code is 0
- Works alongside other flags

---

## Issue gh-toy-v6z — Add input validation for empty or blank strings

**Type:** bug  
**Priority:** P1  

**Description:**  
When a user passes an empty string or whitespace-only string as an argument, the tool should reject it with a clear error message instead of silently proceeding or crashing.

**Acceptance Criteria:**
- Passing empty or whitespace-only string prints a user-friendly error message
- Exit code is non-zero on invalid input
- Unit test added covering this validation

---

## Issue gh-toy-kbk — Implement a help command

**Type:** feature  
**Priority:** P1  

**Description:**  
Add a help subcommand (and `--help` / `-h` flag) that prints usage information for all available commands and flags.

**Acceptance Criteria:**
- `./tool help` works and lists every subcommand and flag
- `./tool --help` works and lists every subcommand and flag
- Exit code is 0

---

## Project Context

This is the **NoteAPI** project — a REST API for managing notes with tags and search, built with Node.js + Express + TypeScript using an in-memory store.

- Test command: `npm test` (Jest + supertest)
- Build command: `npm run build` (TypeScript compilation)
- Source: `src/api/`, `src/models/`, `src/utils/`
- Tests: `tests/`

The validation issue (gh-toy-v6z) maps directly to the existing `src/utils/validation.ts` helper — extend it and add tests covering empty/blank string inputs to the API endpoints.

The help and version issues may map to an Express route (`GET /help`, `GET /version`) or a CLI entrypoint if one exists in the project.
