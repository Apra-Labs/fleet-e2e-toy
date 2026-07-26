# Requirements: gh-toy-4ef — Add --version flag to CLI

## Summary
The CLI tool should support a `--version` (or `-v`) flag that prints the current
version string and exits with code 0.

## Acceptance Criteria
- Running `./tool --version` prints `fleet-e2e-toy v1.0.0` and exits with code 0.
- The `-v` short flag behaves the same as `--version`.
- The flag works alongside other flags (does not conflict with existing CLI options).

## Risk
Low risk, single mechanical CLI change. No design doc needed.

## Source
- Beads issue: gh-toy-4ef (External: gh-1), sprint root: gh-toy-rje
- Labels: e2e-testing, integ-canary
- Priority: P1
