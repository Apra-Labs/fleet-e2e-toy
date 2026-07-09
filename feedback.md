CHANGES NEEDED

## Notes

1. **Criterion 9 (bd ready check) — FAILS, hard blocker.** `bd ready` returns
   `gh-toy-k0w` (the sprint root/container issue) as ready work alongside
   `gh-toy-k0w.1`. A sprint-goal/feature container must never itself be
   directly actionable — its "readiness" should be gated by its children.
   Misplaced ID: **gh-toy-k0w**.
   Fix: add an explicit blocking dependency from the sprint root onto its
   terminal task so it cannot surface as ready until the sprint's work is
   done, e.g.:
   ```
   bd dep add gh-toy-k0w gh-toy-k0w.10
   ```
   (equivalently `bd dep gh-toy-k0w.10 --blocks gh-toy-k0w`). Re-run
   `bd ready` afterward and confirm gh-toy-k0w no longer appears.

2. **Duplicate-work risk (criterion 7) — not a new duplicate created by this
   plan, but worth reconciling.** `gh-toy-13t` ("Add input validation for
   empty or blank strings", ref gh-toy-v6z) is an existing open backlog issue
   that describes essentially the same behavior as `gh-toy-k0w.8` (reject
   empty/whitespace-only required flags, non-zero exit, unit test). It is not
   wired into the `gh-toy-k0w` DAG at all, so once `gh-toy-k0w.8` ships,
   `gh-toy-13t` will be redundant. Recommend either linking it as a duplicate
   or closing it once `gh-toy-k0w.8` lands:
   ```
   bd duplicate gh-toy-13t gh-toy-k0w.8
   ```
   This is not blocking for this sprint's DAG (13t was never made a
   dependency of anything in `gh-toy-k0w`), but flag it so it doesn't linger
   as stale duplicate backlog.

3. **Coverage (criterion 1) — passes.** All three source issues are fully
   covered: gh-toy-mi2 (CRUD) ← gh-toy-k0w.1–6,10; gh-toy-7rp (help+validation)
   ← gh-toy-k0w.7,8,10; gh-toy-4ef (--version) ← gh-toy-k0w.9,10. Each source
   feature correctly `DEPENDS ON` its implementing tasks rather than the other
   way around.

4. **Test tasks (criterion 2) — passes.** A single `[test]` task,
   `gh-toy-k0w.10`, is downstream of every impl task (1–9) and is a
   dependency of all three source features, satisfying "every feature has at
   least one test task." Note its scope is broad (5 subcommands + help +
   version + validation, all in one file/task) — not a blocking problem since
   it is still confined to one new file (`tests/cli.test.ts`), but worth
   awareness if it needs to be split for parallel execution later.

5. **Acceptance criteria (criterion 3) — passes.** Every task
   (gh-toy-k0w.1–10) has concrete, testable acceptance criteria in the
   ACCEPTANCE CRITERIA field (endpoints hit, exit codes, stdout/stderr
   routing, error format). None rely on vague language.

6. **Task size (criterion 4) — passes, with one note.** All tasks touch only
   `src/cli.ts` (impl tasks) or only `tests/cli.test.ts` (test task) — never
   more than 1 file. `gh-toy-k0w.1` (foundation: argv parsing + HTTP client +
   central error/dispatch runner) bundles multiple responsibilities into one
   task; it stays within the 1-file guidance but is the largest/most
   non-trivial task in the set (bucketed L below).

7. **Dependency wiring (criterion 5) — passes.** `gh-toy-k0w.10` (test) is
   downstream of all impl tasks (1–9), not parallel to them. The three source
   features (mi2/7rp/4ef) depend on their respective impl tasks plus the test
   task, so features close only after implementation and tests land.

8. **No scope creep (criterion 6) — passes.** Every child of `gh-toy-k0w`
   maps directly to one of the three source issues' acceptance criteria (CLI
   CRUD, help/validation, --version). None of the other open backlog features
   visible via `bd ready` (gh-toy-24g config file, gh-toy-69s SIGINT handling,
   gh-toy-aqd --json flag, gh-toy-s5k tag filtering endpoint) were pulled into
   this sprint's DAG — correctly out of scope per requirements.md.

9. **Feasibility (criterion 8) — passes.** `gh-toy-k0w.1` (foundation) is
   correctly Layer 0 and blocks every other impl task; no task assumes
   argv-parsing/HTTP-client scaffolding that hasn't been built yet by an
   earlier task.

10. **Model metadata (criterion 10) — passes.** Every task (gh-toy-k0w.1–10)
    has a `model:` note set (no fallback needed).

## Task Assignments

[
  {"id":"gh-toy-k0w.1","bucket":"L","model":"standard"},
  {"id":"gh-toy-k0w.2","bucket":"M","model":"standard"},
  {"id":"gh-toy-k0w.3","bucket":"M","model":"cheap"},
  {"id":"gh-toy-k0w.4","bucket":"M","model":"standard"},
  {"id":"gh-toy-k0w.5","bucket":"M","model":"standard"},
  {"id":"gh-toy-k0w.6","bucket":"M","model":"cheap"},
  {"id":"gh-toy-k0w.7","bucket":"M","model":"standard"},
  {"id":"gh-toy-k0w.8","bucket":"M","model":"standard"},
  {"id":"gh-toy-k0w.9","bucket":"S","model":"cheap"},
  {"id":"gh-toy-k0w.10","bucket":"M","model":"standard"}
]
