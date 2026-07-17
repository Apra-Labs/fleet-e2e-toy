# Design: CLI Tool for NoteAPI

This document outlines the design decisions and architecture for the NoteAPI CLI tool.

## 1. CLI Entrypoint
- We will add `src/cli.ts` as the entrypoint for the CLI logic.
- We will create a wrapper script `./tool` in the repository root that delegates to `ts-node src/cli.ts` (with executable permissions).

## 2. Argument Parsing and Subcommand Routing
- The CLI will parse options manually or use simple argument parsing to avoid external dependencies.
- It will parse:
  - Global flags: `-v`, `--version`, `-h`, `--help`
  - Subcommands: `list`, `read`, `create`, `update`, `delete`
  - Subcommand flags: `--tag`, `--q`, `--id`, `--title`, `--content`

## 3. API Communication
- The CLI will use `fetch` (native Node.js fetch available in Node.js v20+) to communicate with the REST API.
- The NoteAPI base URL will default to `http://localhost:3000`. If an environment variable `PORT` is defined, it will use `http://localhost:<PORT>`.

## 4. Input Validation
- The CLI will call `src/utils/validation.ts` helpers or check string completeness:
  - Reject arguments if they are empty or contain only whitespace.
  - Required parameters for subcommands must be present.
- On failure, output error to `stderr` and exit with `1`.

## 5. Output Formatting
- On success, the API response (or relevant output) is printed to `stdout` in JSON format or user-friendly string format as appropriate.
- No debug or trace logs should be output under normal execution.
