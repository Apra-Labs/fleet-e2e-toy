# NoteAPI

REST API for managing notes with tags and search. Node.js + Express + TypeScript, in-memory store.

## Commands
- `npm test` — run all tests (Jest)
- `npm run test:coverage` — run tests with coverage report
- `npm start` — start server on port 3000
- `npm run lint` — check for lint errors
- `npm run lint:fix` — auto-fix lint errors
- `npm run build` — compile TypeScript to dist/

 ## Skills
  - **noteapi-devops** (`.claude/skills/noteapi-devops/SKILL.md`) — CI/CD pipeline diagnostics via GitHub Actions.

## Code Conventions
- All API handlers go in `src/api/` — one file per resource
- Validate inputs before processing — use helpers from `src/utils/validation.ts`
- Never return raw error objects to the client — wrap in `{ error: "message" }`
- Use `res.status(code).json(...)` — never `res.send()` for API responses
- Tests use supertest against the Express app (not a running server)

## What NOT To Do
- No `console.log` in route handlers — use structured responses
- No `any` types — use proper interfaces from `src/models/`
- Don't install a database — the in-memory store is intentional


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ccf33ec3 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->


