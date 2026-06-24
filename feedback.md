APPROVED

## Notes

### Coverage
All three source issues are covered:
- gh-toy-mi2 (CRUD commands): m5w.3 (list, read) + m5w.4 (create, update, delete)
- gh-toy-7rp (help system + validation): m5w.5 (help/unknown-subcommand) + m5w.2 (validation helpers)
- gh-toy-13t (empty/blank validation): m5w.2 (validation.ts reusing src/utils/validation.ts conventions) + m5w.6 (explicit test coverage for empty string and whitespace-only cases)

### Issue 1: m5w.5 dependency underspecified (minor)
m5w.5 notes only list `depends-on: gh-toy-m5w.1`, but its AC includes "All error paths (validation, network, API non-2xx) print human-readable messages with no stack traces." Polishing subcommand error paths requires m5w.3 and m5w.4 to exist first. In practice the doer should treat m5w.5 as blocked until m5w.3 and m5w.4 are done. The notes should ideally read `depends-on: gh-toy-m5w.3, gh-toy-m5w.4` in addition to m5w.1. Not a blocker given the dependency chain is documented elsewhere, but worth noting.

### Issue 2: m5w.1 premium-tier assignment (accepted)
Premium is higher than strictly needed for a scaffold task (creates ~3 files: src/cli/index.ts, edits package.json and tsconfig.json). However, requirements.md explicitly flags this as the riskiest task whose errors would cascade to all subsequent tasks. The premium assignment is defensible and accepted.

### Issue 3: m5w.3 assigned standard-tier for an S-bucket task (acceptable)
m5w.3 covers two read-only subcommands using already-built helpers, making it S-complexity. Standard is one tier above what a cheap model might handle, but the extra headroom costs little and reduces rework risk given this is the first subcommand implementation.

### Acceptance Criteria Quality
All tasks have concrete, testable acceptance criteria. m5w.6 explicitly calls for both the empty-string and whitespace-only test cases required by gh-toy-13t. m5w.7 is appropriately mechanical (run gates, fix any issues).

### Dependency Direction
Linear chain is correct: m5w.1 → m5w.2 → {m5w.3, m5w.4} → m5w.6 → m5w.7, with m5w.5 branching from m5w.1 (with the caveat in Issue 1). No cycles detected.

### Task Sizing
- m5w.1: M (package.json + tsconfig.json + src/cli/index.ts, plus bin wiring — moderate scope with tsconfig path risk)
- m5w.2: M (two new modules: src/cli/client.ts with typed CliError + src/cli/validation.ts)
- m5w.3: S (two read-only subcommands wired into existing scaffold using existing helpers)
- m5w.4: M (three write subcommands with conditional validation for update's at-least-one-field requirement)
- m5w.5: S (help flags are largely automatic in commander; unknown-subcommand handler + error message polish is narrow scope)
- m5w.6: L (tests/cli/ directory with multiple test files: validation, client, per-subcommand, help, unknown-command)
- m5w.7: S (mechanical quality gate: run build/lint/test, fix any surface issues)

## taskAssignments

[{"id":"gh-toy-m5w.1","bucket":"M","model":"premium"},{"id":"gh-toy-m5w.2","bucket":"M","model":"standard"},{"id":"gh-toy-m5w.3","bucket":"S","model":"standard"},{"id":"gh-toy-m5w.4","bucket":"M","model":"standard"},{"id":"gh-toy-m5w.5","bucket":"S","model":"standard"},{"id":"gh-toy-m5w.6","bucket":"L","model":"standard"},{"id":"gh-toy-m5w.7","bucket":"S","model":"cheap"}]
