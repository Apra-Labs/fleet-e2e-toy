# Sprint Implementation Plan - NoteAPI CLI

This plan outlines the design and implementation steps for adding a CLI (`fleet-e2e-toy`) to interact with the NoteAPI REST service. The CLI features CRUD commands, a hierarchical help system, and rigorous blank/empty string validation.

---

## Technical Context & Invariants

- **Binary Name:** `fleet-e2e-toy` (to be registered in `package.json#bin`).
- **Scripts:** A root `tool` script (Bash with `npx ts-node`) and `tool.cmd` (Windows cmd) will act as local execution wrappers.
- **Base URL:** The CLI API client must query `API_URL` or `PORT` environment variables, defaulting to `http://localhost:3000`.
- **Exit Codes:** `0` for success (including help outputs), `1` for any validation, API, or system error.
- **No Stack Traces:** For validation and user-facing API errors, print a clean message to `stderr` and exit without tracebacks.
- **No External Libraries:** Command parsing and HTTP requests should be written in clean TypeScript/Node.js to minimize dependencies (using native `http`/`https` or standard `fetch`).

---

## Tasks

### Phase 1: CLI Scaffolding & API Client

#### Task 1: CLI Entrypoint, Dispatcher & Shell Wrappers
- **Description:** Implement the CLI entrypoint file, parsing global arguments, mapping subcommands to handlers, and setting exit codes. Add the `tool` and `tool.cmd` wrapper scripts at the repository root. Register the bin path in `package.json`.
- **Files:** `src/cli/index.ts`, `tool`, `tool.cmd`, `package.json`
- **Model:** Gemini 3.5 Flash (Medium)
- **Done when:** Running `./tool` runs successfully, prints usage instructions to `stdout`, and exits with a non-zero code.
- **Blockers:** None

#### Task 2: API Client for REST NoteAPI
- **Description:** Implement a lightweight REST client wrapping HTTP fetch requests against the NoteAPI (`GET /api/notes`, `GET /api/notes/:id`, `POST /api/notes`, `PUT /api/notes/:id`, `DELETE /api/notes/:id`). Read the base URL from `API_URL` or `PORT` env vars, defaulting to `http://localhost:3000`.
- **Files:** `src/cli/client.ts`
- **Model:** Gemini 3.5 Flash (Medium)
- **Done when:** The API client functions (`listNotes`, `getNote`, etc.) are written, typed, and compile without errors.
- **Blockers:** Task 1

---

### Phase 2: CRUD Commands (gh-toy-mi2)

#### Task 3: Implement list and read commands
- **Description:** Add the `list` (supports `--tag` and `--q` options) and `read` (requires `--id`) subcommands. Ensure output formats are printed cleanly to `stdout` in plain text.
- **Files:** `src/cli/commands/list.ts`, `src/cli/commands/read.ts`, `src/cli/index.ts`
- **Model:** Gemini 3.5 Flash (Medium)
- **Done when:** `./tool list` prints notes and `./tool read --id <id>` fetches a note or exits with `1` on error.
- **Blockers:** Task 2

#### Task 4: Implement create command
- **Description:** Add the `create` (requires `--title` and `--content`) subcommand. Ensure correct payload assembly and POST HTTP request is executed against the backend server.
- **Files:** `src/cli/commands/create.ts`, `src/cli/index.ts`
- **Model:** Gemini 3.5 Flash (Medium)
- **Done when:** `./tool create --title "Title" --content "Content"` executes successfully and prints the created note details.
- **Blockers:** Task 2

#### Task 5: Implement update command
- **Description:** Add the `update` (requires `--id`, optional `--title` and/or `--content`) subcommand. Ensure correct payload assembly and PUT HTTP request is executed against the backend server.
- **Files:** `src/cli/commands/update.ts`, `src/cli/index.ts`
- **Model:** Gemini 3.5 Flash (Medium)
- **Done when:** `./tool update --id <id> --title "New Title"` executes successfully and prints the updated note details.
- **Blockers:** Task 2

#### Task 6: Implement delete command
- **Description:** Add the `delete` (requires `--id`) subcommand. Ensure DELETE HTTP request is executed against the backend server.
- **Files:** `src/cli/commands/delete.ts`, `src/cli/index.ts`
- **Model:** Gemini 3.5 Flash (Medium)
- **Done when:** `./tool delete --id <id>` executes successfully and exits 0.
- **Blockers:** Task 2

---

### Phase 3: Help System, Validation & Verification (gh-toy-7rp, gh-toy-13t)

#### Task 7: Global and Command Help Flags
- **Description:** Handle `--help` and `-h` flags globally and per-subcommand. Print detailed command usage and options to `stdout` and exit with code `0`.
- **Files:** `src/cli/help.ts`, `src/cli/index.ts`
- **Model:** Gemini 3.5 Flash (Medium)
- **Done when:** `./tool --help` and `./tool list -h` print help text and exit with status code `0`.
- **Blockers:** Task 3, Task 4, Task 5, Task 6

#### Task 8: Argument & Empty/Blank String Validation
- **Description:** Validate user arguments. If a user passes an empty string `""` or whitespace-only string `"   "` for any subcommand argument or option, reject it immediately with a clear error message. Ensure all validation and API errors are caught at the entry point and logged without stack trace outputs.
- **Files:** `src/cli/validation.ts`, `src/cli/index.ts`
- **Model:** Gemini 3.5 Flash (Medium)
- **Done when:** `./tool create --title ""` exits with `1` and prints `Error: title must not be empty`, displaying no stack trace.
- **Blockers:** Task 3, Task 4, Task 5, Task 6

#### Task 9: CLI Unit & Integration Tests
- **Description:** Write automated end-to-end tests for the CLI subcommands using Jest, spinning up the test server, executing the commands via child process, and checking stdout/stderr outputs and exit codes. Add unit tests for blank string validation.
- **Files:** `tests/cli.test.ts`
- **Model:** Gemini 3.5 Flash (Medium)
- **Done when:** Running `npm test` runs all CLI and REST tests successfully.
- **Blockers:** Task 7, Task 8

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| API Server offline during CLI tests | High | Spin up/down test server in `beforeAll`/`afterAll` hooks within `tests/cli.test.ts`. |
| Flag parsing edge cases (e.g. missing args) | Medium | Write a robust custom argument parser that handles missing options and reports clear errors. |
| Windows/Unix line ending discrepancies in outputs | Low | Normalize line endings (`\r\n` to `\n`) and trim outputs in tests. |
