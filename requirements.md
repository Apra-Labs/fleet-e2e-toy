# Requirements: gh-toy-4ef — Add --version flag to CLI

## Source
- Bead: gh-toy-4ef (External: gh-1)
- Sprint root: gh-toy-aeg
- Priority: P1
- Type: feature
- Labels: e2e-testing, integ-canary

## Description
The CLI tool should support a --version (or -v) flag that prints the
current version string and exits with code 0.

## Acceptance Criteria
- Running `./tool --version` prints `fleet-e2e-toy v1.0.0`
- Exit code is 0
- Works alongside other flags (does not break existing CLI flag parsing)

## Scope
This is the only issue in scope for this sprint. No design.md needed --
single, obvious-path CLI flag addition.
