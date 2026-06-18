# Feature: --version flag (gh-toy-4ef)

## What it does

Running `fleet-e2e-toy --version` (or `-v`) prints the current version and exits with code 0. The version is not hardcoded; it is sourced from `package.json` at build time via `import pkg from "../../package.json"` with `resolveJsonModule: true`.

## Output

**Text mode (default):**
```
fleet-e2e-toy v1.0.0
```
Exit code: 0.

**JSON mode (`--version --json`):**
```json
{"name":"fleet-e2e-toy","version":"1.0.0"}
```
Exit code: 0.

Note: the `name` field is the string literal `"fleet-e2e-toy"`, not `pkg.name` (which is `"noteapi"`). Using `pkg.name` would violate the acceptance string.

## Precedence

`--version` short-circuits before any subcommand dispatch. `fleet-e2e-toy --version notes` prints the version, not the `notes` subcommand output.

## Key invariants

- Version is always sourced from `package.json`; bumping that file automatically updates CLI output.
- `run()` returns 0 without calling `process.exit`; the shim handles exit.
- Both text and JSON branches go through `OutputWriter` — no direct stdout writes in `run.ts`.

## Test coverage

`tests/cli-version.test.ts` (4 tests): `--version`, `-v` alias, `--version --json`, `--version <subcommand>` (precedence).
