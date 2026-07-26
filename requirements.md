# Requirements: gh-toy-4ef -- Add --version flag to CLI

## Issue
- Bead ID: gh-toy-4ef (external: gh-1), P1 feature
- Sprint root: gh-toy-aeg (reused, already planned)
- Repo: fleet-e2e-toy (NoteAPI, TypeScript/Express, entry point src/index.ts)

## Acceptance
1. `--version`/`-v` prints exactly `fleet-e2e-toy v1.0.0` and exits 0.
2. Check happens before app.listen (no server start, no port bind, no log line).
3. Works regardless of other args present.
4. Normal startup unaffected when flag absent.
5. Covered by a test asserting stdout, exit code, and non-version invocation.

## Tasks (beads)
- gh-toy-aeg.1 (cheap-tier): implement the flag in src/index.ts
- gh-toy-aeg.2 (cheap-tier): add test covering it, depends on .1

No design.md -- single-file, single-obvious-path change.
