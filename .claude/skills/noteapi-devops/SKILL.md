# NoteAPI DevOps Skill

Check CI/CD pipeline status, diagnose build failures, and summarize results for the NoteAPI project.

---

## When To Use This Skill

Use this skill when asked to:
- Check if the latest CI pipeline passed or failed
- Diagnose build or test failures from CI logs
- Summarize pipeline run results
- Monitor deployment status

## Pipeline Structure

The NoteAPI project uses GitHub Actions (`.github/workflows/ci.yml`):

```
CI Pipeline Steps:
1. Checkout code
2. Setup Node.js (v20)
3. Install dependencies (npm ci)
4. Run linter (npm run lint)
5. Run tests (npm test)
6. Build TypeScript (npm run build)
```

## How To Check Pipeline Status

1. Use `gh run list --limit 5` to see recent workflow runs
2. Use `gh run view <run-id>` to see details of a specific run
3. Use `gh run view <run-id> --log-failed` to see logs from failed steps

## Interpreting Failures

| Failed Step | Likely Cause | Fix |
|------------|-------------|-----|
| Install dependencies | Lock file mismatch or registry issue | Run `npm ci` locally, check `package-lock.json` |
| Run linter | Code style violation | Run `npm run lint:fix` locally |
| Run tests | Test assertion failure or runtime error | Run `npm test` locally, check test output |
| Build TypeScript | Type error | Run `npm run build` locally, fix type errors |

## Reporting Format

When reporting pipeline status, use this format:
```
Pipeline: [PASS/FAIL]
Run: #<number> (<commit-sha>)
Triggered: <timestamp>
Duration: <time>
Failed step: <step-name> (if applicable)
Error summary: <1-2 line summary> (if applicable)
```
