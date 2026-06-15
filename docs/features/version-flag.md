# Version Flag Feature

## Overview

The `--version` and `-v` flags print the NoteAPI version and exit before the server starts.

## User-Facing Behavior

When a user runs:
```bash
npm start -- --version
# or
node src/index.ts --version
# or
node src/index.ts -v
```

The output is:
```
noteapi v1.0.0
```

The process exits with code 0 and does not start the Express server.

## Implementation Approach

The version flag check is implemented in `src/index.ts` at the entry point, before `app.listen()` is called. The code uses `process.argv.includes()` to detect the `--version` or `-v` flag, then prints the version string and calls `process.exit(0)` immediately.

## Key Design Decision

**Why parse the flag before `app.listen()`?**

The flag is checked before any server startup logic for three reasons:

1. **Early Exit**: Users expect the version to print and the process to exit immediately, not block on server startup.
2. **No Side Effects**: Checking `process.argv` directly avoids framework-level routing or middleware, ensuring no initialization overhead.
3. **Exit Code Guarantees**: By calling `process.exit(0)` directly, we guarantee a clean exit with success code, regardless of Express state.

This approach is simpler and more reliable than routing the flag through Express middleware or adding a separate CLI utility layer.

## Testing

Tests are in `tests/version.test.ts`. The test suite uses `execSync` to spawn the process with the flag and assert:
- Output contains `noteapi v1.0.0`
- Exit code is 0 (implicit in `execSync` not throwing)

Both `--version` and `-v` are tested as separate test cases to ensure the alias works correctly.
