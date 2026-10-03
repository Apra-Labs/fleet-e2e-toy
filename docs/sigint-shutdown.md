# Graceful SIGINT shutdown

## Behaviour

Pressing Ctrl-C (SIGINT) while the server runs prints `Interrupted.` to stderr, closes the
HTTP server (releasing the port), and exits with status 130 (128 + SIGINT). No stack trace
or error text is printed.

## Design

- `src/index.ts` keeps the `http.Server` returned by `app.listen` so it can be closed.
- The handler is registered with `process.once('SIGINT')`. It calls `server.close()` and
  exits 130 in the close callback.
- Keep-alive connections can stall `server.close()`, so an `unref`'d 500 ms timer also exits
  130. It is unref'd so it never keeps the process alive on its own.
- "Cleanup" means closing the server: the app writes no files and the store is in-memory.
- No SIGTERM handler exists; SIGTERM keeps Node's default behaviour (death by signal), and
  the existing SIGTERM test depends on that.

## Trade-offs

- Because of `once`, a second Ctrl-C within the 500 ms window reverts to Node's default and
  kills the process by signal. Accepted as a reasonable force-quit.

## Testing (`tests/sigint.test.ts`)

- Spawns ts-node detached in its own process group and sends SIGINT to the group, as a
  terminal Ctrl-C does (npm/ts-node wrappers would otherwise swallow or orphan the signal).
- Asserts exit code 130 (no signal), `Interrupted.` on stderr, no `Error` text or stack
  frames, and that the port is refused afterwards and can be re-listened.
- A SIGKILL fallback prevents a failing run from leaving a server behind.
- Gap: the 500 ms fallback with an open keep-alive connection is not covered by a test.

## Operational note

Fixed-port deploys (3001) can collide with a stale long-running ts-node server from an
earlier run; a smoke test against it would exercise old code. Stop the stale process or use
a different port for sandbox verification.
