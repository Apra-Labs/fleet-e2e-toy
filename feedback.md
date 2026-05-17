# fleet-e2e-toy — Code Review

**Reviewer:** reviewer
**Date:** 2026-05-17
**Verdict:** CHANGES NEEDED

> See the recent git history of this file to understand the context of this review.

---

## Missing Dependencies in `package.json`

**FAIL:** The `src/cli.ts` file imports `yargs` and `yargs/helpers`. While your `PLAN.md` risk register notes that `yargs` is already present in `node_modules` (as a transitive dependency of `jest-cli`), relying on a transitive development dependency for runtime application logic is a critical anti-pattern. It will cause compilation and execution to fail in a clean environment where `devDependencies` are not installed, or if the testing framework is changed in the future.

Please explicitly install `yargs` as a dependency and `@types/yargs` as a development dependency, and commit the updated `package.json` and `package-lock.json`.

## Phase 1 Execution & Scripts

**PASS:** The `src/cli.ts` entry point is correctly initialized. The wrapper scripts `tool` and `tool.cmd` have been created and successfully invoke the CLI entry point using `ts-node`. Execution of `./tool` exits with 0 without error.

## File Hygiene

**PASS:** The committed files (`src/cli.ts`, `tool`, `tool.cmd`, `.gitignore`, `PLAN.md`, `progress.json`, `feature_list.json`) align correctly with the sprint requirements. No tracked agent context files or scratch files were committed.

*(Note: There is an untracked `fleet-e2e-toy/` directory in your workspace, which is fine since it isn't committed, but you may want to clean it up).*

---

## Summary

The core initialization of the CLI and wrapper scripts works well. However, explicit dependency management is required. Please add `yargs` to `dependencies` and `@types/yargs` to `devDependencies`, then request a re-review.
