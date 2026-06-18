Fix 3 high-priority issues in the fleet-e2e-toy CLI:

1. gh-toy-4ef (P1) — Add --version flag to CLI
   The CLI tool should support a --version (or -v) flag that prints the current version string and exits with code 0.
   Acceptance: running ./tool --version prints 'fleet-e2e-toy v1.0.0', exit code 0, works alongside other flags.

2. gh-toy-69s (P2) — Handle SIGINT gracefully (Ctrl-C)
   The tool should catch SIGINT (Ctrl-C) and exit cleanly without a traceback or incomplete output.
   Acceptance: Ctrl-C prints 'Interrupted.' and exits with code 130, no stack trace shown, partial output files cleaned up.

3. gh-toy-aqd (P2) — Add JSON output mode via --json flag
   Add a --json flag so all command output can be emitted as machine-readable JSON.
   Acceptance: --json flag accepted on any subcommand, output is valid JSON, human-readable output is default, errors also JSON-formatted.

Project: Node.js + Express + TypeScript, in-memory store. Tests use Jest + supertest. All API handlers go in src/api/. Validate inputs using src/utils/validation.ts. No console.log in handlers. No 'any' types.
