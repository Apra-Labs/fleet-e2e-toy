# Plan Reviewer Feedback

Two issues found:

1. **gh-toy-9w2 has duplicate/conflicting acceptance criteria sections.** The task has two separate "ACCEPTANCE CRITERIA" blocks. The first correctly scopes to `src/cli/index.ts`, `src/cli/parser.ts`, `src/cli/types.ts` + the npm script, and says "No API client yet". The second block (copy-paste artifact) adds "apiClient.ts exports the 5 functions returning typed results" which is the scope of gh-toy-9oh, not gh-toy-9w2. Remove the second acceptance criteria block from gh-toy-9w2 so the scope is unambiguous.

2. **gh-toy-13t and gh-toy-674 duplicate work.** Both tasks create `tests/cli/validate.test.ts` covering the same `isBlank`/`validateRequired` helpers, and both define acceptance criteria around the same blank-string rejection behavior. gh-toy-674 already creates `src/cli/validate.ts` + `tests/cli/validate.test.ts` with full unit test coverage. gh-toy-13t then says "extend tests/cli/validate.test.ts" for the same cases. One of these must be removed or clearly differentiated: either collapse gh-toy-13t into gh-toy-674 (gh-toy-674 already covers everything in gh-toy-13t), or redefine gh-toy-13t to cover only the end-to-end CLI invocation assertions (blank flag rejected at the command level) and remove the unit-test assertions from its acceptance criteria since those belong to gh-toy-674.
