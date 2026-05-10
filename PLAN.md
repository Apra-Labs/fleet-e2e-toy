# fleet-e2e-toy — Implementation Plan

> Add a CLI entry point to fleet-e2e-toy with `--version`, empty-string input validation, and a `help` command (Issues #1, #2, #3).

---

## Tasks

### Phase 1: CLI Entry Point

#### Task 1: Add --version / -v flag to CLI
- **Change:** Create `src/cli.ts` as the new CLI entry point. Export a `runCli(args: string[])` function that returns `{ exitCode: number; output: string }` so tests can call it without spawning a process. When `--version` or `-v` is in args, read the project name and version from `package.json` and return `fleet-e2e-toy v<version>` with exit code 0. Add a thin `if (require.main === module)` guard that calls `runCli(process.argv.slice(2))`, prints the output, and calls `process.exit(exitCode)`.
- **Files:** `src/cli.ts` (new)
- **Tier:** cheap
- **Done when:** `ts-node src/cli.ts --version` prints `fleet-e2e-toy v1.0.0` and exits 0. `ts-node src/cli.ts -v` does the same. A Jest test calling `runCli(["--version"])` asserts the returned output contains the version string and exitCode is 0.
- **Blockers:** None; `resolveJsonModule: true` is already set in tsconfig.json so importing package.json is safe.

#### Task 2: Add input validation for empty or blank strings
- **Change:** Add a `validateCliArg(value: string): string | null` function to `src/utils/validation.ts` — returns `null` if valid, or an error message string if the value is empty or whitespace-only. In `src/cli.ts`, call this on any positional argument the user passes; if invalid, set output to `Error: input must not be empty` and exitCode to 1. Add two unit tests in `tests/validation.test.ts` in a new `validateCliArg` describe block: one for `""` and one for `"   "`.
- **Files:** `src/utils/validation.ts`, `src/cli.ts`, `tests/validation.test.ts`
- **Tier:** cheap
- **Done when:** `runCli([""])` returns `{ exitCode: 1, output: "Error: input must not be empty" }`. `runCli(["   "])` does the same. Both new Jest tests pass. `npm test` still green.
- **Blockers:** None.

#### Task 3: Add help subcommand and --help / -h flag
- **Change:** In `src/cli.ts`, detect `help` as the first positional argument or `--help` / `-h` anywhere in args. When triggered, return a formatted usage string listing every subcommand (with a one-line description) and every flag (with type and default value), and exitCode 0. The help output must cover: `help` subcommand, `--version`/`-v` flag (type: flag, default: false), `--help`/`-h` flag (type: flag, default: false).
- **Files:** `src/cli.ts`
- **Tier:** standard
- **Done when:** `runCli(["help"])` and `runCli(["--help"])` and `runCli(["-h"])` all return exitCode 0 and output that contains the strings `help`, `--version`, and `--help`. Jest tests assert these. Running `ts-node src/cli.ts help` manually shows formatted usage.
- **Blockers:** None, but the help output format must be stable enough for string-matching tests.

#### VERIFY: Phase 1 — CLI Entry Point
- Run `npm run build` — TypeScript compile must succeed with no errors
- Run `npm test` — all Jest tests (existing + new) must pass
- Manually confirm: `ts-node src/cli.ts --version`, `ts-node src/cli.ts help`, `ts-node src/cli.ts --help`, `ts-node src/cli.ts ""` all produce correct output and exit codes
- Report: tests passing, any regressions, any issues found
- Push: `git push origin e2e-s1-25620232517/version-validation-help`

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| `process.exit()` in CLI kills Jest process | high | Export `runCli()` returning `{ exitCode, output }`; only call `process.exit` in the `require.main` guard — never inside the exported function |
| TypeScript strict mode rejects JSON import | med | `resolveJsonModule: true` already in tsconfig.json; type-assert as `{ name: string; version: string }` |
| Empty string passed via shell is swallowed before reaching the process | low | Test via `runCli([""])` unit test instead of shell exec; the unit test is the authoritative acceptance gate |
| Adding `validateCliArg` changes behavior of existing REST API validation | low | Add as a new export to `validation.ts`; do not modify `validateCreateInput` or `validateUpdateInput` |

## Notes
- Each task results in one git commit
- VERIFY is a checkpoint — stop and report after it; do not proceed past it without PM review
- Base branch: main
- Implementation branch: e2e-s1-25620232517/version-validation-help
