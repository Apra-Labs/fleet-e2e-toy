# Docs Harvest Review: docs/features/version-flag.md

**Verdict: APPROVED**

## Criteria Assessment

### Durable Knowledge
PASS. The document captures:
- User-facing contract: both `--version` and `-v` flags, exact output format (`noteapi v1.0.0`), exit code 0, no server startup.
- Key design decision: why the flag is checked before `app.listen()` (early exit, no side effects, guaranteed exit code).
- Testing strategy: use of `execSync` to exercise real CLI behavior, both aliases tested independently.

### Transient Content
PASS. No task lists, TODO items, debug notes, line-number references, or sprint-specific language present.

### Accuracy vs Implementation
PASS. Cross-checked against `src/index.ts` and `tests/version.test.ts`:
- `process.argv.includes("--version") || process.argv.includes("-v")` — matches doc description.
- `console.log("noteapi v1.0.0")` + `process.exit(0)` before `app.listen()` — matches doc.
- Tests use `execSync` with `npx ts-node src/index.ts`, assert output contains `noteapi v1.0.0`, test both flags — matches doc.
- Test file location (`tests/version.test.ts`) — matches doc (`tests/version.test.ts`).

## Conclusion

The document is accurate, contains only durable design and contract knowledge, and has no transient artifacts. Approved as-is.
