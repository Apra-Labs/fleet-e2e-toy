# CLI Architecture

## Entrypoint
- **File:** `src/cli.ts` (compiled to `dist/cli.js`)
- **Build:** TypeScript → compiled via `tsconfig.json` with `outDir: "./dist"` and `rootDir: "./src"`
- **Invocation:** `node dist/cli.js [args...]` (no npm bin entry; direct Node invocation)
- **Shebang:** `#!/usr/bin/env node` for future shell script compatibility

## Argument Resolution and Precedence Order
Flags are resolved in strict order with immediate exit on first match (D3):

1. **`--version` / `-v`** → print `fleet-e2e-toy v1.0.0` to stdout, exit 0
2. **`help` / `--help` / `-h`** → print help text to stdout, exit 0
3. **Positional arguments** → validate each via `validateNonBlank()`; if any invalid, print error to stderr, exit 1
4. **No args** → print help text and exit 0 (deterministic fallback, avoids silent no-op)

Implemented in `main(argv: string[]): number` function; argv is `process.argv.slice(2)`.

## Input Validation
**Function:** `validateNonBlank(value: string, argName: string): void` from `src/utils/validation.ts`

- Throws `Error` if value is not a string or its trimmed length is zero
- Error message format: `"Error: {argName} must not be empty or blank"`
- CLI catches at top level and writes message to `process.stderr`, exits 1

## Help Text
Hardcoded in CLI (no external file):
```
Usage: fleet-e2e-toy [command|flags] [args...]

Commands:
  help                  Show this help text

Flags:
  --version, -v         Print the CLI version and exit
  --help, -h            Show this help text and exit
```
Output to stdout, exit 0.

## Testing Strategy
**File:** `tests/cli.test.ts`

- Uses `spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8" })` to invoke compiled CLI as a subprocess
- `spawnSync` + `process.execPath` ensures cross-platform portability (Windows + Linux CI)
- Tests verify stdout/stderr content and exit codes (`.status` property)
- Smoke tests cover: --version/-v, help/--help/-h, precedence, empty/blank validation

**Build before test:** `package.json` has `"pretest": "npm run build"` so `npm test` rebuilds `dist/cli.js` automatically before Jest runs.

## Design Decisions
- **No external CLI framework** (no commander, yargs, minimist) — plain argv array iteration
- **Synchronous only** — no async I/O in CLI (imperative exit via `process.exit()` is safe)
- **Version hardcoded** — no `package.json` lookup at runtime
- **Node built-ins only** — uses `process`, `console`, `child_process.spawnSync` for tests
