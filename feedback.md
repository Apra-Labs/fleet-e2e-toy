APPROVED

Reviewed fleet-e2e-toy-mzi ("Add --version flag to CLI") on branch e2e-s1-28554565041/gh-toy-4ef.

- `src/cli.ts` adds `hasVersionFlag`, `getVersion`, and `getVersionString`, reading the version from `package.json`.
- `src/index.ts` checks `hasVersionFlag(process.argv.slice(2))` before the HTTP server starts listening, prints `fleet-e2e-toy v<version>`, and calls `process.exit(0)` — verified manually that `--version`/`-v` work even when combined with other args (e.g. `--foo --version --bar` still prints the version and exits 0), satisfying "works alongside other args without conflict".
- `tests/cli.test.ts` covers `hasVersionFlag` unit cases plus an integration test spawning the CLI with `--version` and `-v`, asserting stdout and exit code 0.
- `npm run build` (tsc) passes with no errors.
- `npm test` passes: 27/27 tests across 3 suites, including the 5 new CLI tests, with no regressions in existing `notes.test.ts`/`validation.test.ts`.
- Changed files (`src/cli.ts`, `src/index.ts`, `tests/cli.test.ts`, `requirements.md`, `.beads/issues.jsonl`, `.beads/interactions.jsonl`) are all justified by this issue's scope; no unrelated backlog items were implemented.

All acceptance criteria from `fleet-e2e-toy-mzi` are met.
