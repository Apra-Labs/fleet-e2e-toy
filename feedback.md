APPROVED

All acceptance criteria for gh-toy-c2p.1 are met:

1. commander v15.0.0 (satisfies v12+ requirement) added as prod dependency in package.json.
2. src/cli.ts defines 'fleet-e2e-toy' as program name and version '1.0.0'; --version and -v both print exactly 'fleet-e2e-toy v1.0.0' and exit 0.
3. Shebang '#!/usr/bin/env node' is present in src/cli.ts and preserved in dist/cli.js via a postbuild node script in package.json.
4. package.json 'bin' field maps 'fleet-e2e-toy' to dist/cli.js.
5. npm run build completes with no TypeScript errors and produces dist/cli.js.
6. node dist/cli.js --version prints 'fleet-e2e-toy v1.0.0' and exits 0 with no server running.
7. node dist/cli.js --help prints commander-generated usage and exits 0.
8. No console.log in error paths; no raw error objects returned.
All 21 existing tests pass. Build and lint are clean.

reopenIds: []
newTasks: []
