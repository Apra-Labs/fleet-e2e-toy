**Criterion 2 -- Missing [test] tasks**

- gh-toy-s5k (Tag filtering endpoint): no [test] task exists anywhere in the DAG. Add a dedicated [test] task (e.g., tests/api/tag-filter.test.ts) that blocks gh-toy-s5k and asserts GET /api/notes?tag=X returns only matching notes, including the empty-result case.
- gh-toy-24g, gh-toy-69s, gh-toy-aqd: these three P2 features are open with no child implementation tasks and no [test] tasks. If they are in-scope for this sprint, each needs at least one [impl] task and one [test] task. If they are backlog-only, mark them deferred (bd defer) so they are not misleadingly mixed into the open sprint list.

**Criterion 3 -- Missing acceptance criteria**

- gh-toy-s5k: description is "Already partially implemented - needs tests." No acceptance criteria: no test file name specified, no enumerated edge cases (empty result set, multiple tags, unknown tag), no expected HTTP status codes. Add concrete done criteria before work is claimed.

**Criterion 4 -- Oversized tasks**

- gh-toy-9w2 ([impl] CLI scaffolding): description explicitly lists 5 files to create or modify: src/cli/index.ts, src/cli/parser.ts, src/cli/apiClient.ts, src/cli/types.ts, package.json. This exceeds the ~3 file threshold. Recommended split: one task for the entrypoint + arg parser + types (index.ts, parser.ts, types.ts) and a second task for the API client (apiClient.ts, package.json bin entry). The second task should depend on the first.
- gh-toy-674 ([impl] Reject empty/whitespace-only flag values): creates src/cli/validate.ts and tests/cli/validate.test.ts, then applies validateRequired() to all 5 command handlers (list.ts, read.ts, create.ts, update.ts, delete.ts) -- potentially 7 files. Split into: (a) create validate.ts + validate.test.ts, and (b) wire validateRequired into the 5 command handlers (which would then depend on both (a) and the individual command impl tasks).

**Criterion 5 -- Dependency wiring gap**

- gh-toy-j0k ([test] CLI --version flag) correctly depends on gh-toy-2kj ([impl] --version). However gh-toy-2kj only depends on gh-toy-9w2 -- it does not depend on gh-toy-j0k's parent feature gh-toy-4ef being unblocked. This is structurally fine, but note that if gh-toy-9w2 is split (per criterion 4 finding above), gh-toy-2kj must be updated to depend on whichever split task produces src/cli/index.ts.
