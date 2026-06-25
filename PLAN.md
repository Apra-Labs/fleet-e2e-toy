# PLAN.md — CLI Interface for NoteAPI

Sprint branch: `pmlite-e2e/s10-1782346686022` (base `main`)
Worktree: `C:\Users\akhil\AppData\Local\Temp\pmlite-e2e-s10-AygYBA\pmlite-e2e-s10-AygYBA-wt\track-1`

Source issues: gh-toy-qv2 (CRUD), gh-toy-53n (help + validation), gh-toy-ow0 (--version).
Authoritative spec: `requirements.md`.

---

## Architectural Decisions (locked — doers MUST follow)

These decisions are made up front so the doer does not have to rediscover them.

### D1. Dispatch contract (testability)
`src/cli.ts` exports:

```ts
export interface CliIO {
  out?: (s: string) => void;
  err?: (s: string) => void;
}
export async function run(argv: string[], io?: CliIO): Promise<number>;
```

- `argv` is the post-`process.argv.slice(2)` array (the *args*, not the node/script prefix).
- `run` returns an exit code (0 = success, 1 = error). It MUST NOT call `process.exit`.
- Default `io.out = (s) => process.stdout.write(s)`, default `io.err = (s) => process.stderr.write(s)`.
- The file ends with a runnable wrapper:
  ```ts
  if (require.main === module) {
    run(process.argv.slice(2)).then((code) => process.exit(code));
  }
  ```
- Tests import `run` directly and assert on the returned code plus the strings captured by the injected `io` callbacks. No subprocess spawning. No spying on `console.log`.

### D2. Reading the package version
`tsconfig.json` has `rootDir: "./src"`, which blocks `import "../package.json"`. Use:
```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf8")) as { version: string };
```
Output exactly `noteapi/<version>\n` (e.g. `noteapi/1.0.0`).

### D3. Building Note objects for `noteStore.create`
`noteStore.create(note: Note)` requires a full `Note` (id, createdAt, updatedAt). Mirror `src/api/notes.ts`:
- `id` from `uuidv4()` (already a dependency).
- `createdAt = updatedAt = new Date().toISOString()`.
NOTE: the existing `noteStore.update` does not bump `updatedAt`. Do NOT fix that in this sprint — out of scope.

### D4. Flag-name contract (enumerate to avoid drift)
- `create` / `update` use `--title`, `--content`, `--tags` (comma-separated string, e.g. `--tags a,b,c`).
- `list` uses `--tag <single tag>` (singular) and `--search <query>`.
- Tag parsing rule: `value.split(",").map(s => s.trim()).filter(Boolean)`. Apply this to BOTH `create` and `update`.
- `delete` output is `{"deleted": true}` (CLI-specific, not HTTP 204).
- `list --search` re-implements the filter locally (title or content `toLowerCase().includes(query.toLowerCase())`); do NOT route through the Express handler.

### D5. Argument parser scope (T1.1)
Support exactly:
- `--flag value` and `--flag=value`
- Short aliases: `-h` (=`--help`), `-V` (=`--version`)
- Positional args (used for `get <id>`, `update <id>`, `delete <id>`)
- `--help` recognized anywhere on the command line (root or after subcommand)
- Unknown flags MUST produce a clear stderr error and exit code 1
- Missing required flag values (e.g. `--title` with no following value) MUST produce a clear stderr error and exit code 1

Parser returns a typed structure like:
```ts
interface ParsedArgs {
  command?: string;        // e.g. "create" | "list" | "get" | "update" | "delete"
  positional: string[];    // non-flag args after command
  flags: Record<string, string | boolean>;  // bool true for --help/--version, string for --title etc.
  helpRequested: boolean;
  versionRequested: boolean;
}
```
Export the parser as `export function parseArgs(argv: string[]): ParsedArgs` so it can be unit-tested in isolation.

### D6. Validation reuse
- For `create`: build `{ title, content, tags }` from flags, pass to `validateCreateInput`. `--content` is required (the validator rejects non-string).
- For `update`: construct the input object containing ONLY the flags actually provided (omit unset fields entirely so partial-update semantics are preserved), then pass to `validateUpdateInput`.
- On validation failure: print one line per error to stderr in the form `Error: <field>: <message>` and return exit code 1. Do NOT print JSON error bodies.

### D7. Error format on stderr
Every error written to stderr ends with `\n`. Format:
- Validation: `Error: <field>: <message>\n`
- Not found: `Error: Note not found: <id>\n`
- Unknown command: `Error: Unknown command: <name>\n` followed by root help on stdout, exit 1
- Unknown flag: `Error: Unknown flag: <flag>\n`, exit 1
- Missing flag value: `Error: Missing value for flag: <flag>\n`, exit 1

### D8. stdout output format
- `create`, `get`, `update`: `JSON.stringify(note, null, 2) + "\n"`.
- `list`: `JSON.stringify(notes, null, 2) + "\n"` (always an array, possibly empty).
- `delete`: `JSON.stringify({ deleted: true }) + "\n"` (no need to indent a one-key object — but indenting is fine too; pick `JSON.stringify({ deleted: true })` for compactness).
- `--version`: `noteapi/1.0.0\n`.
- `--help`: multi-line human-readable text (see D9), terminated with a single `\n`.

### D9. Help text shape
Root help (`note --help` or `note -h`):
```
Usage: note <command> [options]

Commands:
  create   Create a new note
  list     List notes (optionally filter by tag or search)
  get      Get a single note by ID
  update   Update fields of an existing note
  delete   Delete a note by ID

Global flags:
  -h, --help     Show help for a command
  -V, --version  Print version and exit
```

Subcommand help (`note <cmd> --help`) lists each flag with `(required)` / `(optional)` and a one-line description. Exit code 0.

### D10. package.json scripts addition
Add `"cli": "ts-node src/cli.ts"` to the `scripts` section so `npm run cli -- create --title X --content Y` works. Do this in its own tiny Phase 1 task.

---

## Phase 1 — Foundations: parser + entry-point skeleton

### T1.1 — Implement and export `parseArgs`
- Model: `claude-sonnet-4-6`
- File: `src/cli.ts` (start the file with the parser; no commands yet)
- Implement `parseArgs(argv: string[]): ParsedArgs` per D5.
- Tokenize: first non-flag token = `command`; everything after = positional/flag stream.
- Accept `--flag value`, `--flag=value`, `-h`, `-V`, `--help`, `--version`.
- Reject unknown flag tokens by THROWING a typed error (`class CliError extends Error { code = 1 }`) caught by `run`; do not write to stderr from inside the parser itself (keeps it pure).
- No external libraries.
- No tests yet — Phase 4 covers tests.

### T1.2 — Implement `run` skeleton + entry-point wrapper
- Model: `claude-sonnet-4-6`
- File: `src/cli.ts` (add below the parser)
- Export `async function run(argv, io?)` per D1 with default IO writers.
- Wrap parser in try/catch — on `CliError` write `error.message + "\n"` to stderr and return `error.code`.
- Dispatcher skeleton: switch on `parsed.command` with cases for `create`, `list`, `get`, `update`, `delete`. Each case is a TODO `throw new Error("not implemented")` for now — Phase 2 fills them in.
- Handle `parsed.helpRequested` and `parsed.versionRequested` early with TODO stubs that just return 0 (Phase 3 fills these in).
- Add the `if (require.main === module)` runnable wrapper.
- Confirm `tsc` compiles the file with no errors.

### T1.3 — Add `cli` script to package.json
- Model: `claude-haiku-4-5`
- File: `package.json`
- Insert `"cli": "ts-node src/cli.ts"` into the `scripts` block (alphabetical-ish placement: after `build`, before `dev`, is fine — match existing style).
- Do not modify any other field.

### T1.4 — VERIFY Phase 1
- Model: `claude-haiku-4-5`
- Run, from worktree root, in order:
  - `npm run build`
  - `npm run lint`
  - `npm test`
- All must pass. (No new tests yet; existing notes/validation tests must remain green.) Also run `npm run cli -- --help` and confirm it exits 0 (help stub returns 0). If any step fails, stop and report — do not advance to Phase 2.

---

## Phase 2 — CRUD commands wired to noteStore

All Phase 2 tasks edit `src/cli.ts` only.

### T2.1 — Implement `create`
- Model: `claude-sonnet-4-6`
- Read `--title`, `--content`, `--tags` (comma-split per D4) from `parsed.flags`.
- Build `{ title, content, tags }` (tags defaults to `[]` when flag absent).
- Pass through `validateCreateInput` (per D6).
- On valid: build full Note (id=uuidv4, timestamps per D3), call `noteStore.create`, print indented JSON to stdout, return 0.
- On invalid: emit each error to stderr per D7, return 1.

### T2.2 — Implement `list`
- Model: `claude-sonnet-4-6`
- Start with `noteStore.getAll()`.
- If `--tag <tag>` present: filter to notes containing that tag (`n.tags.includes(tag)`).
- If `--search <q>` present: filter title+content case-insensitive substring (per D4).
- Print indented JSON array, return 0.

### T2.3 — Implement `get`, `update`, `delete`
- Model: `claude-sonnet-4-6`
- `get <id>`: positional[0] is id; `noteStore.getById(id)`; if undefined emit not-found error per D7 and return 1; else print indented JSON, return 0.
- `update <id>`: build update payload from ONLY provided flags (per D6); call `validateUpdateInput`; on invalid return 1 with stderr errors; if note not found return 1 with not-found error; otherwise `noteStore.update(id, data)` and print result.
- `delete <id>`: `noteStore.delete(id)` — if false, not-found error and return 1; else print `{"deleted":true}\n` and return 0.
- Missing positional id (e.g. `note get` with nothing after): error `Error: Missing required argument: id\n`, return 1.

### T2.4 — VERIFY Phase 2
- Model: `claude-haiku-4-5`
- `npm run build` && `npm run lint` && `npm test` — all green.
- Smoke test via `npm run cli -- create --title T --content C --tags a,b` and confirm JSON is printed and exit code is 0 (`echo $LASTEXITCODE` on PowerShell).

---

## Phase 3 — Help system + --version flag

### T3.1 — Wire `--version` / `-V`
- Model: `claude-haiku-4-5`
- In `run`, when `parsed.versionRequested` is true: read `package.json` per D2 and write `noteapi/${pkg.version}\n` to stdout, return 0.
- `-V` and `--version` both work; recognized BEFORE command dispatch (so `note --version` works with no command).

### T3.2 — Wire root and subcommand `--help`
- Model: `claude-haiku-4-5`
- Root help (no command OR `--help`/`-h` with no command): print text in D9 to stdout, return 0.
- Subcommand help (`note <cmd> --help`): print a per-command usage block listing flags with required/optional markers. Examples:
  - `create`: `--title <title> (required)`, `--content <content> (required)`, `--tags <a,b,c> (optional)`
  - `list`: `--tag <tag> (optional)`, `--search <query> (optional)`
  - `get`: `<id> (required positional)`
  - `update`: `<id> (required positional)` + same flags as create but all optional
  - `delete`: `<id> (required positional)`
- Exit code 0.

### T3.3 — VERIFY Phase 3
- Model: `claude-haiku-4-5`
- `npm run build` && `npm run lint` && `npm test`.
- Manual smoke: `npm run cli -- --version`, `npm run cli -- --help`, `npm run cli -- create --help` — each prints expected text and exits 0.

---

## Phase 4 — Test suite

### T4.1 — Write `tests/cli.test.ts`
- Model: `claude-sonnet-4-6`
- File: `tests/cli.test.ts` (new).
- Use the same Jest setup as existing tests (no new config).
- `beforeEach(() => noteStore.clear())` — per requirement risk note #3.
- Helper inside the test file:
  ```ts
  async function invoke(argv: string[]) {
    const out: string[] = [];
    const err: string[] = [];
    const code = await run(argv, { out: (s) => out.push(s), err: (s) => err.push(s) });
    return { code, stdout: out.join(""), stderr: err.join("") };
  }
  ```
- Required coverage (each a separate `it`):
  1. `create` happy path — exit 0, stdout parses to a Note with the supplied title.
  2. `create` missing `--title` — exit 1, stderr contains `title`.
  3. `create` missing `--content` — exit 1, stderr contains `content`.
  4. `list` empty — exit 0, stdout is `[]\n` (after JSON.parse: empty array).
  5. `list` with notes + `--tag` filter — only matching notes returned.
  6. `list` with `--search` — case-insensitive substring match on title and content.
  7. `get <id>` happy path — returns the note.
  8. `get <missing-id>` — exit 1, stderr mentions not found.
  9. `update <id> --title X` — exit 0, title changed, content preserved.
  10. `update <missing-id>` — exit 1, stderr mentions not found.
  11. `update <id>` with invalid (empty) title — exit 1, stderr mentions title.
  12. `delete <id>` happy path — exit 0, stdout JSON has `deleted: true`; subsequent `get` returns not-found.
  13. `delete <missing-id>` — exit 1.
  14. `--version` — exit 0, stdout starts with `noteapi/`.
  15. `-V` short flag — same as `--version`.
  16. `--help` root — exit 0, stdout lists all five subcommands.
  17. `create --help` — exit 0, stdout mentions `--title` and `--content`.
  18. Unknown command (`note frobnicate`) — exit 1, stderr mentions `Unknown command`.
  19. Unknown flag (`note list --bogus x`) — exit 1, stderr mentions `Unknown flag`.
- Tests must NOT spawn subprocesses; they import `run` from `../src/cli`.
- Tests must NOT spy on `console.log` — use the injected `io` callbacks.

### T4.2 — VERIFY Phase 4 (final)
- Model: `claude-haiku-4-5`
- `npm run build` && `npm run lint` && `npm test`.
- Confirm new `tests/cli.test.ts` runs and all 19 specs pass.
- Confirm pre-existing `tests/notes.test.ts` and `tests/validation.test.ts` remain green.
- If lint complains about `any`, fix at source (no `any` per requirements line 68).

---

## Self-critique (issues considered and resolved)

- **Q: Could the parser swallow positional ids that start with `-`?** A: Acceptable — UUIDs do not start with `-`. Document if it ever matters.
- **Q: Does `validateCreateInput` accept an empty-string content?** A: Yes (only rejects non-string). Requirements say "content must not be empty on create" — add a CLI-side check in T2.1: if `--content` flag present but value is empty string, treat as validation error. The doer should call `validateCreateInput` and ALSO add this guard.
- **Q: `noteStore.update` does not bump `updatedAt`.** A: Known existing bug, out of scope, leave alone.
- **Q: Reading `package.json` at runtime in tests?** A: Works fine — test invokes `run(["--version"])` and the file exists alongside.
- **Q: Will `tsc --rootDir src` reject `tests/cli.test.ts` import of `src/cli`?** A: `tsconfig.json` excludes `tests/`; tests are compiled by `ts-jest` separately, which is fine — same pattern as existing tests.
- **Q: ESLint `no-unused-vars`?** A: Already configured to ignore `_` prefix; doer uses that convention if needed.

## Critical files for implementation
- `src/cli.ts` (NEW — the entire CLI)
- `tests/cli.test.ts` (NEW — full test suite)
- `package.json` (MODIFIED — add `cli` script only)
- `src/utils/validation.ts` (READ — reuse validators)
- `src/models/note.ts` (READ — Note interface and noteStore)
