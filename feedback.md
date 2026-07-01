APPROVED

## Notes

### Coverage
The DAG covers all three source issues with no gaps:
- gh-toy-mi2 (CRUD commands): addressed by gh-toy-sal.1 (foundation/dispatcher) and gh-toy-sal.2 (five subcommands).
- gh-toy-7rp (help system + input validation): split cleanly into gh-toy-sal.3 (help) and gh-toy-sal.4 (validation), both correct in scope.
- gh-toy-4ef (--version flag): addressed by gh-toy-sal.5, narrow and self-contained.
- gh-toy-sal.6 (unit tests with mocked HTTP) covers the integration risk called out in requirements.md ("unit-test the CLI with mocked HTTP calls").

### Task size
- gh-toy-sal.1: M — one new file (src/cli.ts) but requires global flag parsing, URL resolution, dispatcher, API client, and error-handling scaffolding across ~100-150 lines. Appropriate for a single focused task.
- gh-toy-sal.2: M — five subcommand handlers all in src/cli.ts; touches the same file but moderate logic branching for each subcommand's flags and HTTP method.
- gh-toy-sal.3: S — help text additions in src/cli.ts; narrow, additive change.
- gh-toy-sal.4: S — validation guards added to each subcommand handler in src/cli.ts; narrow.
- gh-toy-sal.5: S — single flag handler reading package.json; narrow.
- gh-toy-sal.6: M — new test file (tests/cli.test.ts) with broad coverage across all subcommands, validation, help, version, and error cases; moderate scope.

### Acceptance criteria
All tasks have specific, verifiable AC. Each AC ends with "tsc build and lint pass" (or "npm test passes and lint passes" for the test task), making verification mechanical. AC for gh-toy-sal.1 correctly restricts subcommand handlers to stubs at that stage, avoiding premature coupling.

### Dependency direction
Layer ordering is correct and topologically sound:
- Layer 0: gh-toy-sal.1 (no dependencies; pure foundation)
- Layer 1: gh-toy-sal.2 (depends on .1) and gh-toy-sal.5 (depends on .1)
- Layer 2: gh-toy-sal.3 (depends on .1 and .2) and gh-toy-sal.4 (depends on .2)
- Layer 3: gh-toy-sal.6 (depends on .2, .3, .4, .5 — all implemented features)

No cycles. Dependencies flow in the correct direction (consumers depend on producers).

### Model-tier assignment
- gh-toy-sal.1 (M, design-heavy): premium-tier — appropriate; requires architectural judgment on arg-parsing approach, URL resolution chain, and error-handling scaffolding.
- gh-toy-sal.2 (M, mechanical): standard-tier — appropriate; repetitive CRUD dispatch, no design ambiguity.
- gh-toy-sal.3 (S, additive): standard-tier — acceptable; could arguably be cheap but help text for all subcommands has enough detail to justify standard.
- gh-toy-sal.4 (S, guard logic): standard-tier — acceptable; validation guards require careful placement before HTTP calls.
- gh-toy-sal.5 (S, trivial): cheap-tier — correct; single flag reading package.json, no design judgment needed.
- gh-toy-sal.6 (M, broad test coverage): standard-tier — appropriate; writing mocked fetch tests across all subcommands is non-trivial but does not require architectural judgment.

All tier assignments are consistent with task complexity.

### Minor observations
- gh-toy-sal.3 depends on both .1 and .2 (so help text reflects subcommand flags already implemented). This is correct; it avoids documenting flags before they exist.
- The plan deliberately defers JSON output mode, SIGINT handling, and config file to out-of-scope issues, consistent with requirements.md.
- No redundant or overlapping tasks detected.

## taskAssignments

[{"id":"gh-toy-sal.1","bucket":"M","model":"premium"},{"id":"gh-toy-sal.2","bucket":"M","model":"standard"},{"id":"gh-toy-sal.3","bucket":"S","model":"standard"},{"id":"gh-toy-sal.4","bucket":"S","model":"standard"},{"id":"gh-toy-sal.5","bucket":"S","model":"cheap"},{"id":"gh-toy-sal.6","bucket":"M","model":"standard"}]
