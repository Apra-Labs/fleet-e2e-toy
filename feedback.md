Two missing dependency edges cause feasibility gaps:

1. gh-toy-hxb ("Implement list and read CLI subcommands") calls `validateRequired` from `src/cli/validate.ts`, which is created by gh-toy-13t. However gh-toy-hxb does not declare a dependency on gh-toy-13t. Fix: `bd dep add gh-toy-hxb gh-toy-13t`

2. gh-toy-ddh ("Implement create, update, delete CLI subcommands") also uses `validateRequired` (acceptance criteria explicitly state "all use validateRequired") but does not depend on gh-toy-13t either. It inherits gh-toy-hxb as a blocker but gh-toy-hxb itself has the missing dep above, so a transitive fix still requires this to be explicit. Fix: `bd dep add gh-toy-ddh gh-toy-13t`

Task size warnings (not blocking, classified as L below):
- gh-toy-gez touches 5 files (index.ts, parser.ts, types.ts, run.ts, package.json) — exceeds the 3-file guideline for M; classified L.
- gh-toy-ddh touches 4 files (create.ts, update.ts, delete.ts, index.ts) — exceeds 3-file guideline; classified L.

All other criteria pass: every epic has at least one covering feature; every feature has a [test] task; acceptance criteria are concrete for all tasks; test tasks are downstream of impl tasks; bd ready shows no features or epics (no backwards wiring); no scope creep or duplicate work; all tasks have model metadata.
