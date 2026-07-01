APPROVED

gh-toy-sal.1: All acceptance criteria met. src/cli.ts exists as a runnable TS entry point. The argument parser correctly separates global flags (--url, --help/-h, --version/-v) from the subcommand and its per-subcommand flags. The subcommand dispatcher routes to list/read/create/update/delete with stub handlers, and throws CliError for unknown subcommands (printing to stderr and exiting non-zero). The API client resolves the base URL from --url flag, then NOTEAPI_URL env var, then http://localhost:3000 default, and performs requests via native fetch. Centralized error handling in fail() prints human-readable messages to stderr with no stack traces and returns exit code 1. tsc build passes, lint passes, and all 21 existing tests pass with no regressions.

reopenIds: []
newTasks: []
