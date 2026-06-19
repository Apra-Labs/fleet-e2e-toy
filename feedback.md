# Review Feedback

Reviewed impl commit a3b67fc (cleanly maps to the four tasks). Build, lint, and full test suite (31 tests) all pass. CLI exercised end-to-end. Three of four tasks meet acceptance criteria; one has a correctness defect.

## CHANGES NEEDED — gh-toy-9oh (reopened):

- `C:/akhil/git/fleet-e2e-toy/src/cli/apiClient.ts` uses the wrong resource path. The Express app mounts the notes router at "/api/notes" (`C:/akhil/git/fleet-e2e-toy/src/app.ts:7`), but every apiClient function calls `"${BASE_URL}/notes"` / `"${BASE_URL}/notes/${id}"` (apiClient.ts lines 19, 27, 32, 44, 53). With the default NOTEAPI_URL of http://localhost:3000 this hits http://localhost:3000/notes, which is unmounted and returns 404. The task requires the 5 functions to call the NoteAPI; as written, every call throws on a non-2xx 404 against the real server. Fix: target `"${BASE_URL}/api/notes"` (and "/api/notes/${id}"). The base URL/env handling, typing (imports Note/CreateNoteInput/UpdateNoteInput from src/models/note), the 5 exported functions, throw-on-non-2xx behavior, and the package.json bin entry are all otherwise correct.

## APPROVED items (no action needed):

- **gh-toy-yxd (help system)**: help.ts + index.ts wiring correct. "noteapi --help", "-h", "create --help", and no-args all print correct usage and exit 0; help text lists all 5 subcommands; no stack traces. Verified by running dist/cli/index.js.

- **gh-toy-674 (validate helpers)**: src/cli/validate.ts isBlank/validateRequired exactly match acceptance criteria. tests/cli/validate.test.ts covers empty, whitespace-only, tab, undefined, and valid cases (10 tests, all pass). No 'any'. Scope respected (validate.ts + test only).

- **gh-toy-2kj (--version)**: version.ts getVersion() reads package.json (path resolves correctly from both dist/cli and src/cli). "noteapi --version", "-v", and "list --version" all print "fleet-e2e-toy v1.0.0" and exit 0. Verified end-to-end.

## File Hygiene

All src/cli/* and tests/cli/* changes in the impl commit are justified by the four tasks. The .codex/, .agents/, feedback.md, .beads/hooks, and .gitignore changes in the branch diff come from separate tooling/feedback/bd-init commits, not from the four tasks under review — out of scope, not flagged. Working tree only dirty in .beads/issues.jsonl and .beads/interactions.jsonl (bd metadata).

## Note

bd auto-export to .beads/issues.jsonl is currently blocked (36 JSONL-only records absent from the Dolt store); the gh-toy-9oh reopen succeeded in the Dolt store but did not export to JSONL.
