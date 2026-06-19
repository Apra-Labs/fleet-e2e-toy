# Architecture Decisions

## CLI invoked via ts-node, not compiled binary

**Decision:** The CLI is invoked with `ts-node src/cli/index.ts` in development and tests. The `npm run cli` script wraps this. The compiled `dist/cli/index.js` is the production target referenced by `package.json` `bin.noteapi`.

**Rationale:** All sprint tests run against the source directly via `ts-node` to avoid a build step in the test cycle. The `bin` entry is wired for future global-install use.

**Constraint:** `src/cli/index.ts` does not have a `#!/usr/bin/env node` shebang. A globally-installed `noteapi` binary (from `npm link` or `npm install -g`) will not execute without the shebang being added. This was not required for any sprint task and is tracked as a known follow-up.

## NOTEAPI_URL environment variable for API base URL

**Decision:** The CLI API client reads the server base URL from `process.env.NOTEAPI_URL`, defaulting to `http://localhost:3000`.

**Rationale:** E2e tests spin up the API server on port 3001 (via `start:test` script using `cross-env PORT=3001`) to avoid conflicts with a running dev server. The tests set `NOTEAPI_URL=http://localhost:3001` so the CLI under test points at the test server. No hardcoded ports appear in test assertions.

## --key=value as the canonical flag form

**Decision:** The argument parser supports both `--key=value` and `--key value` forms, but `--key=value` is the form used in all tests and documentation.

**Rationale:** The `--key value` form has an edge case: any next argument starting with `-` is treated as a new flag rather than the value. This would silently drop the intended value. Using `--key=value` avoids this entirely. The constraint is documented in `docs/cli-architecture.md`.

## Validation before API call, error to stderr with exit 1

**Decision:** Every CLI handler validates required inputs using `validateRequired` from `src/cli/validate.ts` before making any network call. On any error (validation or API) the handler writes to `stderr` and the process exits with code 1. On success it writes JSON to `stdout` and exits 0.

**Rationale:** Consistent with Unix conventions. Separating the validation helper into its own module allows it to be unit-tested independently of the HTTP layer, and keeps handlers thin.

## In-memory store (no database)

**Decision:** The NoteAPI uses an in-memory JavaScript array as its data store. No database is installed or planned.

**Rationale:** The project is a demo prop for the Agentic AI Workshop. Persistence across server restarts is not a requirement, and a database would add setup friction for workshop participants. The CLAUDE.md explicitly prohibits installing a database.

## Single file per resource in src/api/

**Decision:** Each API resource lives in its own file under `src/api/`. Route handlers validate inputs using helpers from `src/utils/validation.ts` before processing.

**Rationale:** Keeps the codebase navigable. The CLAUDE.md encodes this as a project convention.
