# Reviewer Feedback

Three issues require fixes:

## 1. gh-toy-13t — Missing concrete acceptance criteria

The description says "reject with clear error message, non-zero exit code, add unit test" but does not specify:
- The expected error message format
- Which fields are validated
- Which test file to create
- What exit code is required

This must be made as concrete as the other tasks (e.g., "isBlank('   ') returns true; validateRequired with blank value prints 'Error: <field> must not be empty' to stderr and exits 1; unit test at tests/cli/validate.test.ts passes under npm test"). Also references gh-toy-v6z which does not exist in the DAG.

## 2. gh-toy-9w2 — Two conflicting ACCEPTANCE CRITERIA blocks

Has two conflicting ACCEPTANCE CRITERIA blocks. The second block says "apiClient.ts exports the 5 functions returning typed results..." which is the scope of gh-toy-9oh, not this task. Remove or correct the second block so the acceptance criteria match only the 3 declared files (index.ts, parser.ts, types.ts + package.json script).

## 3. gh-toy-674 — Two conflicting ACCEPTANCE CRITERIA blocks

Has two conflicting ACCEPTANCE CRITERIA blocks. The second block ("Passing --title '' or --title '   ' prints a clear error...") describes behavior that belongs to gh-toy-pz1 and gh-toy-ihi (the wiring tasks), not to the validate.ts helpers task. Remove the second block so acceptance criteria are scoped only to src/cli/validate.ts and tests/cli/validate.test.ts as declared.
