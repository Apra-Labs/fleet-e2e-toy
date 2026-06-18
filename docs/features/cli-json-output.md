# Feature: --json global flag (gh-toy-aqd)

## What it does

`--json` is a global flag accepted on any subcommand. When set, all command output is emitted as a single valid JSON document on stdout. Without it, output is human-readable text (default).

## Flag parsing

`parseArgs` recognises `--json` positionally-independently — it can appear before or after the subcommand name. The resulting `ParsedArgs.json` boolean is threaded into `createOutputWriter(json)`.

## Output contract

| Condition | Stdout | Stderr | Exit code |
|-----------|--------|--------|-----------|
| Success, text mode | Human-readable text | — | 0 |
| Success, JSON mode | Single valid JSON document | — | 0 |
| Error, text mode | — | `Error: <message>` | non-zero |
| Error, JSON mode | `{"error":"<message>"}` | — | non-zero |

In JSON mode, `OutputWriter.text()` is a no-op so no human text can interleave with the JSON stream. In text mode, `OutputWriter.json()` is a no-op.

## OutputWriter interface

```typescript
interface OutputWriter {
  text(s: string): void;   // human-readable; no-op in JSON mode
  json(o: unknown): void;  // structured; no-op in text mode
  error(msg: string): void; // routes to stdout (JSON) or stderr (text)
}
```

`createOutputWriter(json: boolean): OutputWriter` constructs the correct implementation.

## Demonstrated by the `write` subcommand

`fleet-e2e-toy write <filename>` writes a file and reports success:

- Text: `Wrote <filename>` on stdout, exit 0.
- JSON: `{"command":"write","path":"<filename>","status":"ok"}` on stdout, exit 0.
- Missing filename (text): `Error: write requires a filename` on stderr, exit 1.
- Missing filename (JSON): `{"error":"write requires a filename"}` on stdout, exit 1.

The file is registered with the temp-file registry (`register(filename)`) so it is cleaned up on SIGINT.

## Key invariants

- All `run.ts` output must go through `OutputWriter` — direct `process.stdout.write` is prohibited in `run.ts` outside the writer implementation.
- Errors always produce a non-zero exit code, regardless of output mode.
- JSON-mode errors go to stdout (not stderr) so the caller can parse them; text-mode errors go to stderr.

## Test coverage

`tests/cli-json.test.ts` (4 tests): JSON success, text success (assert NOT JSON), JSON error, text error. Exercises both `OutputWriter.error()` branches.
