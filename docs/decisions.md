# Architecture Decisions

## ADR-001: No YAML library dependency for config parsing

The config file (`~/.fleet-e2e-toy.yaml`) is parsed with a hand-rolled scanner that handles only top-level `key: value` scalar lines. Nested structures, lists, and multi-line values are silently ignored.

**Why:** The config schema has exactly one key (`url`). Adding a YAML dependency (js-yaml, yaml, etc.) for a single scalar would increase the install footprint, introduce a supply-chain surface, and require ongoing maintenance. The hand-rolled parser is ~30 lines and is sufficient for the defined schema.

**Constraint:** If the config schema ever grows to include nested objects or lists, the parser must be replaced with a real YAML library. The `parseSimpleYaml` function in `src/cli/config.ts` is the only place to change.

## ADR-002: API client base URL is module-level (not per-call)

`apiClient.ts` resolves `baseUrl` once at import time by calling `loadConfig()` and checking `NOTEAPI_URL`. All subsequent API calls use this fixed URL.

**Why:** Simplicity. The CLI is a single-shot process; there is no need to re-resolve the URL on every call. It also keeps individual API functions free of configuration logic.

**Constraint:** Tests that need to override the base URL must set `NOTEAPI_URL` before the module is first imported. Because Node.js caches modules, the environment variable must be in place before `require`/`import` of `apiClient`. Jest's module isolation (each test file gets a fresh module registry) makes this workable in practice.

## ADR-003: All errors to stderr as JSON; no stack traces

`cli.ts` catches all errors at the top level and serialises them as `{ "error": "<message>" }` on stderr. Unknown errors produce a generic message. Stack traces are never emitted.

**Why:** The CLI is intended to be composed with scripts and other tools. JSON on stderr makes errors machine-readable. Suppressing stack traces prevents leaking internal implementation details and keeps output clean.

**Constraint:** Developers debugging the CLI cannot rely on stack traces in normal operation. Use `NODE_OPTIONS=--stack-trace-limit=20` or a debugger attached to the process for local investigation.

## ADR-004: Pure parse.ts with no process access

`parse.ts` is a pure function that maps `string[]` to `ParsedArgs`. It never reads `process.argv`, writes to stdout/stderr, or accesses the filesystem.

**Why:** Makes the parser trivially unit-testable. Any test can call `parseArgs([...])` with a synthetic argv without any mocking or side-effect cleanup.

**Constraint:** Any future enhancement to the parser must preserve this purity. If new behaviour requires side effects (e.g. reading an env var), that logic must go in the caller (`cli.ts`) or in a separate module.

## ADR-005: Client-side tag filtering in list command

The `list` command applies `--tag` filtering locally after receiving the full notes list from the server. The server already supports `?tag=` as a query parameter.

**Why:** The CLI was implemented against the existing `listNotes(query?)` signature in `apiClient.ts`, which only threads through the `?q=` parameter. Adding a `tag` parameter to the API client function was deferred as the in-memory store makes the performance difference negligible in the demo context.

**Constraint:** This is inefficient at large dataset sizes. If the note count grows significantly, `listNotes` should be extended to accept a `tag` parameter that maps to `?tag=` on the request URL.

## ADR-006: SIGINT handled globally in cli.ts entry module

`process.on("SIGINT", ...)` is registered at the top level of `cli.ts`. It writes "Interrupted.\n" to stderr and calls `process.exit(130)`.

**Why:** Exit code 130 is the POSIX convention for SIGINT-terminated processes (`128 + signal_number`). Handling it globally ensures any command in flight is interrupted cleanly with a predictable exit code, without requiring each command handler to register its own signal handler.

**Constraint:** The SIGINT handler is registered at module load time. Tests that import `cli.ts` will have this handler active. Tests should not rely on catching SIGINT themselves.
