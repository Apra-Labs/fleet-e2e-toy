# Architecture

## CLI Layer

The project has two independent layers: an HTTP API (`src/api/`, `src/app.ts`) and a CLI (`src/cli/`). They share nothing at runtime. The CLI was added as a thin command-line wrapper; it does not talk to the HTTP server.

### CLI Module Structure

```
src/cli/
  types.ts      -- shared interfaces (ParsedArgs, OutputWriter)
  parse.ts      -- hand-rolled argv parser
  output.ts     -- output abstraction (text vs JSON mode)
  run.ts        -- command dispatcher; returns Promise<number>
  tempfiles.ts  -- module-level registry of files created during a run
  signals.ts    -- injectable SIGINT handler factory
  index.ts      -- process shim: wires SIGINT, calls run(), calls process.exit()
```

### Key Architectural Decisions

**`run()` never calls `process.exit`.**
The dispatcher (`run.ts`) returns a `Promise<number>` exit code. Only the shim (`index.ts`) calls `process.exit`. This keeps the dispatcher fully unit-testable without process teardown.

**`index.ts` is the only home for process-level concerns.**
SIGINT registration, `process.exit`, and `process.argv` slicing all live exclusively in `index.ts`. The shim is excluded from coverage; all testable logic lives in other modules. This boundary is enforced by the jest coverage exclusion for `src/cli/index.ts`.

**No external CLI framework.**
The argument parser (`parse.ts`) is hand-rolled. No yargs, commander, or similar dependency was introduced. The parser is intentionally minimal: it recognises a fixed set of global flags (`--version`/`-v`, `--json`, `--help`/`-h`) and treats the first non-flag token as the subcommand.

**Output routing via `OutputWriter` interface.**
All output in `run.ts` goes through an `OutputWriter` instance. Direct `process.stdout.write` calls are prohibited in `run.ts` outside the writer implementation. This guarantees that JSON mode never interleaves human text with structured output, and that tests can spy on output without patching I/O globally.

**Dual-mode output with no-op contract.**
`createOutputWriter(json)` returns a writer whose inactive methods are no-ops (`text()` in JSON mode, `json()` in text mode). Callers may call both unconditionally when producing parallel text/JSON representations; the correct one will emit and the other will silently discard. This is the approved pattern but relies on the no-op contract remaining stable.

**SIGINT handler is a pure injectable factory.**
`createSigintHandler(deps)` takes `cleanup`, `write`, and `exit` as injected dependencies. The production shim passes `cleanupAll`, `process.stderr.write`, and `process.exit`. Tests pass jest mock functions. This makes the handler unit-testable without sending a real signal and without process teardown.

**Interrupt message goes to stderr, not stdout.**
The SIGINT handler writes `Interrupted.\n` to stderr so that any JSON already emitted on stdout remains parseable. A JSON-formatted interrupt message is intentionally out of scope; the message is always plain text regardless of the `--json` flag state (the flag is not available to the shim at signal time).

**Temp-file registry is module-level state.**
`tempfiles.ts` uses a module-level array as the registry. Commands register files they create; `cleanupAll` deletes them best-effort (swallows errors) and clears the registry. The SIGINT handler calls `cleanupAll` before exiting so partial output files are removed on interrupt.

### Testing Conventions

- CLI tests use plain Jest with spies on `process.stdout.write` / `process.stderr.write`, restored in `afterEach`. They import and invoke functions directly.
- HTTP API tests use supertest against the Express app.
- The two shims (`src/index.ts`, `src/cli/index.ts`) are excluded from coverage because they cannot be unit-tested without process teardown.
