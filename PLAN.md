# PLAN — Sprint s1.1-1780537199340

Implements three P1 issues from the beads backlog:

- **gh-toy-v6z** — `isBlankOrEmpty` validation helper + unit tests
- **gh-toy-4ef** — `--version` / `-v` CLI flag in `src/index.ts`
- **gh-toy-kbk** — `help` / `--help` / `-h` CLI command in `src/index.ts`

Base branch: `origin/main`. Work branch: `pmlite-e2e/s1.1-1780537199340` (already created).

---

## Exploration notes (Phase 0)

Files inspected:
- `src/index.ts` — 7 lines; imports `./app`, reads `PORT`, calls `app.listen`. No argv handling exists today.
- `src/app.ts` — Express app factory; exported default. Not touched by this sprint.
- `src/utils/validation.ts` — exports `validateCreateInput`, `validateUpdateInput`, `ValidationError`. Existing style: named `export function`, returns discriminated unions. We follow the same style.
- `tests/validation.test.ts` — Jest + `describe`/`it`, imports from `../src/utils/validation`. We add a new `describe("isBlankOrEmpty", ...)` block in the same file.
- `package.json` — `"version": "1.0.0"`. The version printed by `--version` is hard-coded to `1.0.0` per requirements (it does not need to be read dynamically from `package.json`).
- `jest.config.ts` — `roots: ["<rootDir>/tests"]`, `testMatch: ["**/*.test.ts"]`, `preset: "ts-jest"`. `src/index.ts` is excluded from coverage, so we do **not** add a Jest test for the CLI entry point — CLI behaviour is verified by manual smoke checks at VERIFY.
- `tsconfig.json` — `strict: true`. New code must satisfy strict mode (no implicit `any`, no unused vars).
- `src/models/note.ts` is referenced by `validation.ts` — not in scope.

Assumptions verified:
- `src/index.ts` is the CLI entry point (`npm start` runs `ts-node src/index.ts`). VERIFIED via `package.json`.
- Parsing `process.argv.slice(2)` **before** `app.listen` prevents the server from starting when a flag is matched (because we call `process.exit(0)`). VERIFIED by reading the file: there is no other side-effecting code between argv and `listen`.
- Existing test file already imports from `../src/utils/validation` — adding one more import is the only test-file change needed. VERIFIED.
- `1.0.0` matches `package.json`. VERIFIED.

Decisions made up-front (not deferred to doer):

1. **T2 and T3 are kept as two separate tasks** to mirror the two beads issues (gh-toy-4ef and gh-toy-kbk) — one commit per issue. T2 establishes a single argv parsing block; T3 extends the same block. T3 MUST extend, not rewrite, the argv handling introduced in T2 (DRY).
2. **The "non-zero exit if args are blank" bullet under gh-toy-v6z** is interpreted as a **unit-test-only** requirement: the unit test asserts `isBlankOrEmpty` returns `true` for blank inputs. We do **not** add CLI-level blank-arg rejection to `src/index.ts`. (Plain reading; avoids scope creep into T2/T3.)
3. **Exact help text** is pinned in T3 below so acceptance is gradeable. The doer prints exactly that block.
4. **Version string format** is `fleet-e2e-toy v1.0.0` (single newline, no surrounding text), printed via `console.log`. Acceptance from requirements is byte-exact.
5. **Argv matching is exact**: we use `args.includes("--version")` / `args.includes("-v")` etc. No prefix matching, no case-insensitive matching.
6. **Help command precedence**: if both `--help` and `--version` are present, help wins (checked first). This is a tie-breaker the requirements do not specify; we document it here and the doer follows it. T1's behaviour is unaffected.

---

## Phase 1 — Implementation (single cohesive phase)

All three tasks touch a small surface (one util file, one test file, one entry file) and form one reviewable increment. Single-phase plan with VERIFY at the end. All tasks run on **claude-haiku-4-5-20251001** — they are mechanical changes with no remaining design ambiguity, and grouping them into one streak lets the doer run them in a single dispatch.

### T1 — Add `isBlankOrEmpty` helper + unit tests (gh-toy-v6z)

- **Files:**
  - Edit `src/utils/validation.ts` — add at the bottom of the file:
    ```ts
    export function isBlankOrEmpty(s: string): boolean {
      return s.trim().length === 0;
    }
    ```
    Do not modify any existing exports. Do not change the existing import line. Strict-mode compliant.
  - Edit `tests/validation.test.ts` — extend the existing import to include `isBlankOrEmpty`:
    ```ts
    import { validateCreateInput, validateUpdateInput, isBlankOrEmpty } from "../src/utils/validation";
    ```
    Append a new `describe("isBlankOrEmpty", () => { ... })` block at the end of the file containing these four `it` cases:
    1. `it("returns true for empty string")` — `expect(isBlankOrEmpty("")).toBe(true);`
    2. `it("returns true for whitespace-only string")` — `expect(isBlankOrEmpty("   ")).toBe(true);` and one more with `"\t\n "`.
    3. `it("returns false for non-blank string")` — `expect(isBlankOrEmpty("hello")).toBe(false);`
    4. `it("returns false for string with surrounding whitespace and content")` — `expect(isBlankOrEmpty("  hi  ")).toBe(false);`
- **What "done" means:** `npm test` passes including the 4 new test cases; existing tests still pass; no lint errors (`npm run lint` clean on the two edited files).
- **Scope guard:** Do NOT add CLI-level blank-arg handling. Do NOT call `isBlankOrEmpty` from any other file in this sprint.
- **Blockers:** None.
- **Model:** claude-haiku-4-5-20251001

### T2 — Add `--version` / `-v` CLI flag (gh-toy-4ef)

- **File:** `src/index.ts`.
- **Change:** Replace the current contents with a version that parses `process.argv.slice(2)` **before** `app.listen`. Exact code:
  ```ts
  import app from "./app";

  const args = process.argv.slice(2);

  if (args.includes("--version") || args.includes("-v")) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }

  const PORT = process.env.PORT ?? 3000;

  app.listen(PORT, () => {
    console.log(`NoteAPI running on http://localhost:${PORT}`);
  });
  ```
- **What "done" means:**
  - `npx ts-node src/index.ts --version` prints exactly `fleet-e2e-toy v1.0.0` to stdout and exits 0 without binding the port.
  - `npx ts-node src/index.ts -v` does the same.
  - `npx ts-node src/index.ts` (no flags) still starts the server (printed `NoteAPI running on http://localhost:3000`).
  - `npm test` still green (unchanged behaviour for tests, since `src/index.ts` is not imported by tests).
- **Scope guard:** Do NOT introduce a separate `parseCliArgs` module or a third-party CLI library (yargs, commander). A flat `args.includes(...)` check inside `index.ts` is the chosen pattern; T3 extends the same block.
- **Blockers:** None (T1 and T2 touch disjoint files; T2 can run before or after T1, but the streak order is T1 → T2 → T3).
- **Model:** claude-haiku-4-5-20251001

### T3 — Add `help` / `--help` / `-h` command (gh-toy-kbk)

- **File:** `src/index.ts` (extend the argv block added in T2; do not rewrite it).
- **Change:** Insert the help check **before** the `--version` check, so that help wins on ties. Final state of the argv block in `src/index.ts`:
  ```ts
  const args = process.argv.slice(2);

  if (args.includes("help") || args.includes("--help") || args.includes("-h")) {
    console.log(
      [
        "fleet-e2e-toy — NoteAPI demo CLI",
        "",
        "Usage:",
        "  ts-node src/index.ts [command] [flags]",
        "",
        "Commands:",
        "  help              Show this help message",
        "",
        "Flags:",
        "  --help, -h        Show this help message",
        "  --version, -v     Print version and exit",
        "",
        "With no command or flag, starts the NoteAPI HTTP server on $PORT (default 3000).",
      ].join("\n")
    );
    process.exit(0);
  }

  if (args.includes("--version") || args.includes("-v")) {
    console.log("fleet-e2e-toy v1.0.0");
    process.exit(0);
  }
  ```
  The rest of the file (imports, `PORT`, `app.listen`) is unchanged from T2.
- **What "done" means:**
  - `npx ts-node src/index.ts help`, `--help`, and `-h` each print the usage block above and exit 0 without binding the port.
  - The usage text contains the substrings `--version`, `-v`, `--help`, `-h`, and `help` (so acceptance "lists every subcommand and flag" is satisfied).
  - `npx ts-node src/index.ts --version` still works (regression check).
  - `npx ts-node src/index.ts` still starts the server.
  - `npm test` still green.
- **Scope guard:** Do NOT touch `src/utils/validation.ts` or `tests/`. Do NOT add a separate `usage.ts` file. Help text is exactly the lines above — do not embellish.
- **Blockers:** T2 (T3 extends the argv block introduced by T2).
- **Model:** claude-haiku-4-5-20251001

### VERIFY (end of phase)

Run these checks in the worktree. All must pass before the phase is considered done.

1. `npm test` — green, all suites pass, including the 4 new `isBlankOrEmpty` cases.
2. `npm run lint` — no errors on `src/index.ts`, `src/utils/validation.ts`, `tests/validation.test.ts`.
3. `npx ts-node src/index.ts --version` — stdout is exactly `fleet-e2e-toy v1.0.0\n`, exit code 0, no server start.
4. `npx ts-node src/index.ts -v` — same as (3).
5. `npx ts-node src/index.ts help` — prints the usage block from T3, exit code 0, no server start.
6. `npx ts-node src/index.ts --help` — same as (5).
7. `npx ts-node src/index.ts -h` — same as (5).
8. `npx ts-node src/index.ts` (no args) — server starts and prints `NoteAPI running on http://localhost:3000` (then Ctrl-C / kill). Run with a short timeout to confirm it binds successfully.
9. `git status` — clean (all changes committed across T1/T2/T3, one commit per task).

If any check fails, fix in place and re-run; do not create variant files.

---

## Self-critique (Phase 3) — addressed in this draft

- **Cohesion / coupling:** Each task touches a distinct surface — T1 = util + test file, T2 = entry file (new argv block), T3 = entry file (extends argv block). T2→T3 coupling is explicit (T3 blocker on T2) and DRY (T3 extends, not rewrites).
- **Vague tasks:** All three tasks include the exact code to write. No interpretation room.
- **Hidden dependency:** T3 depends on T2's argv block — declared in Blockers.
- **Late verification:** Single phase, VERIFY at the natural completion boundary, after all three tasks. Acceptable because the phase is small (3 small tasks).
- **Untracked work:** No "X must also be updated" sentences left dangling. Help-text precedence is documented (decision 6). Blank-arg CLI behaviour is explicitly out of scope (decision 2).
- **Model batching:** All three tasks run on the same model (haiku) — one dispatch, one streak. Combined context is well under haiku's budget (3 small files, ~150 lines total).
- **Phase boundary:** Single phase is correct here — all three tasks share the same reviewable increment ("CLI flags + the validation helper that the sprint groups them with"). Splitting would produce an incoherent intermediate state.

---

## Risk register

- **Risk:** Doer could read `package.json` dynamically for the version string. **Mitigation:** T2 specifies the literal `"fleet-e2e-toy v1.0.0"` — do not import `package.json`.
- **Risk:** Doer could install a CLI parsing library. **Mitigation:** Scope guard in T2 forbids it.
- **Risk:** Doer could rewrite the T2 argv block in T3 instead of extending it. **Mitigation:** T3 description explicitly says "extend the argv block added in T2; do not rewrite it" and shows the final state.
- **Risk:** Help text wording drift. **Mitigation:** T3 pins the exact lines.
