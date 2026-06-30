# Requirements — gh-toy-4ef: Add --version Flag to CLI

## Base Branch
main — branch to fork from and merge back to

## Issue
gh-toy-4ef — Add --version flag to CLI

## Goal
The fleet-e2e-toy CLI tool should support a --version (or -v) flag that prints the current version string and exits with code 0.

## Acceptance Criteria
- ./tool --version prints a version string (e.g. fleet-e2e-toy v1.0.0) and exits with code 0
- -v short flag also works and prints the same version string
- Existing tests still pass

## Constraints
- Must compile and run on Windows
- No new external dependencies
