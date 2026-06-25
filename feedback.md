CHANGES NEEDED

## Findings

### gh-toy-b4q.5 — CRUD test suite fails: spawned CLI cannot reach the express stub

Acceptance criterion (4) requires: CRUD subcommands hit the right HTTP endpoint and exit 0
on success, tested via a mocked fetch or supertest-driven express stub. npm test must pass.

The current implementation starts an in-process Express stub in `beforeAll`, then calls
`spawnSync("node", [CLI, ...args])` for each CRUD test. On this environment, the spawned
subprocess cannot reliably connect to the stub server running in the Jest parent process:
all 7 CRUD tests fail with exit code 1 and either "fetch failed" (connection never completes)
or a network timeout of ~306 seconds per test.

Verified: the CLI itself is correct — when run against a live server (`PORT=19001 npm start`)
it exits 0 and prints valid JSON. The fault is the test design, not the CLI logic.

The fix is to change the CRUD test section to inject fetch behavior without spawning a child
process. Two acceptable approaches:
1. Import the CLI action handlers directly (not the full `program.parseAsync` entry point) and
   call them in-process, stubbing the `request` function from `src/cli/http.ts` with
   `jest.mock('../src/cli/http')`.
2. Keep the `spawnSync` approach but add a `timeout` to `spawnSync` and use
   `http.createServer` bound explicitly to `127.0.0.1` with a fixed port, verifying the
   server is reachable from a spawned process before running the tests.

Tasks gh-toy-b4q.2, gh-toy-b4q.3, and gh-toy-b4q.4 all meet their acceptance criteria
(build passes, lint passes, --version/-V prints exactly "fleet-e2e-toy v1.0.0", --help/-h
exit 0, input validation rejects empty/whitespace, CRUD subcommands call the correct HTTP
methods and paths, update requires at least one field, delete prints confirmation). The
failing tests are exclusively in the CRUD describe block introduced by gh-toy-b4q.5.

Test results summary:
- 32 tests pass (version, help, input validation, and all existing API/validation tests)
- 7 tests fail (the CLI CRUD subcommand assertions in tests/cli.test.ts)

reopenIds: ["gh-toy-b4q.5"]
newTasks: []
