# Version Flag

The NoteAPI CLI entry point supports `--version` and `-v` flags for printing the application version.

## Behavior

When the process is invoked with either `--version` or `-v` as a CLI argument, the application:

1. Reads its version from `package.json`
2. Prints `fleet-e2e-toy v<version>` to stdout
3. Exits with code `0`

This check occurs **before** the Express server is started. The flags are processed via a simple positional argument scan of `process.argv.slice(2)`, meaning they work at any position relative to other arguments (e.g., `--foo --version` and `--version --foo` both behave identically).

## Implementation

The version flag check is placed at the top of `src/index.ts`, before the `app.listen()` call. This ensures that requesting the version never starts the HTTP server. The version string is read from `package.json` using `readFileSync`, resolved relative to the source directory via `__dirname`.

## Testing

Tests live in `tests/version.test.ts` and use process spawning (via `spawn`) rather than `supertest`, because the version flag exits the process immediately without ever creating an HTTP listener. The test suite covers:

- `--version` flag prints the correct version string and exits 0
- `-v` flag produces identical output
- Flags work alongside other arguments (e.g., `--foo --version`, `-v --foo`)
- Server starts normally when no flags are provided
