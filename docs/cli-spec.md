# CLI Specification & API Client Contract

This document provides a comprehensive reference for the NoteAPI Command Line Interface (`fleet-e2e-toy`) architecture, subcommand specifications, API client contracts, exit codes, and input validation rules.

---

## 1. CLI Architecture

### Executable Binary & Execution Wrappers
* **Binary Name:** `fleet-e2e-toy` (registered in the `bin` field of `package.json` for npm installation).
* **Bash Wrapper (`tool`):** A shell script at the repository root that executes the TypeScript entry point using `npx ts-node`.
* **Windows CMD Wrapper (`tool.cmd`):** A batch script at the repository root allowing native CLI execution in Windows environments.

### Codebase Organization
The CLI components are structured within `src/cli/` to keep parsing, command logic, validation, and API interaction modular and clean:
* **Entry Point (`src/cli/index.ts`):** Orchestrates command-line argument processing, triggers validation checks, handles global help routing, and traps all runtime exceptions to print clean error outputs.
* **Argument Parser (`src/cli/args.ts`):** Parses `process.argv` inputs, isolating positional arguments (the primary subcommand) from name-value option flags (e.g., `--id value` or `--id=value`).
* **Subcommands (`src/cli/commands/`):** Dedicated handler functions for each CRUD action:
  * `list.ts`
  * `read.ts`
  * `create.ts`
  * `update.ts`
  * `delete.ts`
* **API Client (`src/cli/client.ts`):** A lightweight client wrapper using native fetch to query the NoteAPI service.
* **Input Validation (`src/cli/validation.ts`):** Centralized logic to enforce string argument validations before command execution.
* **Help System (`src/cli/help.ts`):** CLI usage guidelines and option menus printed to standard output.

### Environmental Configuration
The API client resolves the base NoteAPI service endpoint dynamically in the following order of precedence:
1. `API_URL` environment variable (e.g., `http://api.production.local`)
2. `PORT` environment variable (resolves to `http://localhost:${PORT}`)
3. Defaults to `http://localhost:3000`

---

## 2. Feature Specifications

### Help System
The CLI includes a hierarchical help system. Global and command-specific help screens can be invoked using `-h` or `--help` flags. Help information is printed to `stdout`.

* **Global Help:**
  * Invocation: `./tool -h`, `./tool --help`, or `./tool help`
  * Output: Displays usage instruction, list of subcommands, and global options.
* **Subcommand-specific Help:**
  * Invocation: `./tool <subcommand> -h` or `./tool <subcommand> --help`
  * Output: Displays detailed usage and specific flags for the given subcommand.

### Subcommands & Output Formats
Each command calls the API client and outputs responses in a clean, human-readable plain text format on `stdout`. Multiple records in lists are separated by an empty line.

* **`list`:** Lists notes in the store.
  * Options:
    * `--tag <tag>`: Filter results to notes containing the specified tag.
    * `--q <query>`: Text-search query matching against note titles or content (case-insensitive).
  * Output Format:
    ```text
    ID: <uuid>
    Title: <title>
    Content: <content>
    Tags: <tag1>, <tag2>
    Created: <iso-timestamp>
    Updated: <iso-timestamp>
    ```

* **`read`:** Fetches detail for a single note.
  * Required option: `--id <id>`
  * Output Format: Same single-record format as `list`.

* **`create`:** Creates a new note.
  * Required options: `--title <title>`, `--content <content>`
  * Optional option: `--tags <tag1,tag2,...>` (comma-separated list, split and trimmed before submission)
  * Output Format: Displays the created note detail matching the single-record format.

* **`update`:** Updates properties of an existing note.
  * Required option: `--id <id>`
  * Optional options: `--title <title>`, `--content <content>`, `--tags <tag1,tag2,...>` (at least one must be provided)
  * Output Format: Displays the updated note detail matching the single-record format.

* **`delete`:** Deletes a note.
  * Required option: `--id <id>`
  * Output Format: No output to `stdout` upon success.

---

## 3. API Client Contracts

The API client in `src/cli/client.ts` maps CLI subcommands directly to REST routes exposed by the NoteAPI.

### Data Models
```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

type CreateNoteInput = Pick<Note, "title" | "content" | "tags">;
type UpdateNoteInput = Partial<CreateNoteInput>;
```

### NoteAPI Endpoint Mappings
| CLI Command | HTTP Method | Endpoint Path | Query Params / Payload | Expected Success Status |
| :--- | :--- | :--- | :--- | :--- |
| `list` | `GET` | `/api/notes` | `tag` (string), `q` (string) | `200 OK` |
| `read` | `GET` | `/api/notes/:id` | None | `200 OK` |
| `create` | `POST` | `/api/notes` | JSON Payload: `CreateNoteInput` | `201 Created` |
| `update` | `PUT` | `/api/notes/:id` | JSON Payload: `UpdateNoteInput` | `200 OK` |
| `delete` | `DELETE` | `/api/notes/:id` | None | `204 No Content` |

### Error Mapping & Handling
When NoteAPI responds with a non-2xx HTTP code:
* The client attempts to parse the response body as JSON.
* If a single string `error` property is present (e.g., `{"error": "Note not found"}`), that string is used as the error message.
* If an `errors` array is present (containing validation issues with `field` and `message` properties), they are joined into a comma-separated string (e.g., `title: is required, content: is required`).
* In any other case, it defaults to a generic HTTP status code message (e.g., `HTTP Error 404`).
* The client throws an `Error` containing this message, which is caught and printed by the entry point.

---

## 4. Exit Codes

To ensure compatibility with automation tools and CI/CD pipelines, the CLI follows strict exit code invariants:

* **`0` (Success):**
  * The requested CRUD subcommand completed successfully.
  * Global or command help menus were requested and displayed.
* **`1` (Failure):**
  * Command-line options failed blank/empty string validation.
  * An invalid subcommand or option structure was provided.
  * The API server returned a non-2xx error.
  * A network or system-level failure occurred (e.g., server offline).

---

## 5. Blank Input Validation Rules

To prevent corrupted or meaningless records in the backend store, the CLI validates option arguments locally:

* **Scope:** Any option passed to the CLI as a string value (e.g. `--id`, `--title`, `--content`, `--tags`, `--tag`, `--q`).
* **Rule:** If the parsed value is a string and, when trimmed, contains zero characters (empty string `""` or whitespace-only `"    "`), the input is rejected.
* **Procedure:**
  1. The validation check executes in `validateOptions()` immediately after argument parsing and before executing any subcommand logic.
  2. If a violation is encountered, the CLI prints a clean message to `stderr`:
     ```text
     Error: <option_name> must not be empty
     ```
  3. The process exits immediately with exit code `1`.
  4. Stack traces and raw JavaScript tracebacks are completely suppressed.
