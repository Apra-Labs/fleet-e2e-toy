# Requirements: gh-toy-4ef -- Add --version flag to CLI

## Issue
gh-toy-4ef (external ref gh-1, labels: e2e-testing, integ-canary)

## Description
The CLI tool should support a --version (or -v) flag that prints the current
version string and exits with code 0. Acceptance: running ./tool --version
prints "fleet-e2e-toy v1.0.0", exit code 0, works alongside other flags.

## Context
Entrypoint is src/index.ts, which currently starts the Express server
unconditionally. No existing CLI argument handling.

## Acceptance Criteria
1. Running the entrypoint with --version or -v prints exactly:
   fleet-e2e-toy v1.0.0
2. Process exits with code 0 immediately -- server must NOT start.
3. Works whether the flag appears alone or alongside other args.
4. No regression to normal startup when the flag is absent.

## Note on beads
This sprint's beads writes (bd create) are currently failing on this machine
with a backend error ("record event in events: Error 1105: Field 'id'
doesn't have a default value") -- an environment/DB issue unrelated to this
task. Sprint state for this lightweight sprint is tracked via git only.
