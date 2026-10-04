# CLI blank-argument rejection

## Behaviour

At startup `src/index.ts` scans `process.argv.slice(2)`. If any token is empty or
whitespace-only, it writes one line to stderr and exits with status 1:

`Error: arguments must not be empty or whitespace-only (got a blank argument at position N)`

`N` is the 1-based position of the first blank token. No stack trace is printed and the
server never binds a port.

## Design notes

- The check runs **before** the `--version`/`-v` handling and before `app.listen`. A blank
  token therefore always wins: `--version ""` and `"" --version` both fail with status 1
  and do not print the version.
- Detection lives in `src/utils/validation.ts` as two pure helpers: `isBlank`
  (`trim().length === 0`) and `findBlankArgs` (returns 0-based indices of blank tokens).
  `index.ts` is the only caller.
- Output uses `process.stderr.write`, not `console.log`, consistent with the project rule
  against console logging for non-server output. The SIGINT handler is unaffected.

## Testing

- `tests/validation.test.ts` unit-tests the helpers (empty, spaces, tab, newline and mixed
  whitespace are blank; `a`, ` a `, `--version` are not).
- `tests/cli-args.test.ts` spawns ts-node with `spawnSync` (dedicated port, SIGKILL
  timeout so a regression that starts the server cannot hang the suite) and asserts exit
  status 1, the message, the position, no `NoteAPI running` line, and no stack frames. A
  control case confirms `--version` alone still exits 0.
- Known gaps (tracked as backlog): no test combines `-v` with a blank token, and none
  asserts stderr is exactly one line.
