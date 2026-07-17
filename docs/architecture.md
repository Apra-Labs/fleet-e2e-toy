# CLI Architecture and Design Decisions

This document outlines the architectural decisions, design choices, and implementation details for the NoteAPI CLI tool.

## 1. Directory Structure and Entrypoints
The CLI tool is structured to separate development execution from production builds, keeping code organized:

- **Wrapper Script (`./tool`)**: Located at the root. It dynamically routes execution. If the compiled JavaScript exists at `dist/tool.js`, it loads and executes that directly using `node`. Otherwise, it registers `ts-node/register` on the fly to run `src/tool.ts`. This ensures zero-friction development cycles without manual build steps.
- **CLI Logic (`src/tool.ts`)**: Contains the core CLI parsing, command validation, output print helpers, and REST integration.
- **Validation Helpers (`src/utils/validation.ts`)**: Encapsulates common string verification rules used by both the REST API server and the CLI front-end.

---

## 2. Argument Parsing Design
To keep dependencies minimal and installation fast, the CLI uses a custom argument parser instead of heavy third-party packages (like Commander or Yargs):

- **Positional Mapping**: It reads arguments sequentially. If command names are missing their explicit flags, positional mapping assigns parameters (e.g. `./tool read <id>` maps positional index 1 to the required ID, and `./tool create "Title" "Content"` maps positionals to title and content).
- **Flag Parsing**: Handles optional tag, query, ID, title, and content flags explicitly (e.g. `--tag`, `-t`, `--id`, `--title`, `--content`, `--q`, `--query`).
- **Immediate Interceptors**: Pre-scans arguments for global flags (`--version`, `-v`, `--help`, `-h`) and exits early. This ensures version/help requests are handled before validating subcommands.

---

## 3. Communication Strategy
- **Native Fetch Client**: Communicates with NoteAPI using Node.js's built-in `fetch` API (introduced natively in Node 18+ and fully stable in v20+). No external dependencies like Axios are needed.
- **Service URL Configuration**:
  - Defaults to `http://localhost:3000`.
  - Dynamically switches to `http://localhost:<PORT>` if the `PORT` environment variable is defined.
- **REST Endpoints**:
  - `GET /api/notes` (with optional `tag` and `q` search queries).
  - `GET /api/notes/:id`
  - `POST /api/notes` (sends JSON body with `title`, `content`, and `tags`).
  - `PUT /api/notes/:id` (sends partial JSON updates).
  - `DELETE /api/notes/:id`

---

## 4. Validation Architecture
Validation is unified in `src/utils/validation.ts` and split into logical parts:

- **API Payload Validation**:
  - `validateCreateInput(body)`: Validates incoming POST requests to ensure `title` is present and non-empty, and checks the types of `content` and `tags`.
  - `validateUpdateInput(body)`: Validates PUT requests, ensuring type correctness of updated attributes (e.g. non-empty title if provided).
- **CLI Argument Constraint Validation**:
  - `validateCliArgument(value, argName)`: Ensures CLI inputs are not empty or solely whitespace. If invalid, throws an `Error` that the CLI catches to display a clean warning without stack traces.

---

## 5. Testing Strategy
The CLI codebase is extensively covered by automated tests under `tests/cli.test.ts` and `tests/validation.test.ts`:

- **Unit Testing**:
  - Mocks `process.exit` and spies on `console.log`/`console.error`.
  - Asserts version flag behavior, help output, and validation errors.
- **Integration Testing**:
  - Directly executes the `./tool` binary using `spawnSync` to verify shell exit codes and console output.
  - Spins up a real Node.js REST server instance dynamically on a random free port, runs a full CRUD lifecycle (Create -> List -> Read -> Update -> Delete) through the CLI, and then terminates the server safely.
