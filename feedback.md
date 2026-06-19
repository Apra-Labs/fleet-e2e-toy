Two issues found across the three epics:

1. **gh-toy-7yo has gh-toy-13t listed as a dependency (test-blocks-test, criterion 5 + 7)**
   gh-toy-7yo ([test] CLI help output and input validation errors) lists gh-toy-13t ([test] CLI rejects blank required flags end-to-end) in its DEPENDS ON chain. A test task should never gate another test task — the implementation tasks (gh-toy-pz1 and gh-toy-ihi) already provide the real gate. Remove gh-toy-13t from gh-toy-7yo's dependency list; gh-toy-7yo should depend only on the impl tasks (gh-toy-yxd, gh-toy-674, gh-toy-pz1, gh-toy-ihi).

2. **gh-toy-13t and gh-toy-7yo have overlapping test scope (criterion 7 — duplicate work)**
   gh-toy-13t acceptance criteria: assert that blank --title, --content, --id each print 'Error: <field> must not be empty' to stderr and exit 1.
   gh-toy-7yo acceptance criteria (excerpt): "invalid inputs (--title '', --id '   ') exit non-zero with a clear error on stderr and NO stack trace."
   Both tasks assert blank-input rejection for the same CLI commands via child-process invocation. This is duplicate coverage. Fix: narrow gh-toy-7yo's validation assertions to stack-trace absence only (i.e., assert stderr contains no 'at ' frames), leaving the full exit-code and message assertions exclusively in gh-toy-13t. Update gh-toy-7yo's description and acceptance criteria accordingly.
