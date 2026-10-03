# Changelog

## Unreleased — CLI `--version` flag

Added a `--version` / `-v` flag to the entrypoint: it prints `fleet-e2e-toy v1.0.0` and
exits 0 without starting the server. Added `tests/version.test.ts` covering both flags, a
mixed argv, and the no-flag path (process-group cleanup prevents orphaned servers). Test
suite is now 25 tests across 3 suites.

Budget ceiling: not set (no --budget flag) -- unlimited for this run.
Tracked spend (priced dispatches only): $1.5322.
Remaining budget: unknown/unbounded.
Integ-test-runner spend: $0.0170 across 1 dispatch(es) this sprint (a subset of the tracked spend above, broken out of overhead/doer/reviewer).
Pricing source: all 9 priced dispatch(es) used real per-member rates (get_member_model_pricing).
Note: dispatches using an unpriced model id are not reflected above (see N10, feedback-reassessment.md) -- this figure is a lower bound on actual spend, not a complete total, and is reported honestly rather than fabricated.

Carried forward: make the no-flag server-start test wait for the startup line instead of a
fixed timer (open P3 backlog item).
