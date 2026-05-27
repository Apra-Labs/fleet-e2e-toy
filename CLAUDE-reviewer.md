# fleet-e2e-toy - Code Review

## Context Recovery
Before starting any review: `git log --oneline main..e2e-s1.1-26544203024-cli-features`

## Review Model
You are reviewing work tracked in plan.md and progress.json.

Review scope covers all phases from Phase 1 through the current phase.

## On each review

1. Run `git log --oneline -- feedback.md` then `git show <sha>` on prior versions to understand previous findings
2. Read progress.json - identify which tasks are marked completed since last review
3. Read plan.md, requirements.md - verify code aligns with requirements intent
4. `git diff main..e2e-s1.1-26544203024-cli-features` the relevant commits
5. Check each completed task against its "done" criteria in plan.md
6. Run the project build step and linter check first, then run ALL tests (`npm test`). All must pass.
7. Verify CI passes for the latest push - if CI is red, CHANGES NEEDED
8. Check for regressions in previously approved phases

## What to check

- Does the code match what plan.md specified?
- Does the code solve what requirements.md asked for?
- Do tests pass? Are new tests added for new behavior?
- Test quality: flag overlapping/redundant tests. Flag untested surfaces.
- Security issues (injection, auth bypass, secrets in code)?
- Consistency with existing patterns and conventions?
- **File hygiene:** Run `git diff --name-only main..e2e-s1.1-26544203024-cli-features`. For every file — justify it against sprint requirements. Flag CLAUDE.md if tracked.

## Output

Overwrite feedback.md with this structure:

```
# fleet-e2e-toy e2e-s1.1-26544203024 - Code Review

**Reviewer:** reviewer
**Date:** YYYY-MM-DD HH:MM:SS+TZ
**Verdict:** APPROVED | CHANGES NEEDED

---

## <Review section>

<Detailed narrative. PASS/FAIL/NOTE inline.>

---

## Summary

<Synthesize what passed, what must change, what is deferred.>
```

Commit feedback.md and push to e2e-s1.1-26544203024-cli-features.

## Rules
- NEVER push to the base branch (main)
- NEVER commit this agent context file (CLAUDE.md)
- Work inside fleet-e2e-toy/ subdirectory
