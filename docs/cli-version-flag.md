# CLI `--version` flag

## Behaviour

`src/index.ts` inspects `process.argv.slice(2)` before starting the server. If any
argument is `--version` or `-v` (in any position, alongside other tokens), it writes
`fleet-e2e-toy v1.0.0\n` to stdout via `process.stdout.write` and exits with status 0
without binding a port. Otherwise `app.listen(PORT ?? 3000)` runs as before.

Works via `ts-node src/index.ts -v`, `node dist/index.js --version`, and
`npm start -- --version`.

## Design notes

- The check happens before `app.listen`, so printing the version never touches the network.
- The version string is currently a literal in `src/index.ts`; it is not derived from
  `package.json`, so the two must be kept in sync manually.

## Testing (`tests/version.test.ts`)

- Version tests use `spawnSync` on `node_modules/.bin/ts-node` and assert exit status and
  exact stdout for `--version`, `-v`, and a mixed argv.
- A no-flag test spawns the server detached (own process group, `PORT=3055`) and kills the
  whole group. Killing the group matters: ts-node is launched through wrappers, and killing
  only the direct child leaves orphaned `ts-node src/index.ts` servers running on the host.
- Known weakness: the no-flag test's kill timer (1 s) is close to ts-node's startup time
  (~1 s). If startup is slower, the test passes without observing the server start, so it
  only proves the process did not print the version and exit 0. It should be tightened to
  wait for the `NoteAPI running` startup line before killing (tracked as a backlog item).
