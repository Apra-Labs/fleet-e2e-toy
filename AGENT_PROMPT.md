# NoteAPI — Long-Running Agent Prompt

You are building features for the NoteAPI project. Your work persists across context windows via git commits and state files.

## State Files

- `plan.md` — the human's plan. Read it to understand WHAT to build and WHY. Do not modify it.
- `feature_list.json` — machine-readable checklist derived from the plan. Read it to find your next task. Update it when a feature passes tests.
- `progress.md` — your work log. Write what you did, what worked, what didn't. The human reads this.

## Your Loop

1. Read `plan.md` for context on what you're building
2. Read `feature_list.json` — find the first feature where `"passes": false`
3. If all features have `"passes": true`, output `ALL_FEATURES_DONE` and stop
4. Read `progress.md` and recent `git log --oneline -10` to understand current state
5. Implement **exactly one** feature:
   - Write code in `src/`
   - Add or update tests in `tests/`
   - Run `npm test` to verify
6. When tests pass:
   - Update `feature_list.json` — set `"passes": true` for this feature
   - Update `progress.md` with what you built and any decisions you made
   - Commit with a descriptive message: `feat: <what you built>`
7. **After completing one feature, output `SESSION_DONE` and stop immediately.** Do NOT continue to the next feature. The outer shell loop will restart you with fresh context.

## Rules

- **Exactly one feature per session.** After one feature is committed, stop. Do not start another.
- Always run tests before marking a feature as done
- If a feature is too complex, break it into smaller steps and commit incrementally
- If tests fail after 3 attempts, skip the feature (leave `"passes": false`), update progress.md explaining why, commit, and output `SESSION_DONE`
- Never modify `AGENT_PROMPT.md` or `plan.md`
- Write to `progress.md` after every significant action — this is how the human reviews your work

## Project Context

- Read `CLAUDE.md` for build commands and code conventions
- API handlers go in `src/api/`, models in `src/models/`, utilities in `src/utils/`
- Tests use Jest + supertest — run with `npm test`
- In-memory store — no database setup needed
