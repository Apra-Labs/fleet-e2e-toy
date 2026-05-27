# fleet-e2e-toy e2e-s1.1-26544203024 - Code Review

**Reviewer:** reviewer
**Date:** 2026-05-27 18:00:00+00:00
**Verdict:** CHANGES NEEDED

---

## 1. Tests and Quality Gates

All 29 tests pass (8 validation, 11 notes API, 8 CLI). Lint is clean. TypeScript build succeeds with no errors. **PASS.**

---

## 2. Feature: --version / -v (Issue gh-toy-4ef)

`src/cli.ts:21-26` correctly detects `--version` and `-v`, reads version from `package.json` at runtime (avoiding drift), prints `fleet-e2e-toy v1.0.0`, and exits 0. Version check runs before command dispatch as specified. Tests verify both flags, output string, and exit code. **PASS.**

---

## 3. Feature: help / --help / -h (Issue gh-toy-kbk)

`src/cli.ts:29-32` handles all three triggers. Help text lists both subcommands (`help`, `add`) and both flag pairs (`--version/-v`, `--help/-h`). Exit code 0. Tests verify all three triggers and assert presence of every subcommand and flag in output. **PASS.**

---

## 4. Feature: Input Validation (Issue gh-toy-v6z)

`src/cli.ts:35-46` implements the `add` subcommand with inline validation — empty and whitespace-only titles print an error to stderr and exit 1; valid titles exit 0. Tests cover all three cases. **FAIL — deviation from plan.**

Plan T1.4 specifies: "Add `validateCliArg(value: string)` to `src/utils/validation.ts`" and "Add a minimal `add <title>` subcommand to `src/cli.ts` that accepts a title argument and **calls this helper**."

The `validateCliArg` function was added to `validation.ts:13-18` but `cli.ts` does not import or call it — it duplicates the logic inline. This means:

- The exported `validateCliArg` function is dead code with zero callers.
- The validation logic exists in two places (cli.ts inline and validation.ts helper), violating DRY.
- Future CLI commands that need the same validation won't reuse the helper if the pattern is inline checks.

**Fix:** Import and use `validateCliArg` in `cli.ts` instead of the inline check.

**Doer:** fixed in commit bdda2b5 — imported `validateCliArg` from `./utils/validation` and replaced the inline check with a `validateCliArg(title ?? "")` call; error message now flows from the shared helper.

---

## 5. Wrapper Scripts (tool, tool.cmd)

`tool` is a 2-line bash wrapper invoking `npx ts-node src/cli.ts "$@"`. `tool.cmd` is the Windows equivalent. Both are correct. **FAIL — CRLF line endings on `tool`.**

`file tool` reports: `Bourne-Again shell script, ASCII text executable, with CRLF line terminators`. This will break on Linux/macOS CI — bash will see `\r` in the shebang and fail with `bad interpreter` or similar errors.

**Root cause:** `.gitattributes` contains `*.sh text eol=lf` but the `tool` script has no `.sh` extension, so it is not covered by the rule. Git's autocrlf on Windows converted it to CRLF.

**Fix:**
1. Add `tool text eol=lf` to `.gitattributes`
2. Run `sed -i 's/\r$//' tool` to fix the working copy
3. Re-add and commit

**Doer:** fixed in commit cc8cc21 — added `tool text eol=lf` to `.gitattributes`, ran `sed -i 's/\r$//' tool` to fix working copy and `git rm --cached tool && git add tool` to re-normalize the git object; verified with `file tool` showing no CRLF terminators.

---

## 6. Test Quality

Tests use `spawnSync` for true end-to-end CLI testing — correct approach. Platform handling uses `node -r ts-node/register` directly rather than the wrapper scripts, which avoids the CRLF issue in tests but means the wrapper scripts themselves are not tested. **NOTE** — the wrappers are thin enough that this is acceptable, but worth noting.

The `NODE_OPTIONS: "--loader ts-node/esm"` env var in the test helper is unnecessary since the `-r ts-node/register` flag already handles module loading, but it doesn't cause failures. Minor cleanup opportunity.

---

## 7. File Hygiene

Changed files: `src/cli.ts`, `src/utils/validation.ts`, `tests/cli.test.ts`, `tool`, `tool.cmd`, `plan.md`, `requirements.md`, `progress.json`, `feedback.md`. All are justified by sprint requirements. No spurious files, no CLAUDE.md committed. **PASS.**

---

## 8. Existing Behavior Regression

No existing API routes, exports, or tests were modified. All 21 pre-existing tests still pass. `src/cli.ts` is a new entry point with no coupling to the REST API. **PASS.**

---

## 9. Security

No injection vectors — CLI args are used for string comparison only, not interpolated into shell commands or eval'd. `fs.readFileSync` reads a known local file (`package.json`). No secrets in code. **PASS.**

---

## Summary

**Two issues require changes before approval:**

1. **CRLF on `tool` script** (blocking) — will break on any Unix-based CI runner. Fix `.gitattributes` to cover `tool` (not just `*.sh`) and convert to LF.
2. **`validateCliArg` not used** (code quality) — `cli.ts` duplicates validation inline instead of calling the helper added to `validation.ts` per plan T1.4. Import and use it.

Everything else is solid: all tests pass, features work as specified, file hygiene is clean, no regressions, no security issues. Once the two items above are fixed, this is ready to approve.
