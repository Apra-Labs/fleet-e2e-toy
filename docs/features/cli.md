# CLI Tool Features Documentation

This document describes the user-facing features, command syntax, option flags, input validation behavior, and help system for the NoteAPI CLI tool.

## 1. Global Version Flag
The CLI provides a global version flag to verify the version of the tool.

- **Commands**: `./tool --version` or `./tool -v`
- **Output**: `fleet-e2e-toy v1.0.0` printed to `stdout`.
- **Exit Code**: `0`
- **Precedence**: This flag works globally alongside any other subcommand or flag. If `-v` or `--version` is present anywhere in the command arguments, the tool immediately prints the version and exits with status code `0`, ignoring all other inputs.

---

## 2. CLI CRUD Subcommands
The CLI tool interacts with the NoteAPI REST service (running on `http://localhost:3000` by default, or configured via the `PORT` environment variable). The following subcommands are supported:

### 2.1 `list`
Lists all notes, with optional filtering by tag or query string.
- **Syntax**: `./tool list [options]`
- **Options**:
  - `-t`, `--tag <tag>`: Filters the listed notes by a specific tag. (Uses the first tag if multiple are provided).
  - `-q`, `--q`, `--query <query>`: Searches and filters notes by a query string.
- **Behavior**: Sends a `GET` request to `/api/notes`. Prints the list of notes in JSON format to `stdout`.
- **Exit Code**: `0` on success, non-zero on API error.

### 2.2 `read`
Retrieves and prints detailed information for a specific note.
- **Syntax**: `./tool read <id>` or `./tool read --id <id>`
- **Options**:
  - `--id <id>`: Specifies the ID of the note to retrieve.
- **Behavior**: Sends a `GET` request to `/api/notes/<id>`. Prints the note details in JSON format to `stdout`.
- **Exit Code**: `0` on success, non-zero on API error (e.g. if the note is not found).

### 2.3 `create`
Creates a new note with the specified title, content, and optional tags.
- **Syntax**: `./tool create <title> [content] [options]` or `./tool create --title <title> --content <content> [options]`
- **Options**:
  - `--title <title>`: Specifies the title of the note (required).
  - `--content <content>`: Specifies the content of the note.
  - `--tag <tag>` / `-t <tag>`: Specifies tags for the note. Multiple tags can be specified by repeating this option (e.g., `-t work -t urgent`).
- **Behavior**: Sends a `POST` request to `/api/notes` with the body containing `title`, `content` (defaults to `""`), and `tags` (defaults to `[]`). Prints the created note details in JSON format to `stdout`.
- **Exit Code**: `0` on success, non-zero on API/validation error.

### 2.4 `update`
Updates an existing note with new title, content, or tags.
- **Syntax**: `./tool update <id> [options]` or `./tool update --id <id> [options]`
- **Options**:
  - `--id <id>`: Specifies the ID of the note to update (required).
  - `--title <title>`: Specifies the new title for the note.
  - `--content <content>`: Specifies the new content for the note.
  - `--tag <tag>` / `-t <tag>`: Specifies the new tags. Replaces the existing tags of the note.
- **Behavior**: Sends a `PUT` request to `/api/notes/<id>` with a body containing only the specified fields. Prints the updated note details in JSON format to `stdout`.
- **Exit Code**: `0` on success, non-zero on API/validation error.

### 2.5 `delete`
Deletes a specific note.
- **Syntax**: `./tool delete <id>` or `./tool delete --id <id>`
- **Options**:
  - `--id <id>`: Specifies the ID of the note to delete (required).
- **Behavior**: Sends a `DELETE` request to `/api/notes/<id>`. Prints nothing or a confirmation message to `stdout`.
- **Exit Code**: `0` on success, non-zero on API error.

---

## 3. Help System
A built-in help system is available globally and on a per-subcommand basis.

- **Commands**: `-h` or `--help`
- **Global Help**: `./tool --help` or `./tool -h` displays global usage instructions and listed subcommands, exiting with status `0`.
- **Subcommand Help**: Adding `-h` or `--help` alongside any subcommand (e.g., `./tool create --help` or `./tool read -h`) prints detailed usage for that specific subcommand and exits with status `0`.

---

## 4. CLI-Level Input Validation
The CLI ensures that arguments are well-formed and validates input constraint rules before making network requests to the API.

- **Whitespace Validation**:
  - The CLI rejects empty (`""`) or whitespace-only (e.g., `"   "`) values for any CLI arguments.
  - An error message is written to `stderr`: `Error: Argument cannot be empty or whitespace-only.`
  - The tool exits with status `1` immediately.
- **Missing Required Option Validation**:
  - Rejects commands missing required parameters (e.g. `read` or `delete` without an ID, `create` without a title).
  - Outputs an error to `stderr` indicating the missing field (e.g., `Error: ID is required.`, `Error: Title is required.`).
  - Exits with status `1`.
- **Clean Execution Logs**:
  - The tool prints user-friendly error messages to `stderr` under validation errors or normal user/API errors.
  - **No stack traces** are printed to the console on user-facing errors, preventing CLI clutter.
