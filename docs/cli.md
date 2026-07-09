# CLI: fleet-e2e-toy

`src/cli.ts` is a standalone command-line client for the NoteAPI Express server.
It is a new entry point added in this sprint; it does not modify any existing
API routes, models, or validation helpers.

## Architecture decision: HTTP client, not embedded server

The CLI is a **separate HTTP client** that talks to an already-running NoteAPI
server over `fetch` (Node's built-in global fetch, available since Node 18+ —
confirmed on Node 22 for this project). It does not start, embed, or import the
Express app.

This was the riskiest assumption going into the sprint and was resolved before
any subcommand work began: `src/index.ts` already boots the server standalone
on a configurable port, and the API layer has no CLI hooks. Given that, the
lowest-friction and most conventional shape for a CLI companion to an existing
REST service is a thin HTTP client, not a second process model bolted onto the
server. This also keeps the CLI decoupled from server internals — it only
depends on the public HTTP contract of `/api/notes`, so the two can evolve or
be deployed independently.

**Trade-off accepted:** the CLI requires a NoteAPI server to already be running
somewhere reachable. There is no "batteries-included" mode where a single CLI
invocation both starts the server and performs an action. This was considered
out of scope deliberately — the sprint's acceptance criteria only describe a
client against the API, and adding process-lifecycle management to the CLI
would have introduced complexity (port conflicts, shutdown handling) unrelated
to the three source issues.

**No new dependencies:** the CLI uses Node's built-in `fetch` and a hand-rolled
`process.argv` parser rather than pulling in `commander` or `yargs`. For 5
subcommands with at most 3 flags each, a dependency-free parser was judged
sufficient and keeps the dependency surface unchanged.

## Configuration: NOTEAPI_URL

The CLI's target server is configured via the `NOTEAPI_URL` environment
variable, defaulting to `http://localhost:3000` if unset. There is no CLI flag
for this — it is environment-only, consistent with the CLI being a client
against a separately-managed server (the base URL is a deployment/environment
concern, not a per-invocation one).

Note: the workshop's `CLAUDE.local.md` runs the server on port 3001 locally, so
local CLI usage requires `NOTEAPI_URL=http://localhost:3001` to match.

## Command surface

Invocation shape: `fleet-e2e-toy <subcommand> [flags]`.

| Subcommand | Flags | HTTP call | Notes |
|---|---|---|---|
| `list` | `--tag <tag>` (optional), `--q <query>` (optional) | `GET /api/notes` with matching query params | No required flags; omitting both lists all notes |
| `read` | `--id <id>` (required) | `GET /api/notes/:id` | |
| `create` | `--title <title>` (required), `--content <content>` (required), `--tags <csv>` (optional) | `POST /api/notes` | `--tags` is a comma-separated list, split and trimmed into a string array; defaults to `[]` |
| `update` | `--id <id>` (required), `--title`, `--content`, `--tags` (all optional) | `PUT /api/notes/:id` | Only the flags actually supplied are sent in the request body — an omitted flag leaves that field unchanged server-side |
| `delete` | `--id <id>` (required) | `DELETE /api/notes/:id` | On success prints `{ "deleted": "<id>" }` since the API returns 204 with no body |

### Output contract

- Successful subcommand invocations pretty-print the JSON response body to
  stdout and exit 0.
- Any failure — a non-2xx HTTP response from NoteAPI, or a network-level
  failure to reach the server — is caught, normalized into
  `{ "error": "<message>" }`, pretty-printed to **stderr**, and the process
  exits with code 1. This mirrors the existing repo-wide convention (see
  `CLAUDE.md`: "Never return raw error objects to the client") applied to the
  CLI's own output instead of the API's.
- No stack trace is ever surfaced to the user for either a validation error or
  an API error — all thrown errors are caught at the top-level runner and
  reformatted.

## Help system

- `fleet-e2e-toy --help` / `-h` with no subcommand prints global usage (lists
  all 5 subcommands) to stdout and exits 0.
- `fleet-e2e-toy <subcommand> --help` / `-h` prints that subcommand's own
  usage (its flags and a one-line description) to stdout and exits 0.
- Running the CLI with no subcommand and no `--help` prints the same usage
  text to **stderr** and exits 1 (distinguishing "user asked for help" from
  "user gave invalid/incomplete input", which is a fast-fail rather than a
  documented mode).
- An unrecognized subcommand is treated the same as no subcommand: usage to
  stderr, exit 1.

## --version / -v

`--version` / `-v` prints `fleet-e2e-toy v1.0.0` to stdout and exits 0. This
check happens **before** any other dispatch — before help handling and before
subcommand/flag validation — so it takes effect regardless of what else is on
the command line (e.g. `fleet-e2e-toy list --version` still just prints the
version and exits). This ordering was an explicit acceptance criterion, not an
incidental implementation detail: version reporting must never be blocked by
an otherwise-invalid invocation.

## Input validation

Every required flag (`--id`, `--title`, `--content`) is checked with a single
shared helper that rejects three cases identically: the flag is absent, the
flag's value is an empty string, or the flag's value is whitespace-only (e.g.
`--title "  "`). All three produce the same error shape:

```
Error: <field> is required and must not be empty
```

on stderr, exit code 1 — no stack trace. Validation happens inside each
subcommand handler before any network call is made, so invalid input never
reaches NoteAPI.

## Testing approach

`tests/cli.test.ts` exercises the CLI by starting the real Express `app` on an
ephemeral port and pointing `NOTEAPI_URL` at it, then invoking the CLI's `run()`
entry point directly (rather than mocking the network layer or `fetch`). This
was chosen over supertest-style in-process testing (used elsewhere in this
repo for the API itself) because the CLI's own contract is the HTTP round trip
— what it sends and how it renders the response and errors — so exercising a
live listener is the more faithful test for this component.
