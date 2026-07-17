# Requirements: CLI Tool for NoteAPI

This document specifies the requirements for the command-line interface (CLI) to interact with NoteAPI.

## 1. Version Flag
- **Command**: `./tool --version` or `./tool -v`
- **Output**: `fleet-e2e-toy v1.0.0` on stdout.
- **Exit Code**: `0`
- **Behavior**: Works globally alongside other flags (if version is requested, print version and exit 0 immediately).

## 2. CLI CRUD Subcommands
The CLI tool must communicate with the NoteAPI REST service (typically running on `http://localhost:3000` or configured port) and support the following subcommands:

### 2.1 `list`
- **Flags**:
  - `--tag <tag_name>` (optional filter)
  - `--q <query_string>` (optional search query filter)
- **Behavior**: Retrieves notes from the API and prints the list to stdout.
- **Exit Code**: `0` on success, non-zero on API error.

### 2.2 `read`
- **Flags**:
  - `--id <note_id>` (required)
- **Behavior**: Retrieves the specific note by ID and prints its details to stdout.
- **Exit Code**: `0` on success, non-zero on API error.

### 2.3 `create`
- **Flags**:
  - `--title <title>` (required)
  - `--content <content>` (required)
- **Behavior**: Sends a POST request to NoteAPI to create a new note with the given title and content. Prints the created note details to stdout.
- **Exit Code**: `0` on success, non-zero on API error.

### 2.4 `update`
- **Flags**:
  - `--id <note_id>` (required)
  - `--title <title>` (optional)
  - `--content <content>` (optional)
- **Behavior**: Sends a PUT request to NoteAPI to update the specified note. Prints the updated note details to stdout.
- **Exit Code**: `0` on success, non-zero on API error.

### 2.5 `delete`
- **Flags**:
  - `--id <note_id>` (required)
- **Behavior**: Sends a DELETE request to NoteAPI to delete the specified note. Prints a confirmation message or results on stdout.
- **Exit Code**: `0` on success, non-zero on API error.

## 3. Help System
- **Command**: `--help` or `-h` globally or per subcommand (e.g., `./tool create --help`, `./tool --help`).
- **Output**: Detailed usage description of the CLI tool or the specific subcommand, listing options and usage syntax.
- **Exit Code**: `0`

## 4. Input Validation
- **Requirement**: The CLI must validate inputs before making API requests.
- **Validation Rules**:
  - Reject empty or whitespace-only values for required arguments (e.g., `--id`, `--title`, `--content`).
  - Validation failures must print a clear, user-friendly error message to stderr.
  - The tool must exit with a non-zero exit code (e.g., `1`) upon validation failure.
  - **No stack traces** should be displayed in the output when input validation fails or on regular user errors.
