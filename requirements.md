# Sprint Requirements — fleet-e2e-toy

Sprint: e2e-s1.2-30122124609
Repo: https://github.com/Apra-Labs/fleet-e2e-toy
Base branch: main

---

## gh-toy-4ef · Add --version flag to CLI

**Type:** feature
**Priority:** P1
**External:** gh-1

**Description:**
The CLI entry point (`src/index.ts`) should support a `--version` (or `-v`) flag
that prints the current version string and exits with code 0, without starting
the Express server.

**Acceptance Criteria:**
- Running the CLI with `--version` or `-v` prints `fleet-e2e-toy v1.0.0`
- Exit code is 0
- The flag is checked before the server starts (no port binding, no listening)
- Works alongside other flags (does not break normal startup when the flag is absent)
- Covered by a test under `tests/`

**Scope note:** exactly this one issue — no additional issues picked up in this sprint.
