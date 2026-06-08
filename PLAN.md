# Tag Filtering Endpoint — Implementation Plan

> Complete and verify the tag-filtering query parameter on GET /api/notes, closing the test coverage gap so the feature passes its acceptance criteria.

---

## Tasks

### Phase 1: Verify & Test Tag Filtering

#### Task 1: Audit existing tag filter implementation
- **Change:** Read and verify the tag filtering logic in the GET /api/notes handler (src/api/notes.ts lines 17–20). Confirm it correctly filters by `n.tags.includes(tag)`, returns all notes when `?tag=` is omitted, and returns an empty array when no notes match. Run `npm test` to establish a green baseline.
- **Files:** src/api/notes.ts (read-only), tests/notes.test.ts (read-only)
- **Tier:** cheap
- **Done when:** Existing tests pass; handler logic confirmed correct for match, no-match, and missing-param cases. Any implementation gaps documented for Task 2.
- **Blockers:** None — this is the riskiest assumption (that the handler works correctly) and is front-loaded.

#### Task 2: Add comprehensive tag filtering tests
- **Change:** Add new test cases in tests/notes.test.ts within the existing `describe("GET /api/notes")` block:
  1. Returns only notes with the requested tag (strengthen existing test — assert status 200 and verify non-matching notes are excluded)
  2. Returns empty array (`[]`) with status 200 when no notes match the tag
  3. Omitting `?tag=` returns all notes — no regression to existing list behavior (strengthen existing test)
  4. Empty-string tag (`?tag=`) returns all notes (same as omitted — edge case of the falsy-string path)
  5. Tag filtering is case-sensitive (documents current behavior)
- **Files:** tests/notes.test.ts
- **Tier:** standard
- **Done when:** `npm test` passes with all new tag-filtering test cases green. Coverage for the tag-filter code path is complete.
- **Blockers:** Task 1 must confirm no implementation fix is needed; if the handler is broken, fix it before writing tests that assert correct behavior.

#### Task 3: Update feature_list.json and run quality gates
- **Change:** Set `passes` to `true` for the "Tag filtering endpoint" entry in feature_list.json. Run `npm test`, `npm run lint`, and `npm run build` to confirm everything is clean.
- **Files:** feature_list.json
- **Tier:** standard
- **Done when:** feature_list.json shows `"passes": true`, all tests pass, lint is clean, build succeeds.
- **Blockers:** Task 2 tests must be passing first.

#### VERIFY: Verify & Test Tag Filtering
- Run full test suite (`npm test`)
- Run lint (`npm run lint`) and build (`npm run build`)
- Confirm all Phase 1 changes work together
- Report: tests passing, any regressions, any issues found

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing tag filter logic has a bug (e.g. doesn't handle missing tags array) | High | Task 1 front-loads this audit; fix handler before writing tests in Task 2 |
| New tests break existing test suite (shared state between tests) | Med | Each test uses `beforeEach(() => noteStore.clear())` which already resets state; verify isolation |
| Tag filtering is case-sensitive but users expect case-insensitive | Low | Document current behavior (case-sensitive) in tests; flag multi-tag and case-insensitive filtering as out-of-scope follow-ups per requirements |
| Empty-string query param behaves differently across Express versions | Low | Test the edge case explicitly in Task 2; Express parses `?tag=` as `""` which is falsy and skips the filter — this is correct behavior |

## Notes
- Each task should result in a git commit
- Verify tasks are checkpoints — stop and report after each one
- Base branch: workshop
- Implementation branch: sprint/tag-filtering
