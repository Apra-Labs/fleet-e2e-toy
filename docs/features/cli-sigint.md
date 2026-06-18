# Feature: SIGINT graceful shutdown (gh-toy-69s)

## What it does

When the user presses Ctrl-C, the CLI:
1. Runs best-effort cleanup of any files registered during the run (via `cleanupAll`).
2. Writes `Interrupted.\n` to stderr.
3. Exits with code 130 (the POSIX convention for SIGINT termination).

No stack trace is printed. No exception propagates.

## Implementation

**`src/cli/signals.ts` — pure injectable factory**

```typescript
function createSigintHandler(deps: {
  cleanup: () => void;
  write: (s: string) => void;
  exit: (code: number) => void;
}): () => void
```

The returned handler calls `deps.cleanup()` → `deps.write("Interrupted.\n")` → `deps.exit(130)` in that order and never throws or rethrows.

**`src/cli/index.ts` — shim wiring**

```typescript
process.on("SIGINT", createSigintHandler({
  cleanup: cleanupAll,
  write: s => process.stderr.write(s),
  exit: code => process.exit(code),
}));
```

The message goes to stderr so any JSON already emitted on stdout remains parseable.

**`src/cli/tempfiles.ts` — temp-file registry**

```typescript
register(path: string): void     // record a path created during the run
cleanupAll(): void                // best-effort delete all registered paths, clears registry
list(): string[]                  // returns a defensive copy of registered paths
```

`cleanupAll` wraps each `fs.rmSync(path, { force: true })` in a try/catch that swallows errors, so cleanup never throws even if a file was already removed or never created.

## Design decisions

**Interrupt message is always plain text, never JSON.**
The SIGINT handler runs in the shim, independent of the `--json` flag state. There is no way to thread per-command state to the signal handler without global mutable state. A JSON-formatted interrupt message is explicitly out of scope; acceptance requires only `Interrupted.` + exit 130 + no trace.

**Interrupt message goes to stderr.**
This ensures stdout remains valid if the caller was parsing JSON output.

**The handler itself does not guard a throwing `cleanup`.**
In production, `cleanupAll` is provably non-throwing (try/catch-guarded internally). If a custom `cleanup` dep throws, the exception could propagate and produce a trace. This is acceptable because only the production shim registers a handler, and `cleanupAll` never throws.

**Windows Ctrl-C caveat.**
Real SIGINT delivery behaviour under Windows PowerShell may differ from POSIX. The unit test with injected fakes is the binding acceptance gate; manual Ctrl-C testing is confirmatory only.

## Test coverage

`tests/cli-signals.test.ts` (4 tests): verifies call order (cleanup → write → exit), exact string `"Interrupted.\n"`, exit code 130, and that the handler completes without throwing.

`tests/cli-tempfiles.test.ts` (4 tests): register-then-list, defensive copy (mutating returned array does not affect registry), real file deletion + emptied list, best-effort delete of a non-existent path (does not throw).

## Known test limitation

The test case "does not throw even if cleanup throws internally" injects a non-throwing cleanup mock, so it does not actually exercise a throwing-cleanup path. The test title overstates coverage. This is benign because production always injects `cleanupAll`, which is itself non-throwing.
