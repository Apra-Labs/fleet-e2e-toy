# Requirements: gh-toy-4ef -- Add --version flag to CLI

## Issue
- beads id: fleet-e2e-toy-1778393401792-1-841f342d
- external ref: gh-toy-4ef / https://github.com/Apra-Labs/fleet-e2e-toy/issues/1
- Priority: P1
- Type: feature

## Description
The CLI tool should support a --version (or -v) flag that prints the current
version string and exits with code 0.

## Acceptance Criteria
- Running `./tool --version` prints `fleet-e2e-toy v1.0.0`
- Exit code is 0
- Works alongside other flags (does not break existing CLI flag handling)
- `-v` shorthand also works

## Scope
Only this issue is in scope for this sprint.
